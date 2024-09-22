<?php

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Extension\ExtensionManager;
use Flarum\Flags\Flag;
use Flarum\Post\Event\Posted;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;

class PostStartEvent
{
    protected Bridge $bridge;
    protected SettingsRepositoryInterface $settings;
    protected ExtensionManager $extensionManager;
    public function __construct(Bridge $bridge, SettingsRepositoryInterface $settings, ExtensionManager $extensionManager)
    {
        $this->bridge = $bridge;
        $this->settings = $settings;
        $this->extensionManager = $extensionManager;
    }
    public function __invoke(Posted $event)
    {
        $post = $event->post;
        $show = true;
        if ($this->extensionManager->isEnabled("flarum-approval")) {
            if ($post->is_approved === false) {
                $show = false;
            }
        }
        if (!$this->settings->get("xypp.ws_notification.function.discussion")) {
            $show = false;
        }
        if ($show) {
            if ($this->bridge->check()) {
                $this->bridge->queue((new ModelPath())->addWithId("discussion", $post->discussion_id)->setData([
                    "post" => $post->id
                ]));
            }
            if ($this->extensionManager->isEnabled("flarum-tags")) {
                $tags = $post->discussion->tags;
                if (count($tags)) {
                    foreach ($tags as $tag) {
                        if ($this->bridge->check()) {
                            $this->bridge->queue(
                                (new ModelPath())
                                    ->addWithId("tag", $tag->id)
                                    ->addWithId("discussion", $post->discussion_id)
                                    ->setData([
                                        "post" => $post->id
                                    ])
                            );
                        }
                    }
                }
            }
        }
        if ($post->is_approved === false) {
            if ($this->settings->get("xypp.ws_notification.function.flag")) {
                $flag = Flag::where("post_id", $post->id)->orderByDesc("id")->first();
                if ($flag) {
                    $this->bridge->queue((new ModelPath())->addWithId("flag", $flag->id)->setData([
                        "post" => $post->id
                    ]));
                }
            }
        }
    }
}