<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;

class SubscribeManager
{
    protected array $subscribes = [];
    protected array $user2subPath = [];
    protected DataDispatchHelper $helper;
    protected ConnectionManager $connections;
    protected int $maxSubscribeHold;
    public function __construct(DataDispatchHelper $helper, ConnectionManager $connections, SettingsRepositoryInterface $settings)
    {
        $this->helper = $helper;
        $this->connections = $connections;
        $this->maxSubscribeHold = $settings->get("xypp.ws_notification.common.max_subscribe_hold") ?? 10;
    }
    public function subscribe(int $id, ModelPath $path)
    {
        if (!isset($this->user2subPath[$id])) {
            $this->user2subPath[$id] = [];
        }
        if (count($this->user2subPath[$id]) >= $this->maxSubscribeHold) {
            return false;
        }
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
                for ($i = 0; $i < count($currentObj['_ids']); $i++) {
                    if ($currentObj['_ids'][$i] == $id) {
                        array_splice($currentObj['_ids'], $i, 1);
                        break;
                    }
                }
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