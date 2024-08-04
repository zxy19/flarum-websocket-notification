<?php

namespace Xypp\WsNotification\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Xypp\WsNotification\Api\Serializer\WebsocketAccessTokenSerializer;
use Xypp\WsNotification\WebsocketAccessToken;
use Xypp\WsNotification\Helper\Bridge;

class CreateWebsocketAccessTokenController extends AbstractCreateController
{
    public $serializer = WebsocketAccessTokenSerializer::class;
    protected $bridge;
    protected $translator;
    public function __construct(Bridge $bridge, Translator $translator)
    {
        $this->bridge = $bridge;
        $this->translator = $translator;
    }
    public function data(\Psr\Http\Message\ServerRequestInterface $request, \Tobscure\JsonApi\Document $document)
    {
        if (!$this->bridge->check()) {
            throw new ValidationException([
                "msg" => $this->translator->trans("xypp-websocket-notification.api.not-running")
            ]);
        }
        $actor = RequestUtil::getActor($request);
        return WebsocketAccessToken::generate($actor);
    }
}