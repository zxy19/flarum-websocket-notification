<?php
use Flarum\Extend\Event;
use Flarum\Extend\Settings;
use Flarum\Post\Event\Posted;
use Flarum\Post\Event\Saving;
use Xypp\WsNotification\Integration\Online\ConnectedOnlineStateCallback;
use Xypp\WsNotification\Integration\Online\OnlineData;
use Xypp\WsNotification\Integration\Post\DiscussionData;
use Xypp\WsNotification\Integration\Post\PostData;
use Xypp\WsNotification\Integration\Post\PostSavingEvent;
use Xypp\WsNotification\Integration\Notification\NotificationData;
use Xypp\WsNotification\Integration\Notification\NotificationDriver;
use Xypp\WsNotification\Integration\Post\PostStartEvent;
use Xypp\WsNotification\Integration\State;
use Flarum\Extend;

return [
    (new \Xypp\WsNotification\Extend\Websocket())
        ->type(PostData::class)
        ->type(NotificationData::class)
        ->type(DiscussionData::class)
        ->type(State::class)
        ->type(OnlineData::class)
        ->connected(ConnectedOnlineStateCallback::class),
    (new Extend\notification())
        ->driver("ws-notification", NotificationDriver::class),
    (new Event())
        ->listen(Saving::class, PostSavingEvent::class)
        ->listen(Posted::class, PostStartEvent::class),
    (new Settings())
        ->default("xypp.ws_notification.function.discussion", true)
        ->default("xypp.ws_notification.function.post", true)
        ->default("xypp.ws_notification.function.notification", true)
];