<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace Xypp\WsNotification\Integration\Flag;

use Carbon\Carbon;
use Flarum\Api\Controller\AbstractShowController;
use Flarum\Flags\Api\Serializer\FlagSerializer;
use Flarum\Flags\Flag;
use Flarum\Http\RequestUtil;
use Illuminate\Support\Arr;
use Flarum\Database\Eloquent\Collection;
use Psr\Http\Message\ServerRequestInterface;
use Tobscure\JsonApi\Document;

class SingleFlagController extends AbstractShowController
{
    /**
     * {@inheritdoc}
     */
    public $serializer = FlagSerializer::class;

    /**
     * {@inheritdoc}
     */
    public $include = [
        'user',
        'post',
        'post.user',
        'post.discussion'
    ];

    /**
     * {@inheritdoc}
     */
    protected function data(ServerRequestInterface $request, Document $document)
    {
        $include = $this->extractInclude($request);

        $flag = Arr::get($request->getQueryParams(), 'model');
        $flags = Collection::make([$flag]);

        if (in_array('post.user', $include)) {
            $include[] = 'post.user.groups';
        }

        $this->loadRelations($flags, $include);

        return $flags[0];
    }
}
