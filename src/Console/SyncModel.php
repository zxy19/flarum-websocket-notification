<?php

namespace Xypp\WsNotification\Console;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Bridge;
use Xypp\WsNotification\Websockets\Main;
use Xypp\WsNotification\Websockets\MainWebsocket;

class SyncModel extends Command
{
    /**
     * @var string
     */
    protected $signature = 'xypp-wsn:sync';

    /**
     * @var string
     */
    protected $description = 'Sync Model';
    protected $bridge;
    public function __construct(Bridge $bridge)
    {
        parent::__construct();
        $this->addArgument('model', InputOption::VALUE_REQUIRED, 'Model Path String');
        $this->bridge = $bridge;
    }

    public function handle()
    {
        $model = $this->argument('model');
        $path = new ModelPath($model);
        $this->bridge->sync($path);
    }
}