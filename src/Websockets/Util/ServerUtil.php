<?php

namespace Xypp\WsNotification\Websockets\Util;

use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Websockets\Class\StreamFactoryWithContext;
use Xypp\WsNotification\Websockets\Class\WebsocketServerSplit;

class ServerUtil
{
    public static function makeServer(WebsocketConfig $config)
    {
        $context = null;
        if ($config->cert && $config->pk) {
            $context = stream_context_create([
                'ssl' => [
                    'local_cert' => $config->cert,
                    'local_pk' => $config->pk,
                    'allow_self_signed' => $config->selfSigned,
                    'verify_peer' => false,
                ]
            ]);
        }
        $server = new WebsocketServerSplit($config->port, $config->cert && $config->pk, null, $context);

        $middlewares = [];
        $middlewares[] = new \WebSocket\Middleware\CloseHandler();
        $middlewares[] = new \WebSocket\Middleware\PingResponder();
        foreach ($middlewares as $middleware) {
            $server->addMiddleware($middleware);
        }
        return $server;
    }
}