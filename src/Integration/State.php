<?php

namespace Xypp\WsNotification\Integration;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\User\Guest;
use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;

class State extends AbstractDataDispatchType
{
    public function __construct()
    {
        parent::__construct("state", "");
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {

    }
    public function getModel(ModelPath $id)
    {
        return false;
    }
}