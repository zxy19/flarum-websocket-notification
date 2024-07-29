<?php

namespace Xypp\WsNotification\Api\Serializer;

use Flarum\Api\Serializer\AbstractSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Util\AddrUtil;

class WebsocketAccessTokenSerializer extends AbstractSerializer
{
    protected $type = 'websocket-access-token';
    protected $settings;
    public function __construct(SettingsRepositoryInterface $settingsRepositoryInterface)
    {
        $this->settings = $settingsRepositoryInterface;
    }
    public function getDefaultAttributes($token)
    {
        return [
            'token' => $token->token,
            'url' => AddrUtil::getAddr($this->settings, $token, false),
        ];
    }
}