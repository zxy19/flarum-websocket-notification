<?php

namespace Xypp\WsNotification;
use Xypp\WsNotification\Data\ModelPath;


abstract class AbstractDataDispatchType
{
    public string $model;
    public string $name;

    public function __construct(string $name, string $model)
    {
        $this->model = $model;
        $this->name = $name;
    }
    /**
     * Deliver model data to client.
     * 
     * @param \Websocket\Connection $connection 
     * @param ModelPath $path 
     * @param $model
     * @param callable $sync call with array.
     * @return void
     */
    abstract public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void;

    abstract public function getModel(ModelPath $id);

    public function canSubscribe(?int $user_id, ModelPath $path): bool
    {
        return true;
    }
}