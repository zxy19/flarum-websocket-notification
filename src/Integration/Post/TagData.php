<?php

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Extension\ExtensionManager;
use Flarum\Tags\Tag;
use Xypp\WsNotification\AbstractDataDispatchType;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Websockets\Helper\ConnectionManager;

class TagData extends AbstractDataDispatchType
{
    private ExtensionManager $extensionManager;
    private ConnectionManager $connectionManager;
    public function __construct(ExtensionManager $extensionManager, ConnectionManager $connectionManager)
    {
        parent::__construct("tag", "");
        $this->extensionManager = $extensionManager;
        $this->connectionManager = $connectionManager;
    }

    public function deliver(?int $user_id, ModelPath $path, $model, callable $sync): void
    {

    }
    public function getModel(ModelPath $id)
    {
        return null;
    }
    public function canSubscribe(int|null $user_id, ModelPath $path): bool
    {
        if (!$this->extensionManager->isEnabled("flarum-tags"))
            return false;
        $user = $this->connectionManager->userObj($user_id);
        $tag = Tag::find($path->getId("tag"));
        if (!$tag)
            return false;
        if (!$tag->is_restricted || $user->can("tag" . $path->getId("tag") . ".discussion.view"))
            return true;
        return false;
    }
}