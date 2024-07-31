import app from "../../../../vendor/flarum/core/js/dist-typings/forum/app";
import { ModelPath } from "../../common/Data/ModelPath";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";

export function initLike() {
    addSubscribeCb("like", (items, context) => {
        if (context.discussion) {
            items.add("like", new ModelPath().add("discussion", context.discussion.id()).add("post").add("like"));
        }
    });
    addMessageCb("like", (path, data) => {
        const post = app.store.getById("posts", data.post);
        if (post) {
            const like: { data: { type: string, id: string }[] } = (post.data.relationships as any).likes;
            for (let i = 0; i < like.data.length; i++) {
                if (like.data[i].id == data.user.id) {
                    if (!data.like) {
                        like.data.splice(i, 1);
                    }
                    return;
                }
            }
            if (data.like)
                like.data.push(data.user);
        }
    })
}