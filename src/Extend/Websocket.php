<?php

namespace Xypp\WsNotification\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extension\Extension;
use Flarum\Foundation\ContainerUtil;
use Illuminate\Contracts\Container\Container;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Extend\WebsocketDataCollection;

class Websocket implements ExtenderInterface
{
    protected $types = [];
    protected $connectCb = [];
    public function type(string $class)
    {
        $this->types[] = $class;
        return $this;
    }
    public function connected($callback)
    {
        $this->connectCb[] = $callback;
        return $this;
    }
    public function extend(Container $container, Extension $extension = null)
    {
        $container->resolving(
            WebsocketDataCollection::class,
            function (WebsocketDataCollection $collection, Container $container) {
                foreach ($this->types as $type) {
                    $collection->add($container->make($type));
                }
                foreach ($this->connectCb as $cb) {
                    $collection->addConnectCb(ContainerUtil::wrapCallback($cb, $container));
                }
            }
        );
        return $this;
    }
}