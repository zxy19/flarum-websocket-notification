<?php

namespace Xypp\WsNotification\Util;

use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\WebsocketAccessToken;

class AddrUtil
{
    public static function getAddr(SettingsRepositoryInterface $setting, WebsocketAccessToken $token, bool $local = false): string
    {
        $config = WebsocketConfig::readSetting($setting, $local ? 'internal' : 'websocket', $local ? "127.0.0.1" : "0.0.0.0", $local ? 18081 : 18080);
        $scheme = ($config->pk && $config->cert) ? 'wss' : 'ws';
        $addr = $config->address;
        if ($addr === '0.0.0.0' && $local) {
            $addr = '127.0.0.1';
        }
        $port = $config->port;
        return "{$scheme}://{$addr}:{$port}/{$token}";
    }
}