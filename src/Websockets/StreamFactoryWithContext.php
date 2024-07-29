<?php

namespace Xypp\WsNotification\Websockets;

use Phrity\Net\SocketServer;
use Phrity\Net\StreamFactory;



class StreamFactoryWithContext extends StreamFactory
{
    private $context;

    public function __construct($context)
    {
        $this->context = $context;
    }

    public function createSocketServer($uri): SocketServer
    {
        return new SocketServerWithContext($uri, $this->context);
    }
}