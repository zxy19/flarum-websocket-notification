<?php

namespace Xypp\WsNotification\Integration\TypeTip;

use Flarum\Settings\SettingsRepositoryInterface;

class TypeTipAttr
{
    protected $settings;
    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }
    public function __invoke($serializer, $model, $attributes)
    {
        return $this->settings->get('xypp.ws_notification.function.type')??true;
    }
}