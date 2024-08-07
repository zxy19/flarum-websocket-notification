<?php

namespace Xypp\WsNotification\Integration\Reaction;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Guest;
use Flarum\User\User;
use FoF\Reactions\PostAnonymousReaction;
use FoF\Reactions\PostReaction;
use FoF\Reactions\Reaction;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Util\RequestForSerializer;

class ReactionData extends AbstractDataDispatchType
{
    protected $settings;
    public function __construct(SettingsRepositoryInterface $settings)
    {
        parent::__construct("reaction", Discussion::class);
        $this->settings = $settings;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {
        $sync([
            "counts" => $model
        ]);
    }
    public function getModel(ModelPath $id)
    {
        // Initialize counts array
        $counts = [];

        // Query for reactions from registered users
        $registeredReactions = PostReaction::where('post_id', $id->getId("post"))
            ->groupBy('reaction_id')
            ->selectRaw('reaction_id, COUNT(*) as count')
            ->pluck('count', 'reaction_id');

        // Query for anonymous reactions if allowed
        $anonymousReactions = collect([]);
        if ($this->settings->get('fof-reactions.anonymousReactions')) {
            $anonymousReactions = PostAnonymousReaction::where('post_id', $id->getId("post"))
                ->groupBy('reaction_id')
                ->selectRaw('reaction_id, COUNT(*) as count')
                ->pluck('count', 'reaction_id');
        }

        // Merge the registered and anonymous reactions
        $reactions = Reaction::all();
        foreach ($reactions as $reaction) {
            $counts[$reaction->id] = $registeredReactions->get($reaction->id, 0) + $anonymousReactions->get($reaction->id, 0);
        }
        return $counts;
    }
}