<?php
namespace Xypp\WsNotification\Integration\Post;

use Flarum\Approval\Event\PostWasApproved;
use Flarum\Extension\ExtensionManager;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;

class PostApproval
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
    public function __invoke(PostWasApproved $event)
    {
        $post = $event->post;
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
}