<?php

/*
 * This file is part of xypp/flarum-websocket-notification.
 *
 * Copyright (c) 2024 小鱼飘飘.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Xypp\WsNotification;

use Flarum\Extend;
use Xypp\WsNotification\Integration\DiscussionData;
use Xypp\WsNotification\Integration\Notification\NotificationData;
use Xypp\WsNotification\Integration\Notification\NotificationDriver;
use Xypp\WsNotification\Provider\Provider;

return array_merge([
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),
    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/less/admin.less'),
    new Extend\Locales(__DIR__ . '/locale'),
    (new Extend\Console())
        ->command(Console\Serve::class)
        ->command(Console\SyncModel::class),
    (new Extend\Routes('api'))
        ->get("/websocket-access-token", 'websocket-access-token.create', Api\Controller\CreateWebsocketAccessTokenController::class)
        ->post("/websocket-access-token", 'websocket-access-token.save', Api\Controller\CreateWebsocketAccessTokenController::class),
    (new Extend\ServiceProvider())
        ->register(Provider::class),
],require(__DIR__."/Integration/IntegrationExtend.php"));
