<?php

namespace Xypp\WsNotification\Extend;

use Xypp\WsNotification\AbstractDataDispatchType;

class DataDispatchTypeCollection
{
    protected array $types = [];
    protected array $class2name = [];

    public function add($type): void
    {
        $this->types[$type->name] = $type;
        $this->class2name[$type->model] = $type->name;
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
}