<?php

namespace Xypp\WsNotification\Integration\Flag;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;


class Flag extends AbstractDataDispatchType
{
    private $controller;
    public function __construct(SingleFlagController $controller)
    {
        parent::__construct("flag", "");
        $this->controller = $controller;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        if (!$user_id)
            return;
        /**
         * @var User
         */
        $user = User::find($user_id);
        if (!$user)
            return;

        if (\Flarum\Flags\Flag::whereVisibleTo($user)->where("flags.id", $path->getId("flag"))->count("flags.id") > 0) {
            $sync($model);
        }
    }
    public function getModel(ModelPath $id)
    {
        $flag = \Flarum\Flags\Flag::find($id->getId("flag"));

        return json_decode($this->controller->handle(RequestForSerializer::createWithId(null, ["model" => $flag]))->getBody()->getContents());
    }
}