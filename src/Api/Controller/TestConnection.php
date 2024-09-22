<?php

namespace Xypp\WsNotification\Api\Controller;
use Flarum\Http\RequestUtil;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Xypp\WsNotification\Helper\Bridge;
class TestConnection implements RequestHandlerInterface
{
    protected $bridge;
    public function __construct(Bridge $bridge)
    {
        $this->bridge = $bridge;
    }
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        RequestUtil::getActor($request)->assertAdmin();

        if($this->bridge->check()){
            return new JsonResponse([
                "result" => true
            ]);
        }
        return new JsonResponse([
            "result" => false
        ]);
    }
}