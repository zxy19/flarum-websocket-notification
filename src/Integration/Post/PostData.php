<?php

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Api\Controller\ShowPostController;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Post\Post;
use Flarum\User\Guest;
use Flarum\User\User;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;

class PostData extends AbstractDataDispatchType
{
    protected ShowPostController $controller;
    public function __construct(ShowPostController $controller)
    {
        parent::__construct("post", Post::class);
        $this->controller = $controller;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        try {
            $attrs = json_decode($this->controller->handle(RequestForSerializer::createWithId($user_id, [
                "id" => $model
            ]))->getBody()->getContents());
            $sync($attrs);
        } catch (\Exception $e) {
            return;
        }
    }
    public function getModel(ModelPath $id)
    {
        return $id->getId("post");
    }
}