<?php

namespace Xypp\WsNotification\Integration\Notification;

use Flarum\Api\Serializer\NotificationSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Notification\Notification;
use Flarum\User\Guest;
use Flarum\User\User;
use Tobscure\JsonApi\Resource;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Integration\SerializerOverride\DiscussionSerializerOverride;
use Xypp\WsNotification\Util\RequestForSerializer;

class NotificationData extends AbstractDataDispatchType
{
    protected $notificationController;
    public function __construct(SingleNotificationController $notificationController)
    {
        parent::__construct("notification", Notification::class);
        $this->notificationController = $notificationController;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        $attrs = json_decode($this->notificationController->handle(RequestForSerializer::createWithId($user_id, [
            "model" => $model
        ]))->getBody()->getContents());
        $sync($attrs);
    }
    public function getModel(ModelPath $id)
    {
        return Notification::where("user_id", $id->getId("notification"))->orderByDesc("id")->first();
    }
    public function canSubscribe(?int $user_id, ModelPath $path): bool
    {
        if (!$user_id) {
            return false;
        }
        if ($path->getId("notification") != $user_id)
            return false;
        return true;
    }
}