<?php

namespace Xypp\WsNotification\Api\Controller;

use Flarum\Api\Controller\AbstractCreateController;
use Flarum\Foundation\ValidationException;
use Flarum\Http\RequestUtil;
use Flarum\Locale\Translator;
use Flarum\Settings\SettingsRepositoryInterface;
use Xypp\WsNotification\Api\Serializer\WebsocketAccessTokenSerializer;
use Xypp\WsNotification\WebsocketAccessToken;
use Xypp\WsNotification\Helper\Bridge;

class CreateWebsocketAccessTokenController extends AbstractCreateController
{
    public $serializer = WebsocketAccessTokenSerializer::class;
    protected $bridge;
    protected $translator;
    protected $settings;
    public function __construct(Bridge $bridge, Translator $translator, SettingsRepositoryInterface $settings)
    {
        $this->bridge = $bridge;
        $this->translator = $translator;
        $this->settings = $settings;
    }
    public function data(\Psr\Http\Message\ServerRequestInterface $request, \Tobscure\JsonApi\Document $document)
    {
        if (!$this->settings->get("xypp.ws_notification.options.no_state_check"))
            if (!$this->bridge->check()) {
                throw new ValidationException([
                    "msg" => $this->translator->trans("xypp-websocket-notification.api.not-running")
                ]);
            }
        $actor = RequestUtil::getActor($request);
        return WebsocketAccessToken::generate($actor);
    }
}