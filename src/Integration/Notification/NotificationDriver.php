<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace Xypp\WsNotification\Integration\Notification;

use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Notification\Driver\NotificationDriverInterface;
use Flarum\Settings\SettingsRepositoryInterface;
use Illuminate\Contracts\Queue\Queue;

class NotificationDriver implements NotificationDriverInterface
{
    /**
     * @var Queue
     */
    protected $queue;
    protected $settings;

    public function __construct(Queue $queue, SettingsRepositoryInterface $settings)
    {
        $this->queue = $queue;
        $this->settings = $settings;
    }

    /**
     * {@inheritDoc}
     */
    public function send(BlueprintInterface $blueprint, array $users): void
    {
        if (!$this->settings->get("xypp.ws_notification.function.notification")) {
            return;
        }
        if (count($users)) {
            $this->queue->push(new SendNotificationsJob($blueprint, $users));
        }
    }

    /**
     * {@inheritDoc}
     */
    public function registerType(string $blueprintClass, array $driversEnabledByDefault): void
    {
        // ...
    }
}