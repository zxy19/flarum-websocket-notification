<?php

namespace Xypp\WsNotification\Helper;

use Flarum\Settings\SettingsRepositoryInterface;
use Phrity\Net\Uri;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\AddrUtil;
use Xypp\WsNotification\WebsocketAccessToken;
use WebSocket\Message\Text;
use WebSocket;

class Bridge
{
    protected ?\Websocket\Client $connection = null;
    protected $formed = false;
    protected $settings;
    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
        $this->connection = null;
        $this->formed = false;
    }
    public function __destruct()
    {
        if ($this->formed)
            if ($this->connection) {
                $this->connection->close();
            }
    }
    protected function formConnection(): bool
    {
        if ($this->formed)
            if ($this->connection) {
                if ($this->connection->isConnected() && $this->connection->isWritable()) {
                    return true;
                }
            }
        $token = WebsocketAccessToken::generate(null, 10, true);
        $uri = new Uri(AddrUtil::getAddr($this->settings, $token, true));
        $this->connection = new \WebSocket\Client($uri);
        try {
            $this->connection->connect();
        } catch (\Exception $e) {
            unset($this->connection);
            return false;
        }
        $this->formed = true;
        return true;
    }
    public function sync(ModelPath $path): bool
    {
        if (!$this->formConnection())
            return false;
        try {
            $this->connection->send(new Text(json_encode([
                "type" => "sync",
                "path" => $path->getPath()
            ])));
        } catch (\Exception $e) {
            return false;
        }
        return true;
    }
    public function state($user_id, $newStates): bool
    {
        if (!$this->formConnection())
            return false;
        try {
            $this->connection->send(new Text(json_encode([
                "type" => "state",
                "user_id" => $user_id,
                "states" => $newStates
            ])));
        } catch (\Exception $e) {
            return false;
        }
        return true;
    }
    public function check(): bool
    {
        return $this->formConnection();
    }
}