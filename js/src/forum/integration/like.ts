import app from "flarum/forum/app";
import { ModelPath } from "../../common/Data/ModelPath";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";

export function initLike() {
    addSubscribeCb("like", (items, context) => {
        if (context.discussion) {
            items.add("like", new ModelPath().add("discussion", context.discussion).add("post").add("like"));
        }
    });
    addMessageCb("like", (path, data) => {
        const post = app.store.getById("posts", data.post);
        if (!app.store.getById("users", data.user.data.id)) {
            app.store.pushPayload(data.user);
        }
        if (post) {
            const like: { data: { type: string, id: string }[] } = (post.data.relationships as any).likes;
            for (let i = 0; i < like.data.length; i++) {
                if (like.data[i].id == data.user.data.id) {
                    if (!data.like) {
                        like.data.splice(i, 1);
                        post.freshness=new Date();
                        m.redraw();
                    }
                    return;
                }
            }
            if (data.like) {
                like.data.push({
                    type: "users",
                    id: data.user.data.id
                });
                post.freshness=new Date();
                m.redraw();
            }
        }
    })
}