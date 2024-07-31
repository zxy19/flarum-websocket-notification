<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Flarum\Database\AbstractModel;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Extend\WebsocketDataCollection;

class DataDispatchHelper
{
    protected WebsocketDataCollection $wsData;
    public function __construct(WebsocketDataCollection $types)
    {
        $this->wsData = $types;
    }
    public function getDispatchTypeByModel(mixed $model): ?AbstractDataDispatchType
    {
        return $this->wsData->getTypeByModel($model);
    }
    public function getDispatchType(string $name): ?AbstractDataDispatchType
    {
        return $this->wsData->getType($name);
    }
    public function directPath(AbstractModel $model)
    {
        $t = $this->getDispatchTypeByModel($model);
        if (!$t)
            return null;
        return (new ModelPath())->addWithId($t->name, $model->getKey());
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
        if ($path->getName("state")) {
            return true;
        }
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
    public function connected(int $id)
    {
        return $this->wsData->connected($id);
    }
}