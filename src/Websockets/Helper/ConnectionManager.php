<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Flarum\User\Guest;
use Flarum\User\User;
use Psr\Http\Message\ServerRequestInterface;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\WebsocketAccessToken;
use Websocket;

class ConnectionManager
{
    const RETRY_CNT = 3;
    protected array $connections = [];
    protected array $id2user_id = [];
    protected array $id2user_obj = [];
    protected array $broken = [];
    protected int $id = 0;
    protected DataDispatchHelper $helper;
    protected Logger $logger;
    public function __construct(DataDispatchHelper $helper, Logger $logger)
    {
        $this->helper = $helper;
        $this->logger = $logger;
    }
    public function add(WebSocket\Connection $connection, ServerRequestInterface $request): int
    {
        $url = $request->getUri();
        $code = $url->getPath();
        $code = trim($code, '/?#\\:=');
        $this->id++;
        $connection->setMeta('id', $this->id);

        $access = WebsocketAccessToken::where("token", $code)->first();
        if (!$access || !$access->valid()) {
            $connection->close();
            return 0;
        }
        $connection->setMeta("internal", !!$access->internal);
        if ($access->user_id) {
            $connection->setMeta("user_id", $access->user_id);
            $this->id2user_id[$this->id] = $access->user_id;
            $this->id2user_obj[$this->id] = User::find($access->user_id);
        }
        $access->delete();

        $this->connections[$this->id] = $connection;

        return $this->id;
    }
    public function remove($id)
    {
        if (isset($this->connections[$id]))
            unset($this->connections[$id]);
        if (isset($this->id2user_id[$id]))
            unset($this->id2user_id[$id]);
        if (isset($this->id2user_obj[$id]))
            unset($this->id2user_obj[$id]);
    }
    public function get($id): ?\WebSocket\Connection
    {
        if (!isset($this->connections[$id])) {
            return null;
        }
        return $this->connections[$id];
    }
    public function user($id)
    {
        return $this->id2user_id[$id] ?? null;
    }
    public function userObj($id): User
    {
        return $this->id2user_obj[$id] ?? new Guest();
    }
    public function isInternal($id): bool
    {
        return $this->get($id)->getMeta("internal") ?? false;
    }
    public function send($id, string $data)
    {
        $connection = $this->get($id);
        if ($connection) {
            for ($i = 0; $i < self::RETRY_CNT; $i++) {
                try {
                    $connection->send(new WebSocket\Message\Text($data));
                    break;
                } catch (\Exception $e) {
                    if ($i == self::RETRY_CNT - 1) {
                        $this->logger->warn("send error:  id: $id");
                        try {
                            $connection->close();
                        } catch (\Exception $e) {
                        }
                        $this->remove($id);
                        $this->broken[] = $id;
                    }
                    continue;
                }
            }
        } else {
            $this->logger->warn("send not found id: $id");
            $this->broken[] = $id;
        }
    }
    public function broadcast(?array $ids, string $data)
    {
        if ($ids === null) {
            $ids = array_keys($this->connections);
        }
        foreach ($ids as $id) {
            $this->send($id, $data);
        }
    }
    public function groupIdByUser(array $ids)
    {
        $ret = [];
        foreach ($ids as $id) {
            $user_id = null;
            if (isset($this->id2user_id[$id]))
                $user_id = $this->id2user_id[$id];
            if (!$user_id) {
                $user_id = 0;
            }
            if (!isset($ret[$user_id])) {
                $ret[$user_id] = [];
            }
            $ret[$user_id][] = $id;
        }
        return $ret;
    }

    public function clear()
    {
        WebsocketAccessToken::query()->delete();
    }

    public function getBroken(): array
    {
        $ret = array_unique($this->broken);
        $this->broken = [];
        $this->logger->debug("to be cleared: " . count($ret));
        return $ret;
    }
}