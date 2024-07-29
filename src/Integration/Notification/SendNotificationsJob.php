<?php

namespace Xypp\WsNotification\Integration\Notification;

use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Queue\AbstractJob;
use Flarum\User\User;
use Xypp\WsNotification\Data\ModelPath;
use Xypp\WsNotification\Helper\DataDispatchHelper;

class SendNotificationsJob extends AbstractJob
{
    /**
     * @var BlueprintInterface
     */
    private $blueprint;

    /**
     * @var User[]
     */
    private $recipients;

    public function __construct(BlueprintInterface $blueprint, array $recipients)
    {
        $this->blueprint = $blueprint;
        $this->recipients = $recipients;
    }

    public function handle(DataDispatchHelper $helper)
    {
        foreach ($this->recipients as $user) {
            if ($user->shouldAlert($this->blueprint::getType())) {
                $helper->dispatch(
                    (new ModelPath())->addWithId("notification", $user->id)->setData([
                        'type' => $this->blueprint::getType(),
                        'from_user_id' => ($fromUser = $this->blueprint->getFromUser()) ? $fromUser->id : null,
                        'subject_id' => ($subject = $this->blueprint->getSubject()) ? $subject->id : null,
                        'data' => ($data = $this->blueprint->getData()) ? json_encode($data) : null
                    ])
                );
            }
        }
    }
}