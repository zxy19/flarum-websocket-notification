<?php

namespace Xypp\WsNotification\Helper;

use Flarum\Settings\SettingsRepositoryInterface;
use Phrity\Net\Uri;
use Illuminate\Contracts\Queue\Queue;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Job\SyncModelJob;
use Xypp\WsNotification\Util\AddrUtil;
use Xypp\WsNotification\WebsocketAccessToken;
use WebSocket\Message\Text;
use WebSocket;

class Bridge
{
    protected ?\Websocket\Client $connection = null;
    protected $formed = false;
    protected $settings;
    protected int $sentJobs;

    protected Queue $queue;
    public function __construct(SettingsRepositoryInterface $settings, Queue $queue)
    {
        $this->settings = $settings;
        $this->queue = $queue;
        $this->connection = null;
        $this->formed = false;
        $this->sentJobs = 0;
    }
    public function __destruct()
    {
        if ($this->formed)
            if ($this->connection) {
                $this->connection->close();
            }
    }

    public function queue(ModelPath $path)
    {
        if (!$this->settings->get("xypp.ws_notification.common.enable"))
            return;
        if (!$this->settings->get("xypp.ws_notification.common.queue")) {
            $this->sync($path);
        } else
            $this->queue->push(new SyncModelJob($path));
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
            $this->sentJobs++;
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
            $this->sentJobs++;
            $this->connection->send(new Text(json_encode([
                "type" => "state",
                "user_id" => $user_id,
                "states" => $newStates,
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

    public function waitAll(int $timeout = 60)
    {
        $startTime = time();
        $this->connection->send(new Text(json_encode([
            "type" => "waitAll",
            "jobs" => $this->sentJobs
        ])));
        $this->connection->onText(function ($client, $connection, $message) {
            $data = json_decode($message->getContent());
            if ($data->type == "done") {
                $this->connection->stop();
            }
        });
        $this->connection->onTick(function () use ($startTime, $timeout) {
            if (time() - $startTime > $timeout) {
                $this->connection->stop();
            }
        });
        $this->connection->start();
        $this->sentJobs = 0;
    }
}