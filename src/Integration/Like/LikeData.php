<?php

namespace Xypp\WsNotification\Integration\Like;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;


class LikeData extends AbstractDataDispatchType
{
    protected $userSerializer;
    public function __construct(BasicUserSerializer $userSerializer)
    {
        parent::__construct("like", "");
        $this->userSerializer = $userSerializer;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        if ($user_id == $model->id)
            return;
        $this->userSerializer->setRequest(RequestForSerializer::createWithId($user_id, null));
        $sync([
            "post" => $path->getId("post"),
            "user" => [
                "data" => [
                    "type" => "users",
                    "id" => $model->id,
                    "attributes" => $this->userSerializer->getAttributes($model)
                ]
            ],
            "like" => $path->getData()["like"]
        ]);
    }
    public function getModel(ModelPath $id)
    {
        return User::find($id->getId("like"));
    }
}