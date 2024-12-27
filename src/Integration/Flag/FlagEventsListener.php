<?php

namespace Xypp\WsNotification\Integration\Flag;

use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;
use Flarum\Flags\Event\Created;
use Flarum\Flags\Event\Deleting;


class FlagEventsListener
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
        $events->listen(Created::class, [$this, 'flagCreated']);
        $events->listen(Deleting::class, [$this, 'flagDeleted']);
    }

    public function flagCreated(Created $event)
    {
        if (!$event->actor)
            return;
        if (!$this->settings->get("xypp.ws_notification.function.flag"))
            return;
        $this->bridge->sync(
            (new ModelPath())
                ->addWithId("flag", $event->flag->id)
                ->setData(["delete" => false])
        );
    }

    public function flagDeleted(Deleting $event)
    {
        if (!$event->actor)
            return;
        if (!$this->settings->get("xypp.ws_notification.function.flag"))
            return;
        $this->bridge->sync(
            (new ModelPath())
                ->addWithId("flag", $event->flag->id)
                ->setData(["delete" => true])
        );
    }
}