<?php

namespace Xypp\WsNotification\Util;

use Flarum\Http\ActorReference;
use Flarum\User\Guest;
use Flarum\User\User;
use Psr\Http\Message\ServerRequestInterface;

class RequestForSerializer implements ServerRequestInterface
{
    public static function createWithId(?int $user_id, ?array $parameters)
    {
        $user = null;
        if ($user_id) {
            $user = User::find($user_id);
        }
        if (!$user) {
            $user = new Guest();
        }
        return new RequestForSerializer($user, $parameters);
    }
    public array $parameters;
    public ActorReference $actorRef;
    public function __construct(?User $actor, ?array $parameters = null)
    {
        $this->actorRef = new ActorReference;
        if ($actor)
            $this->actorRef->setActor($actor);
        $this->parameters = $parameters ?? [];
    }
    public function getAttribute(string $name, $default = null)
    {
        if ($name == "actorReference") {
            return $this->actorRef;
        } else if ($name == "actor") {
            return $this->actorRef->getActor();
        } else {
            return $default;
        }
    }
    public function getAttributes()
    {
        return [
            "actorReference" => $this->actorRef,
            "actor" => $this->actorRef->getActor()
        ];
    }
    public function getCookieParams()
    {
        return [];
    }
    public function getParsedBody()
    {
        return "";
    }
    public function getQueryParams()
    {
        return $this->parameters;
    }
    public function getServerParams()
    {
        return [];
    }
    public function getUploadedFiles()
    {
        return [];
    }
    public function withAttribute(string $name, $value)
    {
        if ($name == "actorReference") {
            $this->actorRef = $value;
        }
        return $this;
    }
    public function withCookieParams(array $cookies)
    {
    }
    public function withoutAttribute(string $name)
    {
        if ($name == "actor") {
            $this->actor = null;
        }
        return $this;
    }
    public function withParsedBody($data)
    {
    }
    public function withQueryParams(array $query)
    {
        $this->parameters = $query;
        return $this;
    }
    public function withUploadedFiles(array $uploadedFiles)
    {
    }
    public function getMethod()
    {
    }
    public function getRequestTarget()
    {
    }
    public function getUri()
    {
    }
    public function withMethod(string $method)
    {
    }
    public function withRequestTarget(string $requestTarget)
    {
    }
    public function withUri(\Psr\Http\Message\UriInterface $uri, bool $preserveHost = false)
    {
    }
    public function getBody()
    {
    }
    public function getHeader(string $name)
    {
    }
    public function getHeaderLine(string $name)
    {
    }
    public function getHeaders()
    {
    }
    public function getProtocolVersion()
    {
    }
    public function hasHeader(string $name)
    {
    }
    public function withAddedHeader(string $name, $value)
    {
    }
    public function withBody(\Psr\Http\Message\StreamInterface $body)
    {
    }
    public function withHeader(string $name, $value)
    {
    }
    public function withoutHeader(string $name)
    {
    }
    public function withProtocolVersion(string $version)
    {
    }


}