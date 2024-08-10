<?php

namespace Xypp\WsNotification\Websockets\Helper;

use Illuminate\Console\Command;
use Psr\Log\LoggerInterface;

class Logger implements LoggerInterface
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
    public function info($message, array $context = [])
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
    public function error($message, array $context = [])
    {
        $this->commandContext->error($message);
    }
    public function debug($message, array $context = [])
    {
        $this->commandContext->comment($message, "vvv");
    }
    public function alert($message, array $context = [])
    {
        $this->commandContext->alert($message);
    }

    function critical($message, array $context = [])
    {
        $this->error($message);
    }
    function emergency($message, array $context = [])
    {
        $this->alert($message);
    }
    function log($level, $message, array $context = [])
    {
        $this->verbose($message);
    }
    function notice($message, array $context = [])
    {
        $this->debug($message);
    }
    function warning($message, array $context = [])
    {
        $this->warn($message);
    }
}