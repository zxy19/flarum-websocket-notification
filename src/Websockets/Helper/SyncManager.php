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
    protected JobIdManager $jobIdManager;
    protected Logger $logger;
    protected array $workerRegisters = [];
    protected array $jobIdWorkerId = [];
    protected array $workerJobs = [];
    protected int $nextWorkerId = 0;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager,
        JobIdManager $jobIdManager,
        Logger $logger
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
        $this->jobIdManager = $jobIdManager;
        $this->logger = $logger;
    }

    public function performSync(ModelPath $path, ?array $ids = null, int $job_id = 0)
    {
        if ($ids === null)
            $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            $this->jobIdManager->doneJobId($job_id);
            return;
        }
        $idGrped = $this->connectionManager->groupIdByUser($ids);
        if ($this->performSyncWorker($path, $idGrped, false, $job_id))
            return;

        $model = $this->helper->getModelByPath($path);
        $dispatchType = $this->helper->getDispatchType($path->getName());
        if (!$dispatchType) {
            $this->jobIdManager->doneJobId($job_id);
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
        $this->jobIdManager->doneJobId($job_id);
    }
    public function performSyncState(ModelPath $path, ?array $ids = null, int $job_id = 0)
    {
        if ($ids === null)
            $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            $this->jobIdManager->doneJobId($job_id);
            return;
        }
        $idGrped = $this->connectionManager->groupIdByUser($ids);
        if ($this->performSyncWorker($path, $idGrped, true, $job_id))
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
        $this->jobIdManager->doneJobId($job_id);
    }
    public function performReleasing(ModelPath $path, ?array $ids = null, int $job_id = 0)
    {
        if ($ids === null)
            $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            $this->jobIdManager->doneJobId($job_id);
            return;
        }

        $this->connectionManager->broadcast($ids, json_encode([
            "type" => "sync",
            "path" => strval($path),
            "data" => ["state" => false],
            "job_id" => $job_id
        ]));
        $this->jobIdManager->doneJobId($job_id);
    }
    public function performSyncWorker(ModelPath $path, array $idGrped, bool $isState = false, int $job_id = 0): bool
    {
        $minJobs = 0x7fffffff;
        for ($i = 0; $i < count($this->workerRegisters); $i++) {
            $j = 0;
            if (isset($this->workerJobs[$i])) {
                $j = $this->workerJobs[$i];
            }
            if ($j < $minJobs) {
                $minJobs = $j;
                $this->nextWorkerId = $i;
            }
        }
        $this->nextWorkerId--;


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
                    $worker->dispatch($path, $idGrped, $isState, $job_id);
                } catch (\Exception $e) {
                    $this->logger->error("Worker({$worker->id}) Error: " . $e->getMessage());
                    $this->logger->verbose($e->getTraceAsString());
                    $this->removeWorker($worker->id);
                    $this->nextWorkerId--;
                    continue;
                }
                $this->logger->verbose("Job ({$path}) Dispatched to ({$worker->id})");
                $this->jobIdWorkerId[$job_id] = $worker->id;
                if (!isset($this->workerJobs[$worker->id]))
                    $this->workerJobs[$worker->id] = 0;
                $this->workerJobs[$worker->id]++;
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
                $this->logger->tip("Worker({$id}) Removed");
                array_splice($this->workerRegisters, $i, 1);
                return;
            }
        }
    }
    public function addWorker(\Websocket\Connection $connection)
    {
        $worker = new WorkerRegister($connection);
        $connection->setMeta("worker", true);
        $this->logger->tip("Worker Registered({$worker->id})");
        $this->workerRegisters[] = $worker;
    }

    public function jobDone(int $jobId)
    {
        if (isset($this->jobIdWorkerId[$jobId])) {
            $workerId = $this->jobIdWorkerId[$jobId];
            unset($this->jobIdWorkerId[$jobId]);
            if (isset($this->workerJobs[$workerId]))
                $this->workerJobs[$workerId]--;
        }
    }
}