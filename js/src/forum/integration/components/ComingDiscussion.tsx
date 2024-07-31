import Component from "flarum/common/Component";
import Discussion from "flarum/common/models/Discussion";
import app from "flarum/forum/app";
import Button from "flarum/common/components/Button";
import Link from "flarum/common/components/Link"
import { showIf } from "../../../common/util/NodeUtil";
export default class ComingDiscussion extends Component<{
    list: {
        title: string,
        id: string,
        count: number,
        post: number
    }[],
    cb: () => void
}> {
    autoRefreshTimeout: any = null;
    autoRefresh: boolean = false;
    countdown: number = 30;
    oncreate(vnode: any): void {
        super.oncreate(vnode);
        this.autoRefresh = app.session?.user?.preferences()?.xyppWsnNewDiscussionAutoRefresh || false;
        if (this.autoRefresh) {
            this.autoRefreshTimeout = setInterval(() => {
                this.updateCtd();
            }, 1000);
        }
    }
    onbeforeremove(vnode: any): void {
        super.onbeforeremove(vnode);
        if (this.autoRefreshTimeout) {
            clearInterval(this.autoRefreshTimeout);
        }
    }
    view(vnode: any) {
        return <div className="ComingDiscussion">
            <div className="ComingDiscussion-icon">
                <i className="fas fa-star-of-life"></i>
                <div className="ComingDiscussion-icon-text">
                    {app.translator.trans('xypp-websocket-notification.forum.new_discussion.tip')}
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
                <Button class="Button" onclick={this.callback.bind(this)}><i className="fas fa-sync"></i></Button>
                {showIf(this.autoRefresh, <div className="autoReloadIndicator">{this.countdown}</div>)}
            </div>
        </div>
    }
    callback() {
        if (this.autoRefreshTimeout) {
            clearInterval(this.autoRefreshTimeout);
            this.autoRefreshTimeout = null;
            this.autoRefresh = false;
        }
        this.attrs.cb();
    }
    updateCtd() {
        if (this.countdown > 0) {
            this.countdown--;
            if (this.countdown == 0) {
                this.callback();
            }
            m.redraw();
        }
    }
}