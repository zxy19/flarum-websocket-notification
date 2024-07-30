<?php

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Extend\Model;
use Flarum\Post\Event\Saving;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;

class PostSavingEvent
{
    protected Bridge $bridge;
    protected SettingsRepositoryInterface $settings;
    public function __construct(Bridge $bridge, SettingsRepositoryInterface $settings)
    {
        $this->bridge = $bridge;
        $this->settings = $settings;
    }
    public function __invoke(Saving $event)
    {
        if (!$this->settings->get("xypp.ws_notification.function.post")) {
            return;
        }
        $event->post->afterSave(
            function ($post) {
                if ($this->bridge->check()) {
                    $this->bridge->sync((new ModelPath())->addWithId("discussion", $post->discussion_id)->addWithId("post", $post->id));
                }
            }
        );
    }
}