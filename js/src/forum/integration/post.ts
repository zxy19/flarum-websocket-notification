import ItemList from "flarum/common/utils/ItemList";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import { ModelPath } from "../../common/Data/ModelPath";
import app from "flarum/forum/app";
import Post from "flarum/common/models/Post";
import Discussion from "flarum/common/models/Discussion";
import PostStreamState from "flarum/forum/states/PostStreamState"
import DiscussionPage from "flarum/forum/components/DiscussionPage"
import { extend } from "flarum/common/extend";
import { WebsocketHelper } from "../../common/helper/WebsocketHelper";
import PageState from "flarum/common/states/PageState";
export function initPost() {
    addSubscribeCb("post", (items: ItemList<ModelPath>, context: Record<string, any>) => {
        if (context.discussion) {
            items.add("discussion", new ModelPath().add("discussion", context.discussion).add("post"));
        }
    })
    addMessageCb("post", (path: ModelPath, data: any) => {
        const route = ((app.current.data as any) ?? {}).routeName;
        if (route !== "discussion" && route !== "discussion.near") return;
        const discussion: Discussion = (app.current.data as any).discussion;
        const stream: PostStreamState = app.current.get("stream");
        if (discussion.id() == path.getId("discussion") && stream.viewingEnd()) {
            const model = app.store.pushPayload<Post>(data);
            if (!((discussion.data as any).relationships.posts.data.find((v: any) => v.id == model.id()))) {
                (discussion.data as any).relationships.posts.data.push({ type: 'posts', id: model.id() });
                stream.loadNext();
            } else {
                m.redraw();
            }
        }
    });
    let removeStack = 0;
    extend(DiscussionPage.prototype, "show", function (this: DiscussionPage, r: any, discussion: Discussion) {
        if (discussion) {
            removeStack++;
            WebsocketHelper.getInstance().setContext({
                discussion: discussion!.id()
            }).reSubscribe();
        }
    })
    extend(DiscussionPage.prototype, "onbeforeremove", function (this: DiscussionPage) {
        if (this.discussion) {
            removeStack--;
            if (removeStack < 0) removeStack = 0;
            if (removeStack == 0)
                WebsocketHelper.getInstance().setContext({
                    discussion: null
                }).reSubscribe();
        }
    })
}
