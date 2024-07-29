<?php

namespace Xypp\WsNotification\Websockets;

use Flarum\Http\RequestUtil;
use Phrity\Net\SocketServer;
use Phrity\Net\Uri;
use Psr\Http\Message\ServerRequestInterface;
use WebSocket;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Helper\DataDispatchHelper;
use Xypp\WsNotification\Websockets\Util\ConnectionManager;
use Xypp\WsNotification\Websockets\Util\ServerUtil;
use Xypp\WsNotification\Websockets\Util\SubscribeManager;
use Illuminate\Console\Command;

class MainWebsocket
{
    protected $server;
    protected $internal;
    protected int $id = 0;
    protected array $subscribe = [];
    protected array $middlewares = [];
    protected array $middlewaresInternal = [];
    protected DataDispatchHelper $helper;
    protected SubscribeManager $subscribeManager;
    protected ConnectionManager $connectionManager;
    protected Command $commandContext;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
    }
    public function start(Command $context, WebsocketConfig $config, WebsocketConfig $internalConfig)
    {
        $this->commandContext = $context;
        $this->commandContext->info("Preparing server...");
        $this->server = ServerUtil::makeServer($config);
        $this->internal = ServerUtil::makeServer($internalConfig);
        $this->registerServerCallbacks($this->server);
        $this->registerServerCallbacks($this->internal);

        $this->commandContext->info("Starting server on {$config->address}:{$config->port}");
        $this->commandContext->info("Starting internal server on {$internalConfig->address}:{$internalConfig->port}");

        while ($this->server->isRunning() || $this->internal->isRunning()) {
            $read = [];
            $read = array_merge($read, $this->server->collect());
            $read = array_merge($read, $this->internal->collect());
            if (!empty($read)) {
                $write = $oob = [];
                stream_select($read, $write, $oob, 5);
            }

            $this->server->loop($read);
            $this->internal->loop($read);
            gc_collect_cycles();
        }
    }
    public function registerServerCallbacks(WebsocketServerSplit $server)
    {
        $server
            ->onText(function (WebsocketServerSplit $server, WebSocket\Connection $connection, WebSocket\Message\Message $message) {
                $this->message($server, $connection, $message);
            })
            ->onHandshake(
                function (WebsocketServerSplit $server, WebSocket\Connection $connection, ServerRequestInterface $request, \Psr\Http\Message\ResponseInterface $respone) {
                    if ($this->connectionManager->add($connection, $request)) {
                        $this->commandContext->info("New connection: {$connection->getMeta('id')};UserId:{$connection->getMeta('user_id')}");
                    }
                }
            )
            ->onClose(function (WebsocketServerSplit $server, WebSocket\Connection $connection) {
                $id = $connection->getMeta('id');
                $this->subscribeManager->unsubscribe($id);
                $this->connectionManager->remove($id);
                $this->commandContext->info("Connection closed: {$connection->getMeta('id')}");
            })
            ->start();
    }
    public function message(WebsocketServerSplit $server, WebSocket\Connection $connection, WebSocket\Message\Message $message)
    {
        $this->commandContext->info("Message({$connection->getMeta('id')}): {$message->getContent()}");
        $data = json_decode($message->getContent());
        if (!$data)
            return;
        $id = $connection->getMeta('id');
        if ($data->type == 'sync') {//Internal command.
            if (!$connection->getMeta("internal"))
                return;
            $path = new ModelPath($data->path);
            $this->performSync($path);
        } else if ($data->type == 'subscribe') {//Set subscribe.
            $this->subscribeManager->unsubscribe($id);
            $paths = $data->path;
            if (!is_array($paths))
                $paths = [$paths];
            foreach ($paths as $path) {
                $path = new ModelPath($path);
                $r = $this->subscribeManager->subscribe($id, $path);

                if ($r) {
                    $this->commandContext->info("Subscribe({$id}):{$path}");
                } else {
                    $this->commandContext->info("Subscribe({$id}):{$path} rejected.");
                }
            }
        }
    }

    protected function performSync(ModelPath $path)
    {
        $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }
        $model = $this->helper->getModelByPath($path);
        if (!$model) {
            return;
        }
        $idGrped = $this->connectionManager->groupIdByUser($ids);
        $dispatchType = $this->helper->getDispatchType($path->getName());
        if (!$dispatchType)
            return;
        foreach ($idGrped as $user_id => $ids) {
            if (!$user_id)
                $user_id = null;
            $dispatchType->deliver(
                $user_id,
                $path,
                $model,
                function ($attr) use ($ids, $path) {
                    $this->connectionManager->broadcast($ids, json_encode([
                        "type" => "sync",
                        "path" => strval($path),
                        "data" => $attr
                    ]));
                }
            );
        }
    }
}