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
    private DiscussionController $controller;
    public function __construct(DiscussionController $controller)
    {
        parent::__construct("discussion", Discussion::class);
        $this->controller = $controller;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        try {
            $attrs = json_decode($this->controller->handle(RequestForSerializer::createWithId($user_id, [
                "id" => $path->getId()
            ]))->getBody()->getContents());
            $sync([
                "discussion" => $attrs,
                "post" => $path->getData()['post']
            ]);
        } catch (\Exception $e) {
            print ($e->getTraceAsString());
        }
    }
    public function getModel(ModelPath $id)
    {
        return null;
    }
}