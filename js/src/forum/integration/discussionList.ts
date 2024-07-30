import ItemList from "flarum/common/utils/ItemList";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import { ModelPath } from "../../common/Data/ModelPath";
import app from "flarum/forum/app";
import DiscussionPage from "flarum/forum/components/DiscussionPage"
import { extend } from "flarum/common/extend";
import { WebsocketHelper } from "../../common/helper/WebsocketHelper";
import DiscussionList from "flarum/forum/components/DiscussionList"
import ComingDiscussion from "./components/ComingDiscussion";
export function initDiscussionList() {
    addSubscribeCb("discussion", (items: ItemList<ModelPath>, context: Record<string, any>) => {
        if (context.discussionList) {
            items.add("discussion", new ModelPath().add("discussion", context.discussion));
        }
    })
    let comingDiscussions: {
        title: string;
        post: number;
        id: string;
        count: number;
    }[] = [];

    function clearAll() {
        comingDiscussions = [];
        m.redraw();
    }
    function addOne(id: string, title: string, post: number) {
        let baseCount = 0;
        for (let i = 0; i < comingDiscussions.length; i++) {
            if (comingDiscussions[i].id == id) {
                baseCount = comingDiscussions[i].count;
                comingDiscussions.splice(i, 1);
                break;
            }
        }
        comingDiscussions.unshift({
            title: title,
            post: post,
            id: id,
            count: baseCount + 1
        });
        if (comingDiscussions.length > 5) {
            comingDiscussions.pop();
        }
    }

    addMessageCb("discussion", (path: ModelPath, data: any) => {
        addOne(data.id, data.title, data.post);
        m.redraw();
    });



    extend(DiscussionList.prototype, "view", function (this: DiscussionList, vnode: any) {
        if (comingDiscussions.length && vnode && vnode.children && Array.isArray(vnode.children)) {
            vnode.children.unshift(ComingDiscussion.component({
                list: comingDiscussions,
                cb: (() => {
                    (this.attrs as any).state.refresh().then(clearAll);
                }).bind(this)
            }));
        }
    })
    extend(DiscussionList.prototype, "oncreate", () => {
        WebsocketHelper.getInstance().setContext({
            discussionList: true
        }).reSubscribe();
    })
    extend(DiscussionList.prototype, "onbeforeremove", () => {
        WebsocketHelper.getInstance().setContext({
            discussionList: null
        }).reSubscribe();
    })
}