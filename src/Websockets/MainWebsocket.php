<?php

namespace Xypp\WsNotification\Websockets;

use Ratchet\ConnectionInterface;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use React\EventLoop\Factory;
use React\Socket\SecureServer;
use React\Socket\Server;
use React\Socket\TcpServer;
use WebSocket;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Websockets\Helper\JobIdManager;
use Xypp\WsNotification\Websockets\Helper\Logger;
use Xypp\WsNotification\Websockets\Helper\PasterMessageManager;
use Xypp\WsNotification\Websockets\Helper\WorkerManager;
use Xypp\WsNotification\Websockets\Socket\Connection;
use Xypp\WsNotification\Websockets\Socket\Events;
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
    protected JobIdManager $jobIdManager;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager,
        StateManager $stateManager,
        SyncManager $syncManager,
        PasterMessageManager $pasterMessageManager,
        JobIdManager $jobIdManager,
        Logger $logger
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
        $this->stateManager = $stateManager;
        $this->syncManager = $syncManager;
        $this->pasterMessageManager = $pasterMessageManager;
        $this->jobIdManager = $jobIdManager;
        $this->logger = $logger;
        $this->lastPing = time();
    }
    public function start(Command $context, WebsocketConfig $config, WebsocketConfig $internalConfig)
    {
        $this->stateManager->clear();
        $this->connectionManager->clear();
        $this->logger->setCommandContext($context);
        $this->logger->info("Preparing server...");
        $loop = Factory::create();
        $app = new HttpServer(
            new WsServer(
                $this->createEvent()
            )
        );
        $server =
            new Server(
                $config->getAddrPort(),
                $loop
            );
        if ($config->cert)
            $server = new SecureServer($server, $loop, [
                'ssl' => [
                    'local_cert' => $config->cert,
                    'local_pk' => $config->pk,
                    'allow_self_signed' => $config->selfSigned,
                    'verify_peer' => false,
                ]
            ]);
        $mainApp = new IoServer($app, $server, $loop);

        $internalSocket = new Server($internalConfig->getAddrPort(), $loop);
        if ($internalConfig->cert) {
            $internalSocket = new SecureServer($internalSocket, $loop, [
                'ssl' => [
                    'local_cert' => $internalConfig->cert,
                    'local_pk' => $internalConfig->pk,
                    'allow_self_signed' => $internalConfig->selfSigned,
                    'verify_peer' => false,
                ]
            ]);
        }
        $internalSocket->on("connection", [$mainApp, "handleConnect"]);

        $this->logger->tip("Starting server on {$config->getAddrPort()}");
        $this->logger->tip("Starting internal server on {$internalConfig->getAddrPort()}");

        $mainApp->run();
    }
    public function createEvent(): Events
    {
        return new Events(
            function (ConnectionInterface $conn) {
                $connection = Connection::fromSocket($conn);
                $id = $this->connectionManager->add($connection, $conn->httpRequest);
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
            },
            function (ConnectionInterface $conn, $message) {
                $connection = Connection::fromSocket($conn);
                $this->message($connection, $message);
            },
            function (ConnectionInterface $conn) {
                $connection = Connection::fromSocket($conn);
                $connection->setClosed();
                $this->close($connection->getMeta('id'));
            },
            function ($connection, $e) {
                $connection = Connection::fromSocket($connection);
                $connection->close();
                $this->logger->error("{$e->getMessage()}");
                $this->logger->error("{$e->getTraceAsString()}");
            }
        );
    }
    public function message(Connection $connection, string $message)
    {
        $this->logger->debug("Message({$connection->getMeta('id')}): {$message}");
        $data = json_decode($message);
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
            } else if ($data->type == 'job_done') {
                if (!$connection->getMeta("internal"))
                    return;
                $this->jobIdManager->doneJobId($data->job_id);
                $this->syncManager->jobDone($data->job_id);
            } else if ($data->type == 'waitAll') {
                if (!$connection->getMeta("internal"))
                    return;
                $this->jobIdManager->setWaitJobs($id, $data->jobs);
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
                $connection->send('{"type":"pong"}');
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
        $this->jobIdManager->clearForConnection($id);

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
        $this->connectionManager->remove(id: $id);
        $this->logger->verbose("Connection closed: {$id}");
    }

    protected function handleSync(ModelPath $path, $id)
    {
        $jobId = $this->jobIdManager->getJobId($id);
        $this->logger->verbose(message: "sync path:" . $path);
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
                $this->syncManager->performReleasing($path, null, $jobId);
                $this->logger->verbose(message: "Release({$id}):{$path}");
                $this->pasterMessageManager->add($path->clone()->after("state", "release"));
            } else {
                $this->stateManager->setState($path);
                $this->syncManager->performSyncState($path, null, $jobId);
                $this->logger->verbose("State({$id}):{$path}");

                $this->pasterMessageManager->add($path);
            }
        } else {
            $this->syncManager->performSync($path, null, $jobId);
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