<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Xypp\WsNotification\Data\ModelPath;

class WorkerManager
{
    protected DataDispatchHelper $helper;
    protected SubscribeManager $subscribeManager;
    protected ConnectionManager $connectionManager;
    protected StateManager $stateManager;
    protected array $workers = [];
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
        $this->workers[0] = 0;
    }
    public function registerWorker(int $id)
    {
        if (!$this->connectionManager->isInternal($id)) {
            $this->workers[$id] = $id;
        }
    }
    public function unregisterWorker(int $id)
    {
        if (isset($this->workers[$id])) {
            unset($this->workers[$id]);
        }
    }
    public function sendSyncWorker(ModelPath $path)
    {
        $worker = array_rand($this->workers);
        if ($worker == 0) {
            return false;
        }
        $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }
        $this->connectionManager->send($worker, json_encode([
            "type" => "task",
            "path" => strval($path),
            "ids" => $ids
        ]));
    }
}