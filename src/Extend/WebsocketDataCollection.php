<?php

namespace Xypp\WsNotification\Extend;

use Illuminate\Contracts\Container\Container;
use Xypp\WsNotification\AbstractDataDispatchType;

class WebsocketDataCollection
{
    protected Container $container;
    protected array $unInitTypes = [];
    protected array $types = [];
    protected array $class2name = [];
    protected array $connectCb = [];
    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    public function add($type): void
    {
        $this->unInitTypes[] = $type;
    }
    public function init(): void
    {
        if (empty($this->unInitTypes)) {
            return;
        }
        foreach ($this->unInitTypes as $typeClass) {
            $type = $this->container->make($typeClass);
            $this->types[$type->name] = $type;
            $this->class2name[get_class($type)] = $type->name;
        }
        $this->unInitTypes = [];
    }
    public function addConnectCb(callable $cb): void
    {
        $this->connectCb[] = $cb;
    }

    public function getTypes(): array
    {
        $this->init();
        return $this->types;
    }
    public function getType(string $name): ?AbstractDataDispatchType
    {
        $this->init();
        if (isset($this->types[$name])) {
            return $this->types[$name];
        }
        return null;
    }
    public function getTypeByModel(mixed $model): ?AbstractDataDispatchType
    {
        $this->init();
        if (!is_string($model)) {
            $model = get_class($model);
        }
        if (isset($this->class2name[$model])) {
            return $this->getType($this->class2name[$model]);
        }
        return null;
    }
    public function connected($id)
    {
        foreach ($this->connectCb as $cb) {
            $cb($id);
        }
    }
}