<?php

namespace Xypp\WsNotification\Helper;

use Flarum\Database\AbstractModel;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Extend\DataDispatchTypeCollection;
use Xypp\WsNotification\Websockets\Bridge;

class DataDispatchHelper
{
    protected Bridge $bridge;
    protected DataDispatchTypeCollection $types;
    public function __construct(Bridge $bridge, DataDispatchTypeCollection $types)
    {
        $this->bridge = $bridge;
        $this->types = $types;
    }
    public function getDispatchTypeByModel(mixed $model): ?AbstractDataDispatchType
    {
        return $this->types->getTypeByModel($model);
    }
    public function getDispatchType(string $name): ?AbstractDataDispatchType
    {
        return $this->types->getType($name);
    }
    public function directPath(AbstractModel $model)
    {
        $t = $this->getDispatchTypeByModel($model);
        if (!$t)
            return null;
        return (new ModelPath())->addWithId($t->name, $model->getKey());
    }
    public function dispatch(ModelPath $path)
    {
        $this->bridge->sync($path);
    }
    public function getModelByPath(ModelPath $modelPath)
    {
        $name = $modelPath->getName();
        $type = $this->getDispatchType($name);
        if (!$type)
            return null;
        return $type->getModel($modelPath);
    }
    
    public function canSubscribe(?int $user_id, ModelPath $path): bool
    {
        $isOk = true;
        $path->each(function ($name, $id) use ($user_id, $path, &$isOk) {
            $type = $this->getDispatchType($name);
            if (!$type)
                $isOk = false;
            else
                $isOk = $isOk && $type->canSubscribe($user_id, $path);
        });
        return $isOk;
    }
}