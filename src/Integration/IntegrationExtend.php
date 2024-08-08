<?php
use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Api\Serializer\ForumSerializer;
use Flarum\Api\Serializer\UserSerializer;
use Flarum\Approval\Event\PostWasApproved;
use Flarum\Extend\Event;
use Flarum\Extend\Settings;
use Flarum\Post\Event\Posted;
use Flarum\Post\Event\Saving;
use Xypp\WsNotification\Integration\Flag\FlagEventsListener;
use Xypp\WsNotification\Integration\Like\LikeEventsListener;
use Xypp\WsNotification\Integration\Online\OnlineAttribute;
use Xypp\WsNotification\Integration\Poll\PollEventsListener;
use Xypp\WsNotification\Integration\Post\PostApproval;
use Xypp\WsNotification\Integration\Post\PostSavingEvent;
use Xypp\WsNotification\Integration\Post\PostStartEvent;
use Xypp\WsNotification\Integration\Notification\NotificationDriver;
use Xypp\WsNotification\Integration\Reaction\ReactionEventsListener;
use Xypp\WsNotification\Integration\TypeTip\TypeTipAttr;
use Xypp\WsNotification\Integration\TypeTip\TypeTipDiscussionSerializer;
use Flarum\Extend;

$ret = [
    (new Extend\Notification())
        ->driver("ws-notification", NotificationDriver::class),
    (new Event())
        ->listen(Saving::class, PostSavingEvent::class)
        ->listen(Posted::class, PostStartEvent::class)
        ->listen(PostWasApproved::class, PostApproval::class)
        ->subscribe(PollEventsListener::class)
        ->subscribe(ReactionEventsListener::class)
        ->subscribe(LikeEventsListener::class)
        ->subscribe(FlagEventsListener::class),
    (new Extend\ApiSerializer(ForumSerializer::class))
        ->attribute("xyppWsnTypeTip", TypeTipAttr::class),
    (new Extend\ApiSerializer(UserSerializer::class))
        ->attributes(OnlineAttribute::class),
    (new Extend\ApiSerializer(DiscussionSerializer::class))
        ->attributes(TypeTipDiscussionSerializer::class),
    (new Settings())
        ->default("xypp.ws_notification.function.discussion", true)
        ->default("xypp.ws_notification.function.post", true)
        ->default("xypp.ws_notification.function.notification", true)
        ->default("xypp.ws_notification.function.like", true)
        ->default("xypp.ws_notification.function.typing", true)
        ->default("xypp.ws_notification.function.flag", true)
        ->default("xypp.ws_notification.function.reaction", true)
        ->default("xypp.ws_notification.function.online", true)
        ->default("xypp.ws_notification.function.poll", true),
    (new Extend\User())
        ->registerPreference("xyppWsnFloaterPosition", null, "center")
        ->registerPreference("xyppWsnNewDiscussionAutoRefresh", null, false)
        ->registerPreference("xyppWsnNewDiscussionListLen", null, 5)
        ->registerPreference("xyppWsnNoTypeTip", null, false),
];

return $ret;