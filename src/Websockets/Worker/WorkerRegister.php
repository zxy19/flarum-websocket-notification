<?php

namespace Xypp\WsNotification\Websockets\Worker;

use WebSocket\Message\Text;
use Xypp\WsNotification\Data\ModelPath;

class WorkerRegister
{
    public \Websocket\Connection $connection;
    public bool $alive;
    public int $id;
    public function __construct(\Websocket\Connection $connection)
    {
        $this->connection = $connection;
        $this->id = $connection->getMeta("id");
        $this->alive = $connection->isConnected();
    }
    public function dispatch(ModelPath $modelPath, array $idGrped, bool $isState)
    {
        $this->connection->send(new Text(json_encode([
            "type" => "job",
            "ids" => $idGrped,
            "state" => $isState,
            "path" => strval($modelPath)
        ])));
    }
    public function stop()
    {
        $this->alive = false;
        try {
            $this->connection->close();
        } catch (\Exception $e) {
        }
    }
}