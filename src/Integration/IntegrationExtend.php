<?php
use Flarum\Extend\Event;
use Flarum\Post\Event\Saving;
use Xypp\WsNotification\Integration\Post\PostData;
use Xypp\WsNotification\Integration\Post\PostSavingEvent;
use Xypp\WsNotification\Integration\Notification\NotificationData;
use Xypp\WsNotification\Integration\Notification\NotificationDriver;
use Flarum\Extend;

return [
    (new \Xypp\WsNotification\Extend\DataDispatchType())
        ->provide(PostData::class)
        ->provide(NotificationData::class)
        ->provide(PostData::class),
    (new Extend\notification())
        ->driver("ws-notification", NotificationDriver::class),
    (new Event())
        ->listen(Saving::class, PostSavingEvent::class)
];