<?php

namespace Xypp\WsNotification\Integration\Online;

use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\ConnectionManager;
use Xypp\WsNotification\Websockets\Helper\SyncManager;

class ConnectedOnlineStateCallback
{
    protected SyncManager $syncManager;
    protected ConnectionManager $connections;
    public function __construct(SyncManager $syncManager, ConnectionManager $connections)
    {
        $this->syncManager = $syncManager;
        $this->connections = $connections;
    }
    public function __invoke(int $id)
    {
        $user_id = $this->connections->user($id);
        if (!$user_id) {
            return;
        }
        $this->syncManager->performSync((new ModelPath())->addWithId("state", $user_id)->add("online")->setData(["online" => true]));
    }
}