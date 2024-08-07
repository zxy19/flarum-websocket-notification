<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace Xypp\WsNotification\Integration\Post;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Discussion\Discussion;
use Flarum\Discussion\DiscussionRepository;
use Flarum\Http\RequestUtil;
use Flarum\Http\SlugManager;
use Flarum\Post\PostRepository;
use Flarum\User\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class DiscussionController extends AbstractShowController
{
    /**
     * @var \Flarum\Discussion\DiscussionRepository
     */
    protected $discussions;

    /**
     * @var PostRepository
     */
    protected $posts;

    /**
     * @var SlugManager
     */
    protected $slugManager;

    /**
     * {@inheritdoc}
     */
    public $serializer = DiscussionSerializer::class;

    /**
     * {@inheritdoc}
     */
    public $include = [
        'lastPostedUser',
        'lastPost'
    ];

    /**
     * {@inheritdoc}
     */
    public $optionalInclude = [
    ];

    /**
     * @param \Flarum\Discussion\DiscussionRepository $discussions
     * @param \Flarum\Post\PostRepository $posts
     * @param \Flarum\Http\SlugManager $slugManager
     */
    public function __construct(DiscussionRepository $discussions, PostRepository $posts, SlugManager $slugManager)
    {
        $this->discussions = $discussions;
        $this->posts = $posts;
        $this->slugManager = $slugManager;
    }

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $discussionId = Arr::get($request->getQueryParams(), 'id');
        $actor = RequestUtil::getActor($request);
        /**
         * @var Discussion
         */
        $discussion = $this->discussions->findOrFail($discussionId, $actor);
        $this->loadRelations(new Collection([$discussion]), $this->include, $request);
        return $discussion;
    }
}
