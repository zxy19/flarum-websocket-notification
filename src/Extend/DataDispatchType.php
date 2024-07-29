<?php

namespace Xypp\WsNotification\Extend;

use Flarum\Extend\ExtenderInterface;
use Flarum\Extension\Extension;
use Illuminate\Contracts\Container\Container;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Extend\DataDispatchTypeCollection;

class DataDispatchType implements ExtenderInterface
{
    protected $types = [];
    public function provide(string $class)
    {
        $this->types[] = $class;
        return $this;
    }
    public function extend(Container $container, Extension $extension = null)
    {
        $container->resolving(
            DataDispatchTypeCollection::class,
            function (DataDispatchTypeCollection $collection, Container $container) {
                foreach ($this->types as $type) {
                    $collection->add($container->make($type));
                }
            }
        );
        return $this;
    }
}