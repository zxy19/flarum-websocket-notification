<?php

namespace Xypp\WsNotification\Helper;

use Flarum\Settings\SettingsRepositoryInterface;
use Phrity\Net\Uri;
use Illuminate\Contracts\Queue\Queue;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Job\SyncModelJob;
use Xypp\WsNotification\Util\AddrUtil;
use Xypp\WsNotification\WebsocketAccessToken;
use WebSocket;
use function React\Async\await;

class Bridge
{
    protected $settings;
    protected Queue $queue;
    protected $jobs = [];
    protected ?int $timeout = null;
    protected bool $noQueue = false;
    public function __construct(SettingsRepositoryInterface $settings, Queue $queue)
    {
        $this->settings = $settings;
        $this->queue = $queue;
    }

    /**
     * Sync Model, decide whether to queue or sync automatically
     * @param \Xypp\WsNotification\Data\ModelPath $path
     * @return static
     */
    public function sync(ModelPath $path)
    {
        $this->jobs[] = ["sync", $path];
        return $this;
    }
    public function _sync(\Ratchet\Client\WebSocket $connection, ModelPath $path): bool
    {
        try {
            $connection->send(json_encode([
                "type" => "sync",
                "path" => $path->getPath()
            ]));
        } catch (\Exception $e) {
            return false;
        }
        return true;
    }
    
    /**
     * Execute send jobs
     * @return bool
     */
    public function exec(): bool
    {
        // If disabled, return false
        if (!$this->settings->get("xypp.ws_notification.common.enable"))
            return false;
        // If queue is enabled, push jobs to queue
        if($this->settings->get("xypp.ws_notification.common.queue") && !$this->noQueue){
            foreach($this->jobs as $_job) {
                [$type, $data] = $_job;
                if ($type === "sync") {
                    $this->queue->push(new SyncModelJob($data));
                }
            }
            $this->jobs = [];
            return true;
        }
        $token = WebsocketAccessToken::generate(null, 10, true);
        $uri = AddrUtil::getAddr($this->settings, $token, true);
        $done = false;
        try {
            $loop = \React\EventLoop\Factory::create();
            await(
                \Ratchet\Client\connect($uri, [], [], $loop)
                    ->then(function (\Ratchet\Client\WebSocket $conn) use ($loop, &$done) {
                        // Just return with done if no jobs
                        if (count($this->jobs) === 0) {
                            $done = true;
                            $conn->close();
                        }

                        // Handle done
                        $conn->on('message', function (\Ratchet\RFC6455\Messaging\MessageInterface $msg) use ($conn, &$done) {
                            $data = json_decode($msg->getContents());
                            if ($data->type == "done") {
                                $conn->close();
                                $done = true;
                            }
                        });

                        // Send jobs, count how many jobs are sent
                        $sentJob = 0;
                        foreach ($this->jobs as $_job) {
                            [$type, $data] = $_job;
                            if ($type === "sync") {
                                if ($this->_sync($conn, $data)) {
                                    $sentJob++;
                                }
                            }
                        }

                        // If timeout is set, wait for all jobs to be done
                        if ($this->timeout) {
                            $conn->send(json_encode([
                                "type" => "waitAll",
                                "jobs" => $sentJob
                            ]));
                            $loop->addTimer($this->timeout, function () use ($conn) {
                                $conn->close();
                            });
                        } else {
                            $conn->close();
                            $done = true;
                        }
                    })
            );
        } catch (\Exception $e) {
            return false;
        } finally {
            $this->jobs = [];
        }
        return $done;
    }
    /**
     * 设置执行的时候等待
     * @param int $timeout
     * @return static
     */
    public function waitAll(?int $timeout = 60)
    {
        $this->timeout = $timeout;
        return $this;
    }

    public function autoWait()
    {
        if ($this->settings->get("xypp.ws_notification.common.wait_done")) {
            $this->waitAll();
        }
        return $this;
    }

    public function noQueue()
    {
        $this->noQueue = true;
        return $this;
    }
}