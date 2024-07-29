import ItemList from "flarum/common/utils/ItemList";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import { ModelPath } from "../../common/Data/ModelPath";
import app from "flarum/forum/app";
import Post from "flarum/common/models/Post";
import Discussion from "flarum/common/models/Discussion";
import PostStreamState from "flarum/forum/states/PostStreamState"
export function initPost() {
    addSubscribeCb("post", (items: ItemList<ModelPath>) => {
        if (((app.current.data as any) ?? {}).routeName === "discussion") {
            items.add("discussion", new ModelPath().add("discussion", (app.current.data as any).discussion.id()).add("post"));
        }
    })
    addMessageCb("post", (path: ModelPath, data: any) => {
        if (((app.current.data as any) ?? {}).routeName !== "discussion") return;
        const discussion: Discussion = (app.current.data as any).discussion;
        const stream:PostStreamState = app.current.get("stream");
        if (discussion.id() == path.getId("discussion") && stream.viewingEnd()) {
            const model = app.store.pushPayload<Post>(data);
            (discussion.data as any).relationships.posts.data.push({ type: 'posts', id: '71' });
            stream.loadNext();
        }
    })
}