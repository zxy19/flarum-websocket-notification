<?php

namespace Xypp\WsNotification\Integration\Poll;

use Flarum\Likes\Event\PostWasLiked;
use Flarum\Likes\Event\PostWasUnliked;
use Flarum\Settings\SettingsRepositoryInterface;
use FoF\Polls\Events\PollOptionUpdated;
use FoF\Polls\Events\PollVotesChanged;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;



class PollEventsListener
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
        $events->listen(PollVotesChanged::class, [$this, 'changed']);
    }

    public function changed(PollVotesChanged $event)
    {
        if (!$event->actor)
            return;
        if (!$this->settings->get("xypp.ws_notification.function.poll"))
            return;
        $this->bridge->sync((new ModelPath())->addWithId("poll", $event->poll->id));
    }
}