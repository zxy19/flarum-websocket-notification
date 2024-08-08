import ItemList from "flarum/common/utils/ItemList";
import { ModelPath } from "../../common/Data/ModelPath";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import app from "flarum/forum/app";
import Post from "flarum/common/models/Post";

export function initPoll() {
    addSubscribeCb("poll", (items: ItemList<ModelPath>, context: Record<string, any>) => {
        if (context.discussion && flarum.extensions['fof-polls']) {
            const discussion = app.store.getById<any>("discussions", context.discussion);
            if (discussion.hasPoll()) {
                discussion.posts().forEach((post: any) => {
                    const poll = post.polls();
                    if (poll && poll.length) {
                        poll.forEach((p: any) => {
                            items.add("poll-" + p.id(), new ModelPath().add("poll", p.id()));
                        });
                    }
                });
            }
        }
    });

    addMessageCb("poll", (path: ModelPath, data: any) => {
        let count = 0;
        Object.keys(data).forEach(key => {
            const pollOption = app.store.getById<any>("poll_options", key);
            if (pollOption) {
                pollOption.pushAttributes({
                    voteCount: data[key]
                });
                count += data[key];
            }
        });
        const poll = app.store.getById("polls", path.getId() as string);
        poll?.pushAttributes({ "voteCount": count });
        m.redraw();
    })
}