import Component from "flarum/common/Component";
import app from "flarum/forum/app";
import { showIf } from "../../../common/util/NodeUtil";
import Button from "flarum/common/components/Button"
import User from "flarum/common/models/User";
import avatar from "flarum/common/helpers/avatar"
import username from "flarum/common/helpers/username"
import Link from "flarum/common/components/Link";
export default class TypingTip extends Component<{
    typingUsers: User[]
}> {
    view(vnode: any) {
        let MAX_LIST_LEN = parseInt(app.forum.attribute("xyppWsnTypeTipCountLimit") || "4");
        if (!this.attrs.typingUsers.length) {
            return <div>{app.translator.trans("xypp-websocket-notification.forum.typing.no_one")}</div>
        }
        return <div className="PostStream-item">
            <div className="LineContainer">
                <div className="users">
                    {this.attrs.typingUsers.slice(0, MAX_LIST_LEN).map(u => <Link className="typingUser" href={app.route.user(u)}>
                        {avatar(u)}
                        <span className="username">{username(u)}</span>
                    </Link>)}
                </div>
                {showIf(this.attrs.typingUsers.length > MAX_LIST_LEN, <div>
                    {app.translator.trans("xypp-websocket-notification.forum.typing.and_more", { rest: this.attrs.typingUsers.length - MAX_LIST_LEN })}
                </div>)}
                <div>{app.translator.trans("xypp-websocket-notification.forum.typing.is_typing")}</div>
            </div>
        </div>
    }
}