<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\DataDispatchHelper;
use Xypp\WsNotification\Websockets\Util\PathMatchUtil;

class PasterMessageManager
{
    protected DataDispatchHelper $helper;
    protected ConnectionManager $connections;
    protected Logger $logger;
    protected SyncManager $syncManager;
    protected int $maxRestoreCount;
    protected int $maxRecordCount;
    protected int $maxRestoreTime;
    protected array $tree = [];
    protected array $records = [];

    public function __construct(DataDispatchHelper $helper, ConnectionManager $connections, SettingsRepositoryInterface $settings, SyncManager $syncManager, Logger $logger)
    {
        $this->helper = $helper;
        $this->connections = $connections;
        $this->logger = $logger;
        $this->syncManager = $syncManager;
        $this->maxRecordCount = $settings->get("xypp.ws_notification.paster.max_record_count") ?? 100000;
        $this->maxRestoreCount = $settings->get("xypp.ws_notification.paster.max_restore_count") ?? 100;
        $this->maxRestoreTime = $settings->get("xypp.ws_notification.paster.max_restore_time") ?? 3600;
    }

    public function refresh()
    {
        while ($head = array_key_first($this->records)) {
            if (time() - $this->records[$head]["time"] > $this->maxRestoreTime) {
                $this->logger->debug("[PasterMessageManager]: Record expired: " . $head);
                unset($this->records[$head]);
            } else {
                break;
            }
        }
    }
    public function remove(ModelPath $path)
    {
        $pathNoData = $path->withoutData()->remove("session");
        if (isset($this->records[strval($pathNoData)])) {
            unset($this->records[strval($pathNoData)]);
            $this->logger->debug("[PasterMessageManager]: Record removed: " . strval($path));
        }
    }
    public function add(ModelPath $path)
    {
        $isRelease = false;
        if ($path->get("release")) {
            $isRelease = true;
            $path = $path->clone()->remove("release");
        }
        $pathNoData = $path->withoutData()->remove("session");

        if (isset($this->records[strval($pathNoData)])) {
            unset($this->records[strval($pathNoData)]);
        }
        $this->records[strval($pathNoData)] = [
            "path" => $path,
            "time" => time(),
            "isRelease" => $isRelease,
        ];
        $this->logger->debug("[PasterMessageManager]: Record added: [" . $pathNoData . "]=" . strval($path));
    }
    public function sync(ModelPath $subscribe, int $time, int $id)
    {
        $this->logger->debug("[PasterMessageManager]: Sync paster ($time) => ($id): " . strval($subscribe));
        $time = min($time, $this->maxRestoreTime);
        $current = end($this->records);
        while ($current !== false) {
            if (time() - $current["time"] > $time) {
                break;
            }
            if (PathMatchUtil::match($current["path"], $subscribe)) {
                $this->logger->verbose("[PasterMessageManager]: Sync paster model: " . strval($current["path"]));
                /**
                 * @var ModelPath $path
                 */
                $path = $current["path"];
                if ($path->get("state")) {
                    if ($current['isRelease']) {
                        $this->syncManager->performReleasing($current["path"]);
                    } else {
                        $this->syncManager->performSyncState($current["path"], [$id]);
                    }
                } else {
                    $this->syncManager->performSync($current["path"], [$id]);
                }
            }
            $current = prev($this->records);
        }
    }
}