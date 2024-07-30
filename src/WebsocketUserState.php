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
    protected $dates = ['created_at', 'expires_at'];
    protected $casts = [
        'state' => 'array',
    ];
    protected $table = 'websocket_user_state';
    public function user()
    {
        return $this->belongsTo(User::class, "user_id", "id");
    }
    public static function create(int $user_id): WebsocketUserState
    {
        $instance = new static();
        $instance->user_id = $user_id;
        $instance->state = [];
        $instance->updateTimestamps();
        $instance->save();
        return $instance;
    }
    public function setState(ModelPath $modelPath, $data)
    {
        $state = $this->state[$modelPath->getPath()] ?? [];
        $state[$modelPath->getPath()] = $data;
        $this->state = $state;
    }
    public function getState(ModelPath $modelPath, $data)
    {
        return $this->state[$modelPath->getPath()] ?? null;
    }
}
