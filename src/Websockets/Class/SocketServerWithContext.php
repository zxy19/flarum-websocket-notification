<?php

namespace Xypp\WsNotification\Websockets\Class;

use Phrity\Net\SocketServer;
use Phrity\Net\SocketStream;
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
     * @param resource $context
     * @throws StreamException if unable to create socket.
     */
    public function __construct(UriInterface $uri, $context)
    {
        if (!$context) {
            parent::__construct($uri);
            return;
        }
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


    public function accept(int|null $timeout = null): SocketStream|null
    {
        if (get_resource_type($this->stream) != 'stream') {
            throw new StreamException(StreamException::SERVER_CLOSED);
        }
        if (!isset($this->stream)) {
            throw new StreamException(StreamException::SERVER_CLOSED);
        }
        $stream = $this->handler->with(function () use ($timeout) {
            $peer_name = '';
            return stream_socket_accept($this->stream, $timeout, $peer_name);
        }, function (\ErrorException $e) {
            // If non-blocking mode, don't throw error on time out
            $msg = $e->getMessage();
            if ($this->getMetadata('blocked') === false && substr_count($msg, 'timed out') > 0) {
                return null;
            }
            if (substr_count($msg, 'timed out') > 0 && substr_count($msg, 'SSL:') > 0) {
                return null;
            }
            if (substr_count($msg, "reset by peer") > 0) {
                return null;
            }
            print ("====================");
            print ("\n");
            print ($e->getMessage());
            print ("\n");
            print ($e->getTraceAsString());
            print ("\n");
            throw new StreamException(StreamException::SERVER_ACCEPT_ERR);
        });
        return $stream ? new SocketStream($stream) : null;
    }
}