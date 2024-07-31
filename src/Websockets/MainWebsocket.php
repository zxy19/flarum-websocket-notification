<?php

namespace Xypp\WsNotification\Websockets;

use Flarum\Http\RequestUtil;
use Phrity\Net\SocketServer;
use Phrity\Net\Uri;
use Psr\Http\Message\ServerRequestInterface;
use WebSocket;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Websockets\Util\ServerUtil;
use Xypp\WsNotification\Websockets\Class\WebsocketServerSplit;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\Websockets\Helper\ConnectionManager;
use Xypp\WsNotification\Websockets\Helper\StateManager;
use Xypp\WsNotification\Websockets\Helper\SubscribeManager;
use Xypp\WsNotification\Websockets\Helper\SyncManager;
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
    protected StateManager $stateManager;
    protected SyncManager $syncManager;
    protected Command $commandContext;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager,
        StateManager $stateManager,
        SyncManager $syncManager
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
        $this->stateManager = $stateManager;
        $this->syncManager = $syncManager;
    }
    public function start(Command $context, WebsocketConfig $config, WebsocketConfig $internalConfig)
    {
        $this->stateManager->clear();
        $this->connectionManager->clear();
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
            ->onClose(function (WebsocketServerSplit $server, WebSocket\Connection $connection) {
                $id = $connection->getMeta('id');
                $user_id = $this->connectionManager->user($id);
                if ($user_id) {
                    $releases = $this->stateManager->getDisconnectReleased($user_id);
                    foreach ($releases as $path) {
                        $this->syncManager->performReleasing($path);
                    }
                }
                $this->subscribeManager->unsubscribe($id);
                $this->connectionManager->remove($id);
                $this->commandContext->info("Connection closed: {$connection->getMeta('id')}");
            })
            ->onConnect(function (WebsocketServerSplit $server, WebSocket\Connection $connection) {
                $id = $this->connectionManager->add($connection, $connection->getHandshakeRequest());
                if (!$id) {
                    $connection->close();
                    return;
                }
                $user_id = $this->connectionManager->user($id);
                if ($user_id) {
                    $this->stateManager->connectedUser($user_id);
                }
                $this->commandContext->info("Connection opened: {$connection->getMeta('id')}");
            })
            ->start();
    }
    public function message(WebsocketServerSplit $server, WebSocket\Connection $connection, WebSocket\Message\Message $message)
    {
        $this->commandContext->info("Message({$connection->getMeta('id')}): {$message->getContent()}");
        $data = json_decode($message->getContent());
        if (!$data)
            return;
        try {
            $id = $connection->getMeta('id');
            if ($data->type == 'sync') {//Internal command.
                if (!$connection->getMeta("internal"))
                    return;
                $path = new ModelPath($data->path);
                if ($path->getId("state")) {
                    $this->stateManager->setState($path);
                    $this->syncManager->performSyncState($path);
                } else {
                    $this->syncManager->performSync($path);
                }
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
            } else if ($data->type == 'ping') {
                $connection->send(new WebSocket\Message\Text('{"type":"pong"}'));
            } else if ($data->type == 'state') {
                $path = new ModelPath($data->path);
                $userId = $this->connectionManager->user($id);
                if (!$userId || $userId != $path->getId("state"))
                    return;
                $this->stateManager->setState(new ModelPath($data->path));
                $this->syncManager->performSyncState($path);
                $this->commandContext->info("State({$id}):{$path}");
            }
        } catch (\Exception $e) {
            $this->commandContext->warn($e->getMessage());
        }
    }
}