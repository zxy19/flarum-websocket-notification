<?php

namespace Xypp\WsNotification\Console;

use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Websockets\Main;
use Xypp\WsNotification\Websockets\MainWebsocket;

class Serve extends Command
{
    /**
     * @var string
     */
    protected $signature = 'xypp-wsn:serve';

    /**
     * @var string
     */
    protected $description = 'Start server.';
    protected $main;
    protected $settings;
    public function __construct(MainWebsocket $main, SettingsRepositoryInterface $settings)
    {
        parent::__construct();
        $this->settings = $settings;
        $this->main = $main;
    }

    public function handle()
    {
        $this->info("Starting server...");
        $this->main->start(
            $this,
            WebsocketConfig::readSetting($this->settings, 'websocket'),
            WebsocketConfig::readSetting($this->settings, 'internal', "127.0.0.1", 18081)
        );
    }
}