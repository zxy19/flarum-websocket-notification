<?php

namespace Xypp\WsNotification\Websockets\Socket;

use Ratchet\ConnectionInterface;

class Connection
{
    protected $socket;
    protected $closed = false;
    protected $meta = [];
    public static function fromSocket(ConnectionInterface $socket): self
    {
        if (isset($socket->_con)) {
            return $socket->_con;
        }
        return new static($socket);
    }
    public function __construct(ConnectionInterface $socket)
    {
        $this->socket = $socket;
        $socket->_con = $this;
    }

    public function getSocket()
    {
        return $this->socket;
    }

    public function getMeta($key, $default = null)
    {
        return $this->meta[$key] ?? $default;
    }

    public function setMeta($key, $value)
    {
        $this->meta[$key] = $value;
    }

    public function close()
    {
        $this->closed = true;
        $this->socket->close();
    }

    public function send($message)
    {
        $this->socket->send($message);
    }

    public function setClosed()
    {
        $this->closed = true;
    }
    public function isConnected()
    {
        return !$this->closed;
    }
}