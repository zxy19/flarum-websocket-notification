<?php

namespace Xypp\WsNotification\Integration\Like;

use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;


class PostLike extends AbstractDataDispatchType
{
    public function __construct()
    {
        parent::__construct("like", "");
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        if ($user_id == $model->id)
            return;
        $sync([
            "post" => $path->getId("post"),
            "user" => $model->id,
            "like" => $path->getData()["like"]
        ]);
    }
    public function getModel(ModelPath $id)
    {
        return User::find($id->getId("user"));
    }
}