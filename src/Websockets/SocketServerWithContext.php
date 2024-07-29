<?php

namespace Xypp\WsNotification\Websockets;

use Phrity\Net\SocketServer;
use Phrity\Net\StreamException;
use Phrity\Util\ErrorHandler;
use Psr\Http\Message\UriInterface;



class SocketServerWithContext extends SocketServer
{
    private static $internet_schemes = ['tcp', 'udp', 'tls', 'ssl'];
    private static $unix_schemes = ['unix', 'udg'];
    /**
     * Create new socker server instance
     * @param \Psr\Http\Message\UriInterface $uri The URI to open socket on.
     * @throws StreamException if unable to create socket.
     */
    public function __construct(UriInterface $uri, $context)
    {
        $this->handler = new ErrorHandler();
        if (!in_array($uri->getScheme(), $this->getTransports())) {
            throw new StreamException(StreamException::SCHEME_TRANSPORT, ['scheme' => $uri->getScheme()]);
        }
        if (in_array(substr($uri->getScheme(), 0, 3), self::$internet_schemes)) {
            $this->address = "{$uri->getScheme()}://{$uri->getAuthority()}";
        } elseif (in_array($uri->getScheme(), self::$unix_schemes)) {
            $this->address = "{$uri->getScheme()}://{$uri->getPath()}";
        } else {
            throw new StreamException(StreamException::SCHEME_HANDLER, ['scheme' => $uri->getScheme()]);
        }
        $this->stream = $this->handler->with(function () use ($context) {
            $error_code = $error_message = '';
            $flags = STREAM_SERVER_BIND | STREAM_SERVER_LISTEN;
            return stream_socket_server($this->address, $error_code, $error_message, $flags, $context);
        }, new StreamException(StreamException::SERVER_SOCKET_ERR, ['uri' => $uri->__toString()]));
        $this->evalStream();
    }
}