<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\WebsocketUserState;

class StateManager
{
    protected DataDispatchHelper $helper;
    protected ConnectionManager $connections;
    protected array $states = [];
    protected array $user_connections = [];
    protected array $user_states = [];
    public function __construct(DataDispatchHelper $helper, ConnectionManager $connections)
    {
        $this->helper = $helper;
        $this->connections = $connections;
    }
    public function setState(ModelPath $path)
    {
        $user_id = $path->getId("state");
        if ($user_id) {
            if (!isset($this->states[$user_id])) {
                $this->states[$user_id] = [];
            }
            if (!in_array($path, $this->states[$user_id])) {
                $this->states[$user_id][] = $path;
            }
            if (isset($this->user_states[$user_id])) {
                $this->user_states[$user_id]->setState($path, $path->getData());
                $this->user_states[$user_id]->save();
            }
        }
        return false;
    }
    public function connectedUser(int $user_id)
    {
        if (!isset($this->user_connections[$user_id]))
            $this->user_connections[$user_id] = 1;
        else
            $this->user_connections[$user_id]++;

        if (!isset($this->user_states[$user_id])) {
            $this->user_states[$user_id] = WebsocketUserState::create($user_id);
        }
    }
    public function getDisconnectReleased(int $user_id)
    {
        /**
         * Only Do State Release When All connections are closed.
         */
        if (!isset($this->user_connections[$user_id])) {
            return [];
        }
        $this->user_connections[$user_id]--;
        if ($this->user_connections[$user_id] > 0) {
            return [];
        }
        unset($this->user_connections[$user_id]);


        /**
         * Collect State to Release
         */
        if (!isset($this->states[$user_id])) {
            return [];
        }
        $ret = $this->states[$user_id];
        unset($this->states[$user_id]);
        return $ret;
    }
    public function clear()
    {
        WebsocketUserState::query()->delete();
    }
}