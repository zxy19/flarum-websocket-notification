<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Psr\Http\Message\ServerRequestInterface;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\WebsocketAccessToken;
use Websocket;

class ConnectionManager
{
    protected array $connections = [];
    protected array $id2user_id = [];
    protected array $user_id2connections = [];
    protected int $id = 0;
    protected DataDispatchHelper $helper;
    public function __construct(DataDispatchHelper $helper)
    {
        $this->helper = $helper;
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
            $this->id2user_id[$this->id] = $access->user_id ?: 0;
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
    public function broadcast(?array $ids, string $data)
    {
        if ($ids === null) {
            $ids = array_keys($this->connections);
        }
        foreach ($ids as $id) {
            $connection = $this->get($id);
            if ($connection) {
                $connection->send(new WebSocket\Message\Text($data));
            }
        }
    }
    public function groupIdByUser(array $ids)
    {
        $ret = [];
        foreach ($ids as $id) {
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
}