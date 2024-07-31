<?php

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\User\Guest;
use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;

class DiscussionData extends AbstractDataDispatchType
{
    public function __construct()
    {
        parent::__construct("discussion", Discussion::class);
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        $sync($model);
    }
    public function getModel(ModelPath $id)
    {
        $data = $id->getData();
        $discussion = Discussion::find($id->getId());
        return [
            "id" => $discussion->id,
            "title" => $discussion->title,
            "post" => $data["post"]
        ];
    }
}