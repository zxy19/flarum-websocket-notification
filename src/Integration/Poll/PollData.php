<?php

namespace Xypp\WsNotification\Integration\Poll;

use Flarum\Api\Serializer\BasicUserSerializer;
use Flarum\User\Guest;
use Flarum\User\User;
use FoF\Polls\Poll;
use FoF\Polls\PollOption;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;


class PollData extends AbstractDataDispatchType
{
    public function __construct()
    {
        parent::__construct("poll", "");
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        if (!$model)
            return;
        [$poll, $counts] = $model;
        $user = null;
        if ($user_id) {
            $user = User::find($user_id);
        } else {
            $user = new Guest();
        }

        if ($user->can('seeVoteCount', $poll)) {
            $sync($counts);
        }
    }
    public function getModel(ModelPath $id)
    {
        $poll = Poll::find($id->getId());
        if ($poll) {
            $counts = [];
            $poll->options()->get()->each(function (PollOption $option) use (&$counts) {
                $counts[$option->id] = $option->vote_count;
            });
            return [$poll, $counts];
        }
        return null;
    }
}