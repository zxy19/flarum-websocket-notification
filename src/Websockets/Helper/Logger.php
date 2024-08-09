<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Illuminate\Console\Command;

class Logger
{
    protected Command $commandContext;
    public function setContext(Command $context)
    {
        $this->commandContext = $context;
    }
    public function setCommandContext(Command $context)
    {
        $this->commandContext = $context;
    }
    public function info($message)
    {
        $this->commandContext->info($message);
    }
    public function verbose($message)
    {
        $this->commandContext->info($message, "v");
    }
    public function warn($message)
    {
        $this->commandContext->warn($message);
    }
    public function error($message)
    {
        $this->commandContext->error($message);
    }
    public function debug($message)
    {
        $this->commandContext->comment($message, "vvv");
    }
    public function alert($message)
    {
        $this->commandContext->alert($message);
    }
}