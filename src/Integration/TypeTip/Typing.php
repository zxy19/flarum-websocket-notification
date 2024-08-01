<?php

namespace Xypp\WsNotification\Integration\TypeTip;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;


class Typing extends AbstractDataDispatchType
{
    protected $userSerializer;
    public function __construct(BasicUserSerializer $userSerializer)
    {
        parent::__construct("typing", "");
        $this->userSerializer = $userSerializer;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        $this->userSerializer->setRequest(RequestForSerializer::createWithId($user_id, null));
        $sync([
            "state" => true,
            "user" => [
                "data" => [
                    "type" => "users",
                    "id" => $model->id,
                    "attributes" => $this->userSerializer->getAttributes($model)
                ]
            ],
        ]);
    }
    public function getModel(ModelPath $id)
    {
        return User::find($id->getId("state"));
    }
}