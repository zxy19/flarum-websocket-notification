<?php

namespace Xypp\WsNotification\Provider;

use Flarum\Foundation\AbstractServiceProvider;
use Xypp\WsNotification\Extend\DataDispatchTypeCollection;
use Xypp\WsNotification\Websockets\Bridge;
use Xypp\WsNotification\Websockets\Util\ConnectionManager;
use Xypp\WsNotification\Websockets\Util\SubscribeManager;

class Provider extends AbstractServiceProvider
{
    public function register()
    {
        $this->container->singleton(Bridge::class);
        $this->container->singleton(DataDispatchTypeCollection::class);
        $this->container->singleton(ConnectionManager::class);
        $this->container->singleton(SubscribeManager::class);
    }
}