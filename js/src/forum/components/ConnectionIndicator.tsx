import Component from "flarum/common/Component";
import app from "flarum/forum/app";
import Button from "flarum/common/components/Button"
import { WebsocketHelper } from "../../common";
import { STATUS } from "../../common/helper/WebsocketHelper";

export default class ConnectionIndicator extends Component {
    currentStatus: STATUS = "offline";
    oninit(vnode: any): void {
        super.oninit(vnode);
        WebsocketHelper.getInstance().onStatusChange(this.status.bind(this))
    }
    view(vnode: any) {
        return this.getContent();
    }
    getContent() {
        switch (this.currentStatus) {
            case "online":
                return <span className="connectionIndicator-icon online"><i className="far fa-circle"></i></span>;
            case "offline":
                return <span className="connectionIndicator-icon offline"><i className="fas fa-times"></i></span>;
            case "connecting":
                return <span className="connectionIndicator-icon connecting"><i className="fas fa-wifi"></i></span>;
        }
    }
    status(status: STATUS) {
        this.currentStatus = status;
        m.redraw();
    }
}