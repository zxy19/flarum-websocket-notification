<?php

namespace Xypp\WsNotification\Websockets\Worker;

use Flarum\Settings\SettingsRepositoryInterface;
use GuzzleHttp\Psr7\Uri;
use WebSocket\Message\Text;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\AddrUtil;
use Xypp\WsNotification\WebsocketAccessToken;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\Websockets\Helper\Logger;
use Illuminate\Console\Command;

class Worker
{
    protected $settings;
    protected ?\Websocket\Client $connection = null;
    protected Logger $logger;
    protected DataDispatchHelper $dataDispatchHelper;
    protected int $lastPing;
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
        $this->connection = new \WebSocket\Client($uri);
        $this->connection->setLogger($this->logger);
        $this->connection->onClose(function () {
            $this->logger->error("Connection closed");
        });
        $this->connection->onText(
            function ($client, $connection, $message) {
                $this->message($client, $connection, $message);
            }
        );
        $this->connection->onConnect(
            function () {
                $this->logger->verbose("Connected");
                $this->connection->send(new Text(json_encode([
                    "type" => "worker"
                ])));
            }
        );
        $this->connection->onTick(
            function () {
                if (time() - $this->lastPing > 30) {
                    $this->connection->send(new Text(json_encode([
                        "type" => "ping"
                    ])));
                    $this->lastPing = time();
                }
            }
        );
        $this->connection->start();
    }
    public function message($client, $connection, $message)
    {
        $data = json_decode($message->getContent());
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
                    function ($attr) use ($ids, $path, $state) {
                        if ($state && !$attr) {
                            $attr = ["state" => true];
                        }
                        $this->connection->send(new Text(json_encode([
                            "type" => "dispatch",
                            "ids" => $ids,
                            "data" => [
                                "type" => "sync",
                                "path" => strval($path),
                                "data" => $attr
                            ]
                        ])));
                    }
                );
            }
        }
    }
}