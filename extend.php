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
use Flarum\Extend\Settings;
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
        ->command(Console\Worker::class),
    (new Extend\Routes('api'))
        ->get("/websocket-access-token", 'websocket-access-token.create', Api\Controller\CreateWebsocketAccessTokenController::class)
        ->post("/websocket-access-token", 'websocket-access-token.save', Api\Controller\CreateWebsocketAccessTokenController::class),
    (new Extend\ServiceProvider())
        ->register(Provider::class),
    (new Extend\Settings())
        ->default("xypp.ws_notification.common.public_address", "")
        ->default("xypp.ws_notification.common.internal_address", "")
        ->default("xypp.ws_notification.common.max_states_hold", 10)
        ->default("xypp.ws_notification.common.max_subscribe_hold", 10)
        ->default("xypp.ws_notification.paster.max_record_count", 100000)
        ->default("xypp.ws_notification.paster.max_restore_count", 100)
        ->default("xypp.ws_notification.paster.max_restore_time", 3600)
        ->default("xypp.ws_notification.websocket.port", 18080)
        ->default("xypp.ws_notification.websocket.address", "0.0.0.0")
        ->default("xypp.ws_notification.websocket.cert", "")
        ->default("xypp.ws_notification.websocket.pk", "")
        ->default("xypp.ws_notification.websocket.self-signed", false)
        ->default("xypp.ws_notification.internal.port", 18081)
        ->default("xypp.ws_notification.internal.address", "127.0.0.1")
        ->default("xypp.ws_notification.internal.cert", "")
        ->default("xypp.ws_notification.internal.pk", "")
        ->default("xypp.ws_notification.internal.self-signed", false),
], require (__DIR__ . "/src/Integration/IntegrationExtend.php"));
