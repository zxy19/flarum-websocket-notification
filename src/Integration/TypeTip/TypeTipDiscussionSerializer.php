<?php

namespace Xypp\WsNotification\Integration\TypeTip;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\User\User;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\WebsocketUserState;

class TypeTipDiscussionSerializer
{
    protected $userSerializer;
    public function __construct(BasicUserSerializer $userSerializer)
    {
        $this->userSerializer = $userSerializer;
    }
    public function __invoke(DiscussionSerializer $serializer, Discussion $model, $attributes)
    {
        $typing = [];
        $typings = WebsocketUserState::with("user")->where(
            "path",
            strval(
                (new ModelPath())
                    ->addWithId("discussion", $model->id)
                    ->add("typing")
            )
        )->get();
        $this->userSerializer->setRequest($serializer->getRequest());
        $typings->each(function (WebsocketUserState $state) use (&$typing) {
            $typing[] = [
                "data" => [
                    "id" => $state->user->id,
                    "type" => "users",
                    "attributes" => $this->userSerializer->getAttributes($state->user)
                ],
            ];
        });
        $attributes["typeTip"] = [
            "user" => $typing
        ];
        return $attributes;
    }
}