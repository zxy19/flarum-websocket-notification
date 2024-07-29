<?php

namespace Xypp\WsNotification\Data;

use Flarum\Settings\SettingsRepositoryInterface;

class WebsocketConfig
{
    public string $address;
    public int $port;
    public ?string $cert;
    public ?string $pk;
    public ?bool $selfSigned;
    public function __construct(string $address, int $port, ?string $cert, ?string $pk, ?bool $selfSigned)
    {
        $this->address = $address;
        $this->port = $port;
        $this->cert = $cert;
        $this->pk = $pk;
        $this->selfSigned = $selfSigned;
    }
    public static function readSetting(SettingsRepositoryInterface $setting, $group = 'ws', string $defaultAddress = "0.0.0.0", int $defaultPort = 18080)
    {
        $address = $setting->get("xypp.ws_notification." . $group . '.address', $defaultAddress);
        $port = $setting->get("xypp.ws_notification." . $group . '.port', $defaultPort);
        $cert = $setting->get("xypp.ws_notification." . $group . '.cert');
        $pk = $setting->get("xypp.ws_notification." . $group . '.pk');
        $selfSigned = $setting->get("xypp.ws_notification." . $group . '.self_signed') ?: false;
        return new self($address, $port, $cert, $pk, $selfSigned);
    }
}