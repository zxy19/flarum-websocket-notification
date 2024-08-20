<?php

namespace Xypp\WsNotification\Console;

use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Xypp\WsNotification\Data\WebsocketConfig;
use Xypp\WsNotification\Websockets\Main;
use Xypp\WsNotification\Websockets\MainWebsocket;

class Worker extends Command
{
    /**
     * @var string
     */
    protected $signature = 'xypp-wsn:worker';

    /**
     * @var string
     */
    protected $description = 'Start a worker.';
    protected $main;
    protected $settings;
    public function __construct(\Xypp\WsNotification\Websockets\Worker\Worker $main, SettingsRepositoryInterface $settings)
    {
        parent::__construct();
        $this->settings = $settings;
        $this->main = $main;
    }

    public function handle()
    {
        $this->info("Starting Worker...");
        $this->main->start($this);
    }
}