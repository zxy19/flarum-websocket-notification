import Component from "flarum/common/Component";
import Discussion from "flarum/common/models/Discussion";
import app from "flarum/forum/app";
import Button from "flarum/common/components/Button";
import Link from "flarum/common/components/Link"
export default class ComingDiscussion extends Component<{
    list: {
        title: string,
        id: string,
        count: number,
        post: number
    }[],
    cb: () => void
}> {
    view(vnode: any) {
        return <div className="ComingDiscussion">
            <div className="ComingDiscussion-icon">
                <i className="fas fa-star-of-life"></i>
                <div className="ComingDiscussion-icon-text">
                    {app.translator.trans('xypp-websocket-notification.forum.new_discussion')}
                </div>
            </div>
            <div className="ComingDiscussion-item-container">
                {
                    this.attrs.list.map(item => {
                        return <div class="ComingDiscussion-item">
                            <span className="ComingDiscussion-count">{item.count}</span>
                            <Link className="ComingDiscussion-link" href={app.route("discussion.near", {
                                id: item.id,
                                near: item.post
                            })}>{item.title}</Link>
                        </div>
                    })
                }
            </div>
            <div className="ComingDiscussion-Reload">
                <Button class="Button" onclick={this.attrs.cb}><i className="fas fa-sync"></i></Button>
            </div>
        </div>
    }
}