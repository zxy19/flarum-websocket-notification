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
    protected DiscussionSerializer $serializer;
    public function __construct(DiscussionSerializer $serializer)
    {
        parent::__construct("discussion", Discussion::class);
        $this->serializer = $serializer;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        $user = new Guest();
        if ($user_id) {
            $user = User::find($user_id);
        }
        $this->serializer->setRequest(RequestForSerializer::createWithId($user_id));
        $this->serializer->getAttributes($model);
        $sync($this->serializer->getAttributes($model));
    }
    public function getModel(ModelPath $id)
    {
        return Discussion::find($id->getId());
    }
}