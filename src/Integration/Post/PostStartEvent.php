<?php

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Post\Event\Posted;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;

class PostStartEvent
{
    protected Bridge $bridge;
    protected SettingsRepositoryInterface $settings;
    public function __construct(Bridge $bridge, SettingsRepositoryInterface $settings)
    {
        $this->bridge = $bridge;
        $this->settings = $settings;
    }
    public function __invoke(Posted $event)
    {
        if (!$this->settings->get("xypp.ws_notification.function.discussion")) {
            return;
        }
        $post = $event->post;
        if ($this->bridge->check()) {
            $this->bridge->sync((new ModelPath())->addWithId("discussion", $post->discussion_id)->setData([
                "post" => $post->id
            ]));
        }
    }
}