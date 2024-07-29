import Component from "flarum/common/Component";
import app from "flarum/forum/app";
import { showIf } from "../../../common/util/NodeUtil";

export default class NotificationFloater extends Component<{
    notifications: { time: number, first: boolean, notification: any }[]
}> {
    view(vnode: any) {
        return <div className={showIf(this.attrs.notifications.length > 0, "notification-floater","notification-floater hidden")}>
            {this.attrs.notifications.map(n => {
                const type = n.notification.data.attributes.contentType;
                const cls = app.notificationComponents[type];
                return <div className={showIf(n.first, "notification-floater-item in", "notification-floater-item")}>
                    {showIf(!!cls, m(cls, { notification: n.notification }), <div>{type}</div>)}
                </div>
            })}
        </div>
    }
}