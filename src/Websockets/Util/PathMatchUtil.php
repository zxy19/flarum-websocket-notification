<?php
namespace Xypp\WsNotification\Websockets\Util;
use Xypp\WsNotification\Data\ModelPath;

class PathMatchUtil
{
    public static function match(ModelPath $path1, ModelPath $path2)
    {
        $keys1 = $path1->path;
        $keys2 = $path2->path;

        if (count($keys1) != count($keys2))
            return false;

        for ($i = 0; $i < count($keys1); $i++) {
            $name1 = $keys1[$i]["name"];
            $name2 = $keys2[$i]["name"];
            if ($name1 != $name2)
                return false;
            $id1 = $keys1[$i]["id"] ?: "*";
            $id2 = $keys2[$i]["id"] ?: "*";
            if ($id1 != $id2 && $id1 != "*" && $id2 != "*")
                return false;
        }
        return true;
    }
}