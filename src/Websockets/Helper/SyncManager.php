<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\Websockets\Worker\WorkerRegister;

class SyncManager
{

    protected DataDispatchHelper $helper;
    protected SubscribeManager $subscribeManager;
    protected ConnectionManager $connectionManager;
    protected Logger $logger;
    protected array $workerRegisters = [];
    protected int $nextWorkerId = 0;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager,
        Logger $logger
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;

        $this->logger = $logger;
    }

    public function performSync(ModelPath $path, ?array $ids = null)
    {
        if ($ids === null)
            $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }
        $idGrped = $this->connectionManager->groupIdByUser($ids);
        if ($this->performSyncWorker($path, $idGrped))
            return;

        $model = $this->helper->getModelByPath($path);
        $dispatchType = $this->helper->getDispatchType($path->getName());
        if (!$dispatchType) {
            return;
        }
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
                        "data" => $attr ?? []
                    ]));
                }
            );
        }
    }
    public function performSyncState(ModelPath $path, ?array $ids = null)
    {
        if ($ids === null)
            $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }
        $idGrped = $this->connectionManager->groupIdByUser($ids);
        if ($this->performSyncWorker($path, $idGrped, true))
            return;

        $model = null;
        $type = $this->helper->getDispatchType($path->getName());
        if (!$type) {
            $type = $this->helper->getDispatchType("state");
        }
        $model = $type->getModel($path);
        foreach ($idGrped as $user_id => $ids) {
            if ($type) {
                $type->deliver(
                    $user_id,
                    $path,
                    $model,
                    function ($attr) use ($ids, $path) {
                        $this->connectionManager->broadcast($ids, json_encode([
                            "type" => "sync",
                            "path" => strval($path),
                            "data" => $attr ?? ["state" => true]
                        ]));
                    }
                );
            }
        }
    }
    public function performReleasing(ModelPath $path)
    {
        $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }

        $this->connectionManager->broadcast($ids, json_encode([
            "type" => "sync",
            "path" => strval($path),
            "data" => ["state" => false]
        ]));
    }
    public function performSyncWorker(ModelPath $path, array $idGrped, bool $isState = false): bool
    {
        for ($i = 0; $i < count($this->workerRegisters); $i++) {
            if (empty($this->workerRegisters))
                return false;
            $this->nextWorkerId++;
            if ($this->nextWorkerId >= count($this->workerRegisters))
                $this->nextWorkerId = 0;
            /**
             * @var WorkerRegister
             */
            $worker = $this->workerRegisters[$this->nextWorkerId];
            if ($worker->alive) {
                try {
                    $worker->dispatch($path, $idGrped, $isState);
                } catch (\Exception $e) {
                    $this->logger->error("Worker({$worker->id}) Error: " . $e->getMessage());
                    $this->logger->verbose($e->getTraceAsString());
                    $this->removeWorker($worker->id);
                    $this->nextWorkerId--;
                    continue;
                }
                $this->logger->verbose("Job ({$path}) Dispatched to ({$worker->id})");
                return true;
            }
        }
        return false;
    }


    public function removeWorker(int $id)
    {
        for ($i = 0; $i < count($this->workerRegisters); $i++) {
            if ($this->workerRegisters[$i]->id == $id) {
                if ($this->workerRegisters[$i]->alive) {
                    $this->workerRegisters[$i]->stop();
                }
                $this->logger->info("Worker({$id}) Removed");
                array_splice($this->workerRegisters, $i, 1);
                return;
            }
        }
    }
    public function addWorker(\Websocket\Connection $connection)
    {
        $worker = new WorkerRegister($connection);
        $connection->setMeta("worker", true);
        $this->logger->info("Worker Registered({$worker->id})");
        $this->workerRegisters[] = $worker;
    }
}