<?php

namespace Xypp\WsNotification\Websockets\Helper;

class JobIdManager
{
    protected array $connectionJobs = [];
    protected array $jobIdConnections = [];
    protected array $connectionDone = [];
    protected array $connectionSent = [];

    protected int $jobId = 1;

    protected ConnectionManager $connectionManager;
    protected Logger $logger;
    public function __construct(ConnectionManager $connectionManager, Logger $logger)
    {
        $this->connectionManager = $connectionManager;
        $this->logger = $logger;
    }
    public function getJobId(int $connectionId)
    {
        $ret = $this->jobId++;
        if (!isset($this->connectionJobs[$connectionId])) {
            $this->connectionJobs[$connectionId] = [];
        }
        $this->jobIdConnections[$ret] = $connectionId;
        $this->connectionJobs[$connectionId][$ret] = false;
        $this->logger->debug("[JobManager] + New job id: $ret");
        return $ret;
    }

    public function doneJobId(int $job_id)
    {
        $this->logger->debug("[JobManager] - Job id $job_id done");
        if (!isset($this->jobIdConnections[$job_id]))
            return;
        $connectionId = $this->jobIdConnections[$job_id];
        unset($this->jobIdConnections[$job_id]);
        if (isset($this->connectionJobs[$connectionId][$job_id]) && $this->connectionJobs[$connectionId][$job_id] == false) {
            $this->connectionJobs[$connectionId][$job_id] = true;

            if (!isset($this->connectionDone[$connectionId])) {
                $this->connectionDone[$connectionId] = 0;
            }
            $this->connectionDone[$connectionId]++;

            $this->checkAllDone($connectionId);
        }
    }

    public function setWaitJobs(int $connectionId, int $sent)
    {
        $this->logger->debug("[JobManager] = setWaitJobs(" . $connectionId . ")=" . $sent);
        $this->connectionSent[$connectionId] = $sent;
        $this->checkAllDone($connectionId);
    }

    protected function checkAllDone(int $connectionId)
    {
        if (isset($this->connectionSent[$connectionId]) && isset($this->connectionDone[$connectionId])) {
            if ($this->connectionSent[$connectionId] <= $this->connectionDone[$connectionId]) {
                $this->logger->debug("[JobManager] * Connection Done({$connectionId})");
                $this->clearForConnection($connectionId);
                $this->connectionManager->send($connectionId, json_encode(["type" => "done"]));
            }
        }
    }

    public function clearForConnection(int $connection)
    {
        $this->logger->debug("[JobManager] * Clear for connection({$connection})");
        if (isset($this->connectionSent[$connection]))
            unset($this->connectionSent[$connection]);
        if (isset($this->connectionDone[$connection]))
            unset($this->connectionDone[$connection]);
        if (isset($this->connectionJobs[$connection])) {
            foreach ($this->connectionJobs[$connection] as $job => $_) {
                unset($this->jobIdConnections[$job]);
            }
            unset($this->connectionJobs[$connection]);
        }
    }
}