<?php

namespace Xypp\WsNotification\Integration\Reaction;

use Flarum\Likes\Event\PostWasLiked;
use Flarum\Likes\Event\PostWasUnliked;
use Flarum\Settings\SettingsRepositoryInterface;
use FoF\Reactions\Event\PostWasReacted;
use FoF\Reactions\Event\PostWasUnreacted;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;



class ReactionEventsListener
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
        $events->listen(PostWasReacted::class, [$this, 'reacted']);
        $events->listen(PostWasUnreacted::class, [$this, 'unreacted']);
    }

    public function reacted(PostWasReacted $event)
    {
        if (!$this->settings->get("xypp.ws_notification.function.reaction"))
            return;
        $this->bridge->queue(
            (new ModelPath())
                ->addWithId("discussion", $event->post->discussion_id)
                ->addWithId("post", $event->post->id)
                ->addWithId("reaction", $event->postReaction->reaction->id)
                ->setData([
                    "type" => "add",
                ])
        );
    }

    public function unreacted(PostWasUnreacted $event)
    {
        if (!$this->settings->get("xypp.ws_notification.function.reaction"))
            return;
        $this->bridge->queue(
            (new ModelPath())
                ->addWithId("discussion", $event->post->discussion_id)
                ->addWithId("post", $event->post->id)
                ->addWithId("reaction", $event->postReaction->reaction->id)
                ->setData([
                    "type" => "remove",
                ])
        );
    }
}