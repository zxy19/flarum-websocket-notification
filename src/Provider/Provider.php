<?php

namespace Xypp\WsNotification\Provider;

use Flarum\Foundation\AbstractServiceProvider;
use Illuminate\Contracts\Container\Container;
use Xypp\WsNotification\Extend\WebsocketDataCollection;
use Xypp\WsNotification\Helper\Bridge;
use Xypp\WsNotification\Integration\Reaction\ReactionData;
use Xypp\WsNotification\Websockets\Helper\ConnectionManager;
use Xypp\WsNotification\Websockets\Helper\SubscribeManager;
use Xypp\WsNotification\Websockets\Helper\StateManager;
use Xypp\WsNotification\Websockets\Helper\SyncManager;
use Xypp\WsNotification\Integration\Flag\FlagData;
use Xypp\WsNotification\Integration\Like\LikeData;
use Xypp\WsNotification\Integration\Post\PostData;
use Xypp\WsNotification\Integration\Post\TagData;
use Xypp\WsNotification\Integration\Post\DiscussionData;
use Xypp\WsNotification\Integration\TypeTip\TypingData;
use Xypp\WsNotification\Integration\Notification\NotificationData;
use Xypp\WsNotification\Integration\State;

class Provider extends AbstractServiceProvider
{
    public function register()
    {
        $this->container->singleton(Bridge::class);
        $this->container->singleton(WebsocketDataCollection::class, function (Container $container) {
            $collection = new WebsocketDataCollection($container);
            $collection->add(State::class);
            $collection->add(PostData::class);
            $collection->add(NotificationData::class);
            $collection->add(DiscussionData::class);
            $collection->add(LikeData::class);
            $collection->add(TypingData::class);
            $collection->add(FlagData::class);
            $collection->add(TagData::class);
            $collection->add(ReactionData::class);
            return $collection;
        });
        $this->container->singleton(ConnectionManager::class);
        $this->container->singleton(SubscribeManager::class);
        $this->container->singleton(StateManager::class);
        $this->container->singleton(SyncManager::class);
    }
}