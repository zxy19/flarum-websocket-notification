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
        $attributes["xyppWsnTypeTip"] = $this->settings->get('xypp.ws_notification.function.type') ?? true;
        $attributes["xyppWsnTypeTipCountLimit"] = $this->settings->get('xypp.ws_notification.options.typing_limit') ?? 4;
        return $attributes;
    }
}