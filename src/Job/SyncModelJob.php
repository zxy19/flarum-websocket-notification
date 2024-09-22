<?php

namespace Xypp\WsNotification\Job;
use Flarum\Foundation\ValidationException;
use Flarum\Queue\AbstractJob;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\Bridge;

class SyncModelJob extends AbstractJob
{
    private ModelPath $path;

    public function __construct(ModelPath $modelPath)
    {
        $this->path = $modelPath;
    }

    public function handle(Bridge $bridge, SettingsRepositoryInterface $settings)
    {
        if (!$settings->get("xypp.ws_notification.common.enable")) {
            return;
        }
        if ($bridge->check()) {
            $bridge->sync($this->path);
            if ($settings->get("xypp.ws_notification.common.wait_done") ?? false)
                $bridge->waitAll();
        } else {
            throw new ValidationException(["msg" => "websocket is not ready"]);
        }
    }
}