import Component from "flarum/common/Component";
import app from "flarum/forum/app";
import { showIf } from "../../../common/util/NodeUtil";
import Button from "flarum/common/components/Button"

export default class NotificationFloater extends Component<{
    notifications: { time: number, first: boolean, notification: any }[],
    dismiss: () => void
}> {
    view(vnode: any) {
        const position = (app.session?.user?.preferences() || {})["xyppWsnFloaterPosition"] || "center";
        return <div className={showIf(this.attrs.notifications.length > 0, "notification-floater", "notification-floater hidden") + " " + position}>
            {this.attrs.notifications.map(n => {
                const type = n.notification.data.attributes.contentType;
                const cls = app.notificationComponents[type];
                return <div className={showIf(n.first, "notification-floater-item in", "notification-floater-item")}>
                    {showIf(!!cls, m(cls, { notification: n.notification }), <div>{type}</div>)}
                </div>
            })}
            <div className="notification-floater-close-container">
                <Button className="Button Button-primary" onclick={this.attrs.dismiss}>
                    <i className="fas fa-times"></i>
                    {app.translator.trans("xypp-websocket-notification.forum.close_notification_floater")}
                </Button>
            </div>
        </div>
    }
}