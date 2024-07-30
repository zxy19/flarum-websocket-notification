<?php

namespace Xypp\WsNotification\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Http\RequestUtil;
use Xypp\WsNotification\Api\Serializer\WebsocketAccessTokenSerializer;
use Xypp\WsNotification\WebsocketAccessToken;
use Xypp\WsNotification\Helper\Bridge;

class CreateWebsocketAccessTokenController extends AbstractCreateController
{
    public $serializer = WebsocketAccessTokenSerializer::class;
    protected $bridge;
    public function __construct(Bridge $bridge)
    {
        $this->bridge = $bridge;
    }
    public function data(\Psr\Http\Message\ServerRequestInterface $request, \Tobscure\JsonApi\Document $document)
    {
        if (!$this->bridge->check()) {
            return null;
        }
        $actor = RequestUtil::getActor($request);
        return WebsocketAccessToken::generate($actor);
    }
}