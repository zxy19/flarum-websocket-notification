<?php

namespace Xypp\WsNotification\Integration\Online;

use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\ConnectionManager;
use Xypp\WsNotification\Websockets\Helper\StateManager;
use Xypp\WsNotification\Websockets\Helper\SyncManager;

class OnlineCallback
{
    protected $stateManager;
    protected $syncManager;
    protected $connectionManager;
    protected $settings;
    public function __construct(StateManager $stateManager, SyncManager $syncManager, ConnectionManager $connectionManager, SettingsRepositoryInterface $settings)
    {
        $this->stateManager = $stateManager;
        $this->syncManager = $syncManager;
        $this->connectionManager = $connectionManager;
        $this->settings = $settings;
    }
    public function __invoke(int $id): void
    {
        if (!$this->settings->get('xypp.ws_notification.function.online')) {
            return;
        }
        if ($userId = $this->connectionManager->user($id)) {
            $this->stateManager->setState((new ModelPath())->addWithId("state", $userId)->add("online"));
            $this->syncManager->performSyncState((new ModelPath())->addWithId("state", $userId)->add("online"));
        }
    }
}