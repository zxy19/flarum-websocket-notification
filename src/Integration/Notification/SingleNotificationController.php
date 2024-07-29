<?php
namespace Xypp\WsNotification\Integration\Notification;

use Flarum\Api\Controller\AbstractShowController;
use Flarum\Api\Serializer\NotificationSerializer;
use Flarum\Database\Eloquent\Collection;
use Flarum\Discussion\Discussion;
use Flarum\Notification\Notification;
use Illuminate\Support\Arr;
class SingleNotificationController extends AbstractShowController
{
    public $serializer = NotificationSerializer::class;
    public $include = [
        'fromUser',
        'subject',
        'subject.discussion'
    ];
    protected function data(\Psr\Http\Message\ServerRequestInterface $request, \Tobscure\JsonApi\Document $document)
    {
        /**
         * @var Notification
         */
        $model = Arr::get($request->getQueryParams(), 'model');
        $id = $model->id;

        $include = $this->extractInclude($request);
        if (!in_array('subject', $include)) {
            $include[] = 'subject';
        }
        $notifications = Collection::make([$model]);

        $this->loadRelations($notifications, array_diff($include, ['subject.discussion']), $request);
        $notifications = $notifications->all();
        if (in_array('subject.discussion', $include)) {
            $this->loadSubjectDiscussions($notifications);
        }
        return $notifications[0];
    }
    private function loadSubjectDiscussions(array $notifications)
    {
        $ids = [];

        foreach ($notifications as $notification) {
            if ($notification->subject && ($discussionId = $notification->subject->getAttribute('discussion_id'))) {
                $ids[] = $discussionId;
            }
        }

        $discussions = Discussion::query()->find(array_unique($ids));

        foreach ($notifications as $notification) {
            if ($notification->subject && ($discussionId = $notification->subject->getAttribute('discussion_id'))) {
                $notification->subject->setRelation('discussion', $discussions->find($discussionId));
            }
        }
    }
}