<?php

namespace Xypp\WsNotification\Websockets\Util;

use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Websockets\Class\StreamFactoryWithContext;
use Xypp\WsNotification\Websockets\Class\WebsocketServerSplit;

class ServerUtil
{
    public static function makeServer(WebsocketConfig $config)
    {
        $server = new WebsocketServerSplit($config->port, $config->cert && $config->pk);

        $middlewares = [];
        $middlewares[] = new \WebSocket\Middleware\CloseHandler();
        $middlewares[] = new \WebSocket\Middleware\PingResponder();
        if ($config->cert && $config->pk) {
            /**
             * @var \Phrity\Net\StreamFactory
             */
            $fact = new StreamFactoryWithContext(stream_context_create([
                'ssl' => [
                    'local_cert' => $config->cert,
                    'local_pk' => $config->pk,
                    'allow_self_signed' => $config->selfSigned,
                    'verify_peer' => false,
                ]
            ]));
            $server->setStreamFactory($fact);
        }
        foreach ($middlewares as $middleware) {
            $server->addMiddleware($middleware);
        }
        return $server;
    }
}