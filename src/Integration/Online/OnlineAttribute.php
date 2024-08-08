<?php

namespace Xypp\WsNotification\Integration\Online;

use Flarum\Api\Serializer\UserSerializer;
use Flarum\User\User;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\WebsocketUserState;

class OnlineAttribute
{
    public function __invoke(UserSerializer $serializer, User $model, $attributes)
    {
        if ($model->getPreference('discloseOnline') || $serializer->getActor()->can('viewLastSeenAt', $model)) {
            if (WebsocketUserState::where("path", strval((new ModelPath())->add("online")))->exists()) {
                $attributes['onlineState'] = true;
            } else {
                $attributes['onlineState'] = false;
            }
        }
        return $attributes;
    }
}