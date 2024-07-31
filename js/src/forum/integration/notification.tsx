import app from "flarum/forum/app";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import { ModelPath } from "../../common/Data/ModelPath";
import NotificationFloater from "./components/NotificationFloater";
import { extend } from "flarum/common/extend";
import SettingsPage from "flarum/forum/components/SettingsPage";
import FieldSet from "flarum/common/components/FieldSet"
import Select from "flarum/common/components/Select";
export function initNotification() {
  let notifications: { time: number, first: boolean, notification: any }[] = [];
  addSubscribeCb('websocket', (items) => {
    if (app.session.user)
      items.add("notification", new ModelPath().add("notification", app.session.user.id()));
  });
  addMessageCb('notification', (path, data) => {
    const model = app.store.pushPayload(data);
    const obj = { time: 8, first: false, notification: model };
    notifications.unshift(obj);
    if (app.session.user)
      app.session.user.pushAttributes({
        unreadNotificationCount: app.session.user.unreadNotificationCount() ?? 0 + 1,
        newNotificationCount: app.session.user.newNotificationCount() ?? 0 + 1,
      });
    m.redraw();
    setTimeout(() => {
      obj.first = true;
      m.redraw();
    }, 100);
  });
  function dismiss() {
    while (notifications.length) {
      notifications.pop();
    }
  }

  const ctr = $("<div></div>").addClass("notification-floater-container")
  ctr.appendTo(document.body);
  m.mount(ctr[0], { view: function () { return NotificationFloater.component({ notifications, dismiss }) } });

  setInterval(() => {
    notifications.forEach(element => {
      element.time--;
    });
    let changed = false;
    for (let i = notifications.length - 1; i >= 0; i--) {
      if (notifications[i].time <= 0) {
        notifications.splice(i, 1);
        changed = true;
      }
    }
    if (changed)
      m.redraw();
  }, 1000);

  const SELECT_FLOATER = {
    "left": app.translator.trans("xypp-websocket-notification.forum.notification_floater.left"),
    "right": app.translator.trans("xypp-websocket-notification.forum.notification_floater.right"),
    "center": app.translator.trans("xypp-websocket-notification.forum.notification_floater.center")
  }
  extend(SettingsPage.prototype, 'settingsItems', function (items) {
    const position = (app.session?.user?.preferences() || {})["xyppWsn-floater-position"] || "center";
    items.add(
      'xypp-wsn-floater-position',
      <FieldSet label={app.translator.trans("xypp-websocket-notification.forum.notification_floater.title")} className="Settings-floater">
        <p>{app.translator.trans("xypp-websocket-notification.forum.notification_floater.desc")}</p>
        <Select
          options={SELECT_FLOATER}
          value={position}
          onchange={(value: string) => {
            app.session.user!
              .savePreferences({
                "xyppWsn-floater-position": value
              });
          }}
        />
      </FieldSet>
    );
  })
}