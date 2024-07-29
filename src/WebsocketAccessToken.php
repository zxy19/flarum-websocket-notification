<?php

namespace Xypp\WsNotification;

use Carbon\Carbon;
use Flarum\Database\AbstractModel;
use Flarum\Database\ScopeVisibilityTrait;
use Flarum\Foundation\EventGeneratorTrait;
use Flarum\User\User;

class WebsocketAccessToken extends AbstractModel implements \Stringable
{
    protected $dates = ['expires_at'];
    protected $table = 'websocket_access_token';
    public function user()
    {
        return $this->belongsTo(User::class, "user_id", "id");
    }
    public function valid()
    {
        return $this->expires_at->gte(Carbon::now());
    }
    public function __tostring()
    {
        return $this->token;
    }
    public static function generate(?User $user = null, int $expire = 10, bool $su = false)
    {
        $token = new static;
        $token->user_id = ($user && !$user->isGuest()) ? $user->id : null;
        $token->token = md5(bin2hex(random_bytes(32)) . time() . $token->user_id);
        $token->expires_at = Carbon::now()->addSeconds($expire);
        $token->internal = $su;
        $token->save();
        return $token;
    }
}
