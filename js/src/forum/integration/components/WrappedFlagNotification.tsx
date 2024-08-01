import Component from "flarum/common/Component";
import Link from "flarum/common/components/Link";
import app from "flarum/forum/app";
import avatar from "flarum/common/helpers/avatar";
import icon from 'flarum/common/helpers/icon';
import username from "flarum/common/helpers/username";
import humanTime from "flarum/common/helpers/humanTime";
export default class WrappedFlagNotification extends Component<{
    notification: any
}> {
    view() {
        const flag = this.attrs.notification.data.attributes.flag;
        const post = flag.post();
        return <Link
            href={app.route.post(post)}
            className="Notification Flag"
            onclick={(e: any) => {
                (app.flags as any).index = post;
                e.redraw = false;
            }}
        >
            {avatar(post.user())}
            {icon('fas fa-flag', { className: 'Notification-icon' })}
            <span className="Notification-content">
                {app.translator.trans('flarum-flags.forum.flagged_posts.item_text', {
                    username: username(post.user()),
                    em: <em />,
                    discussion: post.discussion().title(),
                })}
            </span>
            {humanTime(flag.createdAt())}
            <div className="Notification-excerpt">{post.contentPlain()}</div>
        </Link>
    }
}