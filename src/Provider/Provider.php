<?php

namespace Xypp\WsNotification\Provider;

use Flarum\Foundation\AbstractServiceProvider;
use Xypp\WsNotification\Extend\WebsocketDataCollection;
use Xypp\WsNotification\Helper\Bridge;
use Xypp\WsNotification\Websockets\Helper\ConnectionManager;
use Xypp\WsNotification\Websockets\Helper\SubscribeManager;
use Xypp\WsNotification\Websockets\Helper\StateManager;
use Xypp\WsNotification\Websockets\Helper\SyncManager;


class Provider extends AbstractServiceProvider
{
    public function register()
    {
        $this->container->singleton(Bridge::class);
        $this->container->singleton(WebsocketDataCollection::class);
        $this->container->singleton(ConnectionManager::class);
        $this->container->singleton(SubscribeManager::class);
        $this->container->singleton(StateManager::class);
        $this->container->singleton(SyncManager::class);
    }
}