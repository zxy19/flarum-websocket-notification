<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;

class SyncManager
{

    protected DataDispatchHelper $helper;
    protected SubscribeManager $subscribeManager;
    protected ConnectionManager $connectionManager;
    protected StateManager $stateManager;
    public function __construct(
        DataDispatchHelper $helper,
        SubscribeManager $subscribeManager,
        ConnectionManager $connectionManager
    ) {
        $this->helper = $helper;
        $this->subscribeManager = $subscribeManager;
        $this->connectionManager = $connectionManager;
    }

    public function performSync(ModelPath $path)
    {
        $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }
        $model = $this->helper->getModelByPath($path);
        $idGrped = $this->connectionManager->groupIdByUser($ids);
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
    public function performSyncState(ModelPath $path)
    {
        $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }
        $from_id = $path->getId("state");
        $idGrped = $this->connectionManager->groupIdByUser($ids);
        foreach ($idGrped as $user_id => $ids) {
            if ($user_id == $from_id)
                continue;
            $this->connectionManager->broadcast($ids, json_encode([
                "type" => "sync",
                "path" => strval($path),
                "data" => ["state" => true]
            ]));
        }
    }

    public function performReleasing(ModelPath $path)
    {
        $ids = $this->subscribeManager->collectIdForPath($path);
        if (empty($ids)) {
            return;
        }
        $idGrped = $this->connectionManager->groupIdByUser($ids);
        foreach ($idGrped as $_ => $ids) {
            $this->connectionManager->broadcast($ids, json_encode([
                "type" => "sync",
                "path" => strval($path),
                "data" => ["state" => false]
            ]));

        }
    }
}