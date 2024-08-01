<?php
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Extend\Event;
use Flarum\Extend\Settings;
use Flarum\Post\Event\Posted;
use Flarum\Post\Event\Saving;
use Xypp\WsNotification\Integration\Flag\Flag;
use Xypp\WsNotification\Integration\Flag\FlagEventsListener;
use Xypp\WsNotification\Integration\Like\LikeEventsListener;
use Xypp\WsNotification\Integration\Like\PostLike;
use Xypp\WsNotification\Integration\Post\DiscussionData;
use Xypp\WsNotification\Integration\Post\PostData;
use Xypp\WsNotification\Integration\Post\PostSavingEvent;
use Xypp\WsNotification\Integration\Notification\NotificationData;
use Xypp\WsNotification\Integration\Notification\NotificationDriver;
use Xypp\WsNotification\Integration\Post\PostStartEvent;
use Xypp\WsNotification\Integration\TypeTip\Typing;
use Xypp\WsNotification\Integration\TypeTip\TypeTipAttr;
use Xypp\WsNotification\Integration\TypeTip\TypeTipDiscussionSerializer;
use Xypp\WsNotification\Integration\State;
use Flarum\Extend;

$ret = [
    (new \Xypp\WsNotification\Extend\Websocket())
        ->type(State::class)
        ->type(PostData::class)
        ->type(NotificationData::class)
        ->type(DiscussionData::class)
        ->type(PostLike::class)
        ->type(Typing::class)
        ->type(Flag::class),
    (new Extend\Notification())
        ->driver("ws-notification", NotificationDriver::class),
    (new Event())
        ->listen(Saving::class, PostSavingEvent::class)
        ->listen(Posted::class, PostStartEvent::class)
        ->subscribe(LikeEventsListener::class)
        ->subscribe(FlagEventsListener::class),
    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attribute("xyppWsnTypeTip", TypeTipAttr::class),
    (new Extend\ApiSerializer(DiscussionSerializer::class))
        ->attributes(TypeTipDiscussionSerializer::class),
    (new Settings())
        ->default("xypp.ws_notification.function.discussion", true)
        ->default("xypp.ws_notification.function.post", true)
        ->default("xypp.ws_notification.function.notification", true)
        ->default("xypp.ws_notification.function.like", true)
        ->default("xypp.ws_notification.function.typing", true)
        ->default("xypp.ws_notification.function.flag", true),
    (new Extend\User())
        ->registerPreference("xyppWsnFloaterPosition", null, "center")
        ->registerPreference("xyppWsnNewDiscussionAutoRefresh", null, false)
        ->registerPreference("xyppWsnNewDiscussionListLen", null, 5)
        ->registerPreference("xyppWsnNoTypeTip", null, false),
];

return $ret;