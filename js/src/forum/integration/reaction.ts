import ItemList from "flarum/common/utils/ItemList";
import { ModelPath } from "../../common/Data/ModelPath";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import app from "flarum/forum/app";
import Post from "flarum/common/models/Post";

export function initReaction() {

    addSubscribeCb("reaction", (items: ItemList<ModelPath>, context: Record<string, any>) => {
        if (context.discussion) {
            items.add("reaction", new ModelPath().add("discussion", context.discussion).add("post").add("reaction"));
        }
    });

    addMessageCb("reaction", (path: ModelPath, data: any) => {
        if (path.getId("post")) {
            const post = app.store.getById<Post>("posts", path.getId("post") as string);
            if (post) {
                post.pushAttributes({ reactionCounts: data.counts });
                post.freshness = new Date();
                m.redraw();
            }
        }
    })
}