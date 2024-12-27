<?php

namespace Xypp\WsNotification\Websockets\Socket;

use Ratchet\MessageComponentInterface;

class Events implements MessageComponentInterface{
    public $_onMessage = null;
    public $_onConnect = null;
    public $_onDisconnect = null;
    public $_onError = null;

    public function __construct($onConnect, $onMessage, $onDisconnect, $onError){
        $this->_onConnect = $onConnect;
        $this->_onMessage = $onMessage;
        $this->_onDisconnect = $onDisconnect;
        $this->_onError = $onError;
    }

    public function onOpen($conn){
        if($this->_onConnect){
            ($this->_onConnect)($conn);
        }
    }
    public function onMessage($conn, $msg){
        if($this->_onMessage){
            ($this->_onMessage)($conn, $msg);
        }
    }
    public function onClose($conn){
        if($this->_onDisconnect){
            ($this->_onDisconnect)($conn);
        }
    }
    public function onError($conn, $e){
        if($this->_onError){
            ($this->_onError)($conn, $e);
        }
    }

}