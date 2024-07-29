<?php

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Extend\Model;
use Flarum\Post\Event\Saving;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Bridge;

class PostSavingEvent
{
    protected Bridge $bridge;
    public function __construct(Bridge $bridge)
    {
        $this->bridge = $bridge;
    }
    public function __invoke(Saving $event)
    {
        if($this->bridge->check()){
            $this->bridge->sync((new ModelPath())->addWithId("discussion",$event->post->discussion_id)->addWithId("post",$event->post->id));
        }
    }
}