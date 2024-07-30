<?php

namespace Xypp\WsNotification\Integration\Online;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\User\Guest;
use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;

class OnlineData extends AbstractDataDispatchType
{
    public function __construct()
    {
        parent::__construct("online", "");
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        $sync($model);
    }
    public function getModel(ModelPath $id)
    {
        return $id->getData();
    }
}