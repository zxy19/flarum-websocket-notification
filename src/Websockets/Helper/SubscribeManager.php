<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;

class SubscribeManager
{
    protected array $subscribes = [];
    protected array $user2subPath = [];
    protected DataDispatchHelper $helper;
    protected ConnectionManager $connections;
    public function __construct(DataDispatchHelper $helper, ConnectionManager $connections)
    {
        $this->helper = $helper;
        $this->connections = $connections;
    }
    public function subscribe(int $id, ModelPath $path)
    {
        if (
            !$this->helper->canSubscribe(
                $this->connections->user($id),
                $path
            )
        ) {
            return false;
        }
        $currentObj = &$this->subscribes;
        foreach ($path->getKeys() as $p) {
            if (!isset($currentObj[$p])) {
                $currentObj[$p] = [];
            }
            $currentObj = &$currentObj[$p];
        }
        if (!isset($currentObj['_ids'])) {
            $currentObj['_ids'] = [];
        }
        $currentObj['_ids'][] = $id;
        if (!isset($this->user2subPath[$id])) {
            $this->user2subPath[$id] = [];
        }
        $this->user2subPath[$id][] = $path;
        return true;
    }
    public function unsubscribe(int $id)
    {
        if (!isset($this->user2subPath[$id])) {
            return;
        }
        foreach ($this->user2subPath[$id] as $path) {
            $currentObj = &$this->subscribes;
            foreach ($path->getKeys() as $p) {
                if (!isset($currentObj[$p])) {
                    return;
                }
                $currentObj = &$currentObj[$p];
            }
            if (isset($currentObj['_ids'])) {
                $currentObj['_ids'] = array_filter($currentObj['_ids'], function ($v) use ($id) {
                    return $v != $id;
                });
            }
        }
        $this->user2subPath[$id] = [];
    }
    public function collectIdForPath(ModelPath $path): array
    {
        return $this->walkThroughPath($path, $this->subscribes, 0);
    }
    public function walkThroughPath(ModelPath $path, $subscribe, int $level)
    {
        $ret = [];
        if ($level >= count($path->path)) {
            if (isset($subscribe["_ids"])) {
                $ret = $subscribe["_ids"];
            }
            return $ret;
        }
        $p = $path->path[$level];
        $key = $p["name"] . "[" . ($p["id"] ?: "*") . "]";
        $keyWide = $p["name"] . "[" . "*" . "]";
        if (isset($subscribe[$key])) {
            $ret = array_merge($ret, $this->walkThroughPath($path, $subscribe[$key], $level + 1));
        }
        if ($keyWide != $key && isset($subscribe[$keyWide])) {
            $ret = array_merge($ret, $this->walkThroughPath($path, $subscribe[$keyWide], $level + 1));
        }
        return $ret;
    }
}