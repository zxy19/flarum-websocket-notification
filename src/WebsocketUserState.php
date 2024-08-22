<?php

namespace Xypp\WsNotification;

use Carbon\Carbon;
use Flarum\Database\AbstractModel;
use Flarum\Database\ScopeVisibilityTrait;
use Flarum\Foundation\EventGeneratorTrait;
use Flarum\User\User;
use Xypp\WsNotification\Data\ModelPath;

class WebsocketUserState extends AbstractModel
{
    protected $dates = ['created_at', 'updated_at'];
    protected $casts = [
        'data' => 'array',
    ];
    protected $table = 'websocket_user_state';
    public function user()
    {
        return $this->belongsTo(User::class, "user_id", "id");
    }
    public static function createPath(int $user_id, ModelPath $modelPath): WebsocketUserState
    {
        $instance = new static();
        $instance->user_id = $user_id;
        $instance->setWithPath($modelPath);
        $instance->name = $modelPath->getName();
        $instance->updateTimestamps();
        $instance->save();
        return $instance;
    }

    public function setWithPath(ModelPath $modelPath)
    {
        $id = $modelPath->getId("state");
        if (!$id) {
            return;
        }
        $str = strval($modelPath->withoutData()->remove("state")->remove("session"));
        $this->data = $modelPath->getData();
        $this->path = $str;
    }
}
