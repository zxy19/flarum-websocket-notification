import app from "flarum/forum/app";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import { ModelPath } from "../../common/Data/ModelPath";
import NotificationFloater from "./components/NotificationFloater";

export function initNotification() {
    let notifications: { time: number, first: boolean, notification: any }[] = [];
    addSubscribeCb('websocket', (items) => {
        if (app.session.user)
            items.add("notification", new ModelPath().add("notification", app.session.user.id()));
    });
    addMessageCb('notification', (path, data) => {
        console.log(data);
        const model = app.store.pushPayload(data);
        const obj = { time: 8, first: false, notification: model };
        notifications.push(obj);
        if (app.session.user)
            app.session.user.pushAttributes({
                unreadNotificationCount: app.session.user.unreadNotificationCount() ?? 0 + 1,
                newNotificationCount: app.session.user.newNotificationCount() ?? 0 + 1,
            });
        m.redraw();
        setTimeout(() => {
            obj.first = true;
            m.redraw();
        }, 200);
    });


    const ctr = $("<div></div>").addClass("notification-floater-container")
    ctr.appendTo(document.body);
    m.mount(ctr[0], { view: function () { return NotificationFloater.component({ notifications }) } });

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
}