<?php

namespace Xypp\WsNotification\Data;

class ModelPath implements \Stringable
{
    public array $path;
    public ?array $data;
    public function __construct(?string $path = null)
    {
        $this->path = [];
        $this->data = null;
        if ($path) {
            if (str_ends_with($path, "}")) {
                $t = explode("||", $path);
                $path = $t[0];
                $this->data = json_decode($t[1], true);
            }

            $this->path = explode(".", $path);
            array_walk($this->path, function (&$value) {
                $value = trim($value);
                if (str_ends_with($value, "]")) {
                    $t = explode("[", $value);
                    $value = [
                        "name" => $t[0],
                        "id" => trim($t[1], "]")
                    ];
                } else {
                    $value = [
                        "name" => $value,
                        "id" => null
                    ];
                }
            });
        }

    }
    public function add(string $path): ModelPath
    {
        return $this->addWithId($path, null);
    }
    public function addWithId(string $path, ?int $id): ModelPath
    {
        $this->path[] = [
            "name" => $path,
            "id" => $id
        ];
        return $this;
    }

    public function get(?string $type = null)
    {
        if (!$type)
            return $this->path[count($this->path) - 1];
        foreach ($this->path as $p) {
            if ($p["name"] == $type) {
                return $p;
            }
        }
        return null;
    }
    public function getId(?string $type = null): ?string
    {
        $tmp = $this->get($type);
        if ($tmp) {
            return $tmp["id"];
        }
        return null;
    }
    public function getName(?string $type = null): ?string
    {
        $tmp = $this->get($type);
        if ($tmp) {
            return $tmp["name"];
        }
        return null;
    }
    public function getData()
    {
        return $this->data;
    }
    public function setData(?array $data): ModelPath
    {
        $this->data = $data;
        return $this;
    }

    public function getPath(): string
    {
        return strval($this);
    }
    public function getKeys(): array
    {
        $ret = [];
        for ($i = 0; $i < count($this->path); $i++) {
            $ret[] = $this->path[$i]["name"] . "[" . ($this->path[$i]["id"] ?: "*") . "]";
        }
        return $ret;
    }
    public function isInPath(string $path): bool
    {
        return !!$this->get($path);
    }

    public function each(callable $callback): void
    {
        foreach ($this->path as $p) {
            $callback($p['name'], $p['id']);
        }
    }
    public function __tostring(): string
    {
        $ret = "";
        for ($i = 0; $i < count($this->path); $i++) {
            if ($i > 0) {
                $ret .= ".";
            }
            $ret .= $this->path[$i]["name"];
            if ($this->path[$i]["id"]) {
                $ret .= "[" . $this->path[$i]["id"] . "]";
            }
        }
        if ($this->data) {
            $ret .= "||" . json_encode($this->data);
        }
        return $ret;
    }
}