<?php

namespace Xypp\WsNotification\Websockets;

use Flarum\Http\RequestUtil;
use Phrity\Net\SocketServer;
use Phrity\Net\Uri;
use Psr\Http\Message\ServerRequestInterface;
use WebSocket;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Websockets\Helper\Logger;
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
    protected array $workers = [];
    protected int $workerId = 0;
    protected DataDispatchHelper $helper;
    protected SubscribeManager $subscribeManager;
    protected ConnectionManager $connectionManager;
    protected StateManager $stateManager;
    protected SyncManager $syncManager;
    protected Logger $logger;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager,
        StateManager $stateManager,
        SyncManager $syncManager,
        Logger $logger
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
        $this->stateManager = $stateManager;
        $this->syncManager = $syncManager;
        $this->logger = $logger;
    }
    public function start(Command $context, WebsocketConfig $config, WebsocketConfig $internalConfig)
    {
        $this->stateManager->clear();
        $this->connectionManager->clear();
        $this->logger->setCommandContext($context);
        $this->logger->info("Preparing server...");
        $this->server = ServerUtil::makeServer($config);
        $this->internal = ServerUtil::makeServer($internalConfig);
        $this->registerServerCallbacks($this->server);
        $this->registerServerCallbacks($this->internal);

        $this->logger->info("Starting server on {$config->address}:{$config->port}");
        $this->logger->info("Starting internal server on {$internalConfig->address}:{$internalConfig->port}");
        try {
            while (true) {
                if (!$this->server->isRunning()) {
                    $this->logger->warn("Server is not running, restarting...");
                    $this->server->start();
                }
                if (!$this->internal->isRunning()) {
                    $this->logger->warn("Internal server is not running, restarting...");
                    $this->internal->start();
                }
                $read = [];
                if ($this->server->isRunning())
                    $read = array_merge($read, $this->server->collect());
                if ($this->internal->isRunning())
                    $read = array_merge($read, $this->internal->collect());
                if (!empty($read)) {
                    $write = $oob = [];
                    stream_select($read, $write, $oob, 5);
                }

                $this->server->loop($read);
                $this->internal->loop($read);
                $this->clearBroken();
                gc_collect_cycles();
            }
        } catch (\Throwable $e) {
            $this->logger->error($e->getTraceAsString());
            $this->logger->error($e->getMessage());
        }
    }
    public function registerServerCallbacks(WebsocketServerSplit $server)
    {
        $server
            ->onText(function (WebsocketServerSplit $server, WebSocket\Connection $connection, WebSocket\Message\Message $message) {
                $this->message($server, $connection, $message);
            })
            ->onClose(function (WebsocketServerSplit $server, WebSocket\Connection $connection) {
                $this->close($connection->getMeta("id"));
            })
            ->onError(function ($server, $connection, \Throwable $e) {
                $this->logger->error("{$e->getMessage()}");
                $this->logger->error("{$e->getTraceAsString()}");
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
                $this->helper->connected($id);
                $this->logger->verbose("Connection opened: {$connection->getMeta('id')}");
            })
            ->start();
    }
    public function message(WebsocketServerSplit $server, WebSocket\Connection $connection, WebSocket\Message\Message $message)
    {
        $this->logger->debug("Message({$connection->getMeta('id')}): {$message->getContent()}");
        $data = json_decode($message->getContent());
        if (!$data)
            return;
        try {
            $id = $connection->getMeta('id');
            if ($data->type == 'sync') {//Internal command.
                if (!$connection->getMeta("internal"))
                    return;
                $this->handleSync($data);
            } else if ($data->type == 'subscribe') {//Set subscribe.
                $this->subscribeManager->unsubscribe($id);
                $paths = $data->path;
                if (!is_array($paths))
                    $paths = [$paths];
                foreach ($paths as $path) {
                    $path = new ModelPath($path);
                    $r = $this->subscribeManager->subscribe($id, $path);

                    if ($r) {
                        $this->logger->debug("Subscribe({$id}):{$path}");
                    } else {
                        $this->logger->debug("Subscribe({$id}):{$path} rejected.");
                    }
                }
            } else if ($data->type == 'ping') {
                $connection->send(new WebSocket\Message\Text('{"type":"pong"}'));
            } else if ($data->type == 'state') {
                $path = new ModelPath($data->path);
                $userId = $this->connectionManager->user($id);
                if (!$userId || $userId != $path->getId("state"))
                    return;
                if ($path->get("release")) {
                    $path->remove("release");
                    $this->stateManager->releaseState($userId, $path);
                    $this->syncManager->performReleasing($path);
                    $this->logger->verbose("Release({$id}):{$path}");
                } else {
                    $this->stateManager->setState(new ModelPath($data->path));
                    $this->syncManager->performSyncState($path);
                    $this->logger->verbose("State({$id}):{$path}");
                }
            }
        } catch (\Exception $e) {
            $this->logger->warn($e->getMessage());
        }
    }
    protected function close(int $id)
    {
        $this->logger->debug("Cleaning up: {$id}");
        $this->subscribeManager->unsubscribe($id);

        $user_id = $this->connectionManager->user($id);
        if ($user_id) {
            $releases = $this->stateManager->getDisconnectReleased($user_id);
            foreach ($releases as $path) {
                $this->syncManager->performReleasing($path);
            }
        }
        $this->connectionManager->remove($id);
        $this->logger->verbose("Connection closed: {$id}");
    }

    protected function handleSync($data)
    {
        $path = new ModelPath($data->path);
        $this->logger->verbose("sync path:" . $path);
        if ($path->getId("state")) {
            $this->stateManager->setState($path);
            $this->syncManager->performSyncState($path);
        } else {
            $this->syncManager->performSync($path);
        }
    }

    protected function clearBroken()
    {
        $brk = $this->connectionManager->getBroken();
        foreach ($brk as $id) {
            $this->logger->verbose("Clear broken id $id");
            $this->close($id);
        }
    }
}