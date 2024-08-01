<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Flarum\Settings\SettingsRepositoryInterface;
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
    protected int $maxStatesHold;
    public function __construct(DataDispatchHelper $helper, ConnectionManager $connections, SettingsRepositoryInterface $settings)
    {
        $this->helper = $helper;
        $this->connections = $connections;
        $this->maxStatesHold = $settings->get('xypp.ws_notification.common.max_states_hold', 10);
    }
    public function setState(ModelPath $path)
    {
        $user_id = $path->getId("state");
        if ($user_id) {
            if (!isset($this->states[$user_id])) {
                $this->states[$user_id] = [];
            }
            $pathStr = $path->noDataPathStr();
            if (!isset($this->states[$user_id][$pathStr])) {
                if (count($this->states[$user_id]) > $this->maxStatesHold)
                    return false;
            }
            $this->states[$user_id][$pathStr] = $path;

            if (!isset($this->user_states[$user_id][$pathStr])) {
                $this->user_states[$user_id][$pathStr] = WebsocketUserState::createPath($user_id, $path);
            } else {
                $this->user_states[$user_id][$pathStr]->setWithPath($path);
                $this->user_states[$user_id][$pathStr]->save();
            }
            return true;
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
            $this->user_states[$user_id] = [];
        }
    }
    public function releaseState(int $user_id, ModelPath $path)
    {
        $noDataPath = $path->noDataPathStr();
        if (isset($this->states[$user_id]) && isset($this->states[$user_id][$noDataPath])) {
            unset($this->states[$user_id][$noDataPath]);
        }
        if (isset($this->user_states[$user_id]) && isset($this->user_states[$user_id][$noDataPath])) {
            $this->user_states[$user_id][$noDataPath]->delete();
            unset($this->user_states[$user_id][$noDataPath]);
        }
    }
    public function getDisconnectReleased(int $user_id)
    {
        /**
         * Only Do State Release When All connections are closed.
         */
        if (isset($this->user_connections[$user_id])) {
            $this->user_connections[$user_id]--;
            if ($this->user_connections[$user_id] > 0) {
                return [];
            }
            unset($this->user_connections[$user_id]);
        }

        /**
         * Release database
         */
        WebsocketUserState::query()->where("user_id", $user_id)->delete();
        unset($this->user_states[$user_id]);

        /**
         * Collect State to Release
         */
        if (!isset($this->states[$user_id])) {
            return [];
        }
        $ret = [];
        foreach ($this->states[$user_id] as $_ => $path) {
            $ret[] = $path;
        }
        unset($this->states[$user_id]);
        return $ret;
    }
    public function clear()
    {
        WebsocketUserState::query()->delete();
    }
}