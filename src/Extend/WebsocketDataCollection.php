<?php

namespace Xypp\WsNotification\Extend;

use Xypp\WsNotification\AbstractDataDispatchType;

class WebsocketDataCollection
{
    protected array $types = [];
    protected array $class2name = [];
    protected array $connectCb = [];

    public function add($type): void
    {
        $this->types[$type->name] = $type;
        $this->class2name[$type->model] = $type->name;
    }
    public function addConnectCb(callable $cb): void
    {
        $this->connectCb[] = $cb;
    }

    public function getTypes(): array
    {
        return $this->types;
    }
    public function getType(string $name): ?AbstractDataDispatchType
    {

        if (isset($this->types[$name])) {
            return $this->types[$name];
        }
        return null;
    }
    public function getTypeByModel(mixed $model): ?AbstractDataDispatchType
    {
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