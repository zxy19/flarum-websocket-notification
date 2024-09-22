<?php

namespace Xypp\WsNotification\Integration\Like;

use Flarum\Likes\Event\PostWasLiked;
use Flarum\Likes\Event\PostWasUnliked;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;



class LikeEventsListener
{
    protected $bridge;
    protected $settings;
    public function __construct(Bridge $bridge, SettingsRepositoryInterface $settings)
    {
        $this->bridge = $bridge;
        $this->settings = $settings;
    }
    public function subscribe($events)
    {
        $events->listen(PostWasLiked::class, [$this, 'liked']);
        $events->listen(PostWasUnliked::class, [$this, 'unliked']);
    }

    public function liked(PostWasLiked $event)
    {
        if (!$event->user)
            return;
        if (!$this->settings->get("xypp.ws_notification.function.like"))
            return;
        $this->bridge->queue(
            (new ModelPath())
                ->addWithId("discussion", $event->post->discussion_id)
                ->addWithId("post", $event->post->id)
                ->addWithId("like", $event->user->id)
                ->setData(["like" => true])
        );
    }

    public function unliked(PostWasUnliked $event)
    {
        if (!$event->user)
            return;
        if (!$this->settings->get("xypp.ws_notification.function.like"))
            return;
        $this->bridge->queue(
            (new ModelPath())
                ->addWithId("discussion", $event->post->discussion_id)
                ->addWithId("post", $event->post->id)
                ->addWithId("like", $event->user->id)
                ->setData(["like" => false])
        );
    }
}