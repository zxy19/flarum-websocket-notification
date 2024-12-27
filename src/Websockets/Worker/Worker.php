<?php

namespace Xypp\WsNotification\Websockets\Worker;

use Flarum\Settings\SettingsRepositoryInterface;
use GuzzleHttp\Psr7\Uri;
use Ratchet\Client\WebSocket;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\AddrUtil;
use Xypp\WsNotification\WebsocketAccessToken;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\Websockets\Helper\Logger;
use Illuminate\Console\Command;
use function React\Async\await;

class Worker
{
    protected $settings;
    protected Logger $logger;
    protected DataDispatchHelper $dataDispatchHelper;
    public function __construct(SettingsRepositoryInterface $settings, Logger $logger, DataDispatchHelper $dataDispatchHelper)
    {
        $this->settings = $settings;
        $this->logger = $logger;
        $this->dataDispatchHelper = $dataDispatchHelper;
        $this->lastPing = time();
    }
    public function start(Command $context)
    {
        $this->logger->setCommandContext($context);
        $token = WebsocketAccessToken::generate(null, 10, true);
        $uri = new Uri(AddrUtil::getAddr($this->settings, $token, true));
        $loop = \React\EventLoop\Factory::create();
        await(
            \Ratchet\Client\connect($uri, [], [], $loop)
                ->then(function (WebSocket $connection) use ($loop) {
                    $this->logger->verbose("Connected");
                    $connection->send(json_encode([
                        "type" => "worker"
                    ]));
                    $connection->on("close", function () {
                        $this->logger->error("Connection closed");
                    });
                    $connection->on(
                        "message",
                        function (\Ratchet\RFC6455\Messaging\MessageInterface $message) use ($connection) {
                            $this->message($connection, $message);
                        }
                    );
                    $loop->addPeriodicTimer(
                        30,
                        function () use ($connection) {
                            $connection->send(json_encode([
                                "type" => "ping"
                            ]));
                        }
                    );
                })
        );
    }
    public function message($connection,string $message)
    {
        $data = json_decode($message);
        if (!$data)
            return;
        if ($data->type == "job") {
            $this->logger->verbose("Received job: " . $data->path);
            $this->logger->verbose("job ids: " . json_encode($data->ids));
            $path = new ModelPath($data->path);
            $idGrped = $data->ids;
            $type = $this->dataDispatchHelper->getDispatchType($path->getName());
            $state = $data->state;
            if (!$type && $data->state) {
                $type = $this->dataDispatchHelper->getDispatchType("state");
            }
            $model = $type->getModel($path);
            foreach ($idGrped as $user_id => $ids) {
                if (!$user_id)
                    $user_id = null;
                $type->deliver(
                    $user_id,
                    $path,
                    $model,
                    function ($attr) use ($ids, $path, $state, $connection) {
                        if ($state && !$attr) {
                            $attr = ["state" => true];
                        }
                        $connection->send(json_encode([
                            "type" => "dispatch",
                            "ids" => $ids,
                            "data" => [
                                "type" => "sync",
                                "path" => strval($path),
                                "data" => $attr
                            ]
                        ]));
                    }
                );
            }
            $connection->send(json_encode([
                "type" => "job_done",
                "job_id" => $data->job_id
            ]));
        }
    }
}