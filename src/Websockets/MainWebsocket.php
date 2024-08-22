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
use Xypp\WsNotification\Websockets\Helper\PasterMessageManager;
use Xypp\WsNotification\Websockets\Helper\WorkerManager;
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
    protected int $lastPing = 0;
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
    protected PasterMessageManager $pasterMessageManager;
    protected Logger $logger;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager,
        StateManager $stateManager,
        SyncManager $syncManager,
        PasterMessageManager $pasterMessageManager,
        Logger $logger
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
        $this->stateManager = $stateManager;
        $this->syncManager = $syncManager;
        $this->pasterMessageManager = $pasterMessageManager;
        $this->logger = $logger;
        $this->lastPing = time();
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
                $this->tick();
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
            ->setLogger($this->logger);
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
            if ($data->type == 'sync') {//Internal command. Send model path to subscriber
                if (!$connection->getMeta("internal"))
                    return;
                $path = new ModelPath($data->path);
                $this->handleSync($path, $id);
            } else if ($data->type == "worker") {//Internal command. Register worker
                if (!$connection->getMeta("internal"))
                    return;
                $this->syncManager->addWorker($connection);
            } else if ($data->type == 'dispatch') {//Internal command. Dispatch data to clients. Called by worker
                if (!$connection->getMeta("internal"))
                    return;
                $ids = $data->ids;
                if (!is_array($ids))
                    $ids = [$ids];
                $this->connectionManager->broadcast($ids, json_encode($data->data));
            } else if ($data->type == 'subscribe') {//Client Command. Update subscribe.
                $this->subscribeManager->unsubscribe($id);
                $paths = $data->path;
                if (!is_array($paths))
                    $paths = [$paths];

                $restorePaster = false;
                if (isset($data->restore)) {
                    if (!$connection->getMeta("hasRestored")) {
                        $connection->setMeta("hasRestored", true);
                        $restorePaster = true;
                    }
                }

                foreach ($paths as $path) {
                    $path = new ModelPath($path);
                    $r = $this->subscribeManager->subscribe($id, $path);
                    if ($r) {
                        $this->logger->debug("Subscribe({$id}):{$path}");
                        if ($restorePaster) {
                            $this->pasterMessageManager->sync($path, $data->restore, $id);
                        }
                    } else {
                        $this->logger->debug("Subscribe({$id}):{$path} rejected.");
                    }
                }
            } else if ($data->type == 'ping') {//Common command. Ping
                $connection->send(new WebSocket\Message\Text('{"type":"pong"}'));
            } else if ($data->type == 'state') {//Client command. Set/Unset state
                $path = new ModelPath($data->path);
                $userId = $this->connectionManager->user($id);
                if (!$path->getId("state"))
                    return;
                if (!$userId || $userId != $path->getId("state"))
                    return;
                $this->handleSync($path, $id);
            }
        } catch (\Exception $e) {
            $this->logger->warn($e->getMessage());
        }
    }
    protected function close(int $id)
    {
        $this->logger->debug("Cleaning up: {$id}");
        $this->subscribeManager->unsubscribe($id);

        if ($this->connectionManager->get($id)) {
            if ($this->connectionManager->get($id)->getMeta("worker")) {
                $this->syncManager->removeWorker($id);
            }
        }

        $user_id = $this->connectionManager->user($id);
        if ($user_id) {
            $releases = $this->stateManager->getDisconnectReleased($user_id, $id);
            /**
             * @var ModelPath $path
             */
            foreach ($releases as $path) {
                $this->handleSync($path->after("state", "release"), $id);
            }
        }
        $this->connectionManager->remove($id);
        $this->logger->verbose("Connection closed: {$id}");
    }

    protected function handleSync(ModelPath $path, $id)
    {
        $this->logger->verbose("sync path:" . $path);
        if ($path->getId("state")) {
            if ($path->get("session")) {
                if ($this->connectionManager->isInternal($id)) {
                    $path->remove("session");
                } else {
                    $path->setId("session", $id);
                }
                $this->logger->verbose("Session associate to $id:" . $path);
            }
            if ($path->get("release")) {
                $path->remove("release");
                $this->stateManager->releaseState($path->getId("state"), $path);
                $this->syncManager->performReleasing($path);
                $this->logger->verbose("Release({$id}):{$path}");
                $this->pasterMessageManager->add($path->clone()->after("state", "release"));
            } else {
                $this->stateManager->setState($path);
                $this->syncManager->performSyncState($path);
                $this->logger->verbose("State({$id}):{$path}");

                $this->pasterMessageManager->add($path);
            }
        } else {
            $this->syncManager->performSync($path);
            $this->pasterMessageManager->add($path);
        }
    }

    protected function tick()
    {
        $brk = $this->connectionManager->getBroken();
        foreach ($brk as $id) {
            $this->logger->verbose("Clear broken id $id");
            $this->close($id);
        }

        $this->pasterMessageManager->refresh();

        if (time() - $this->lastPing > 60) {
            $this->lastPing = time();
            $this->connectionManager->broadcast(null, json_encode([
                "type" => "ping",
            ]));
            $this->logger->verbose("Ping");
        }
    }
}