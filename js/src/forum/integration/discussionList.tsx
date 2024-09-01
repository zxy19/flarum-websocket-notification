import ItemList from "flarum/common/utils/ItemList";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import { ModelPath } from "../../common/Data/ModelPath";
import app from "flarum/forum/app";
import DiscussionPage from "flarum/forum/components/DiscussionPage"
import { extend } from "flarum/common/extend";
import { WebsocketHelper } from "../../common/helper/WebsocketHelper";
import DiscussionList from "flarum/forum/components/DiscussionList"
import ComingDiscussion from "./components/ComingDiscussion";
import Discussion from "flarum/common/models/Discussion";
import FieldSet from "flarum/common/components/FieldSet";
import SettingsPage from "flarum/forum/components/SettingsPage";
import Switch from "flarum/common/components/Switch";
import Button from "flarum/common/components/Button";
import { addUnread } from "../utils/unreadTip";
export function initDiscussionList() {
    addSubscribeCb("discussion", (items: ItemList<ModelPath>, context: Record<string, any>) => {
        if (context.discussionList) {
            if (context.discussionListTag) {
                const tag = app.store.getBy<any>("tags", "slug", context.discussionListTag);
                if (tag) {
                    items.add("discussionList", new ModelPath().add("tag", tag.id()).add("discussion"));
                }
            } else {
                items.add("discussionList", new ModelPath().add("discussion"));
            }
        }
    })
    let comingDiscussions: {
        title: string;
        post: number;
        id: string;
        count: number;
    }[] = [];
    let toPullUpDiscussions: Discussion[] = [];
    function refresh() {
        toPullUpDiscussions.forEach(app.discussions.addDiscussion.bind(app.discussions));

        comingDiscussions = [];
        toPullUpDiscussions = [];
        m.redraw();
    }
    function addOne(id: string, title: string, post: number) {
        if ((app.current?.data as any)?.discussion?.id() == id) return;
        let baseCount = 0;
        let exist = false;
        for (let i = 0; i < comingDiscussions.length; i++) {
            if (comingDiscussions[i].id == id) {
                baseCount = comingDiscussions[i].count;
                comingDiscussions.splice(i, 1);
                exist = true;
                break;
            }
        }
        if (!exist) {
            const routeName: string = (app.current?.data as any)?.routeName || "";
            if (routeName !== "discussion" && routeName !== "discussion.near")
                addUnread();
        }
        comingDiscussions.unshift({
            title: title,
            post: post,
            id: id,
            count: baseCount + 1
        });
        const maxLen = (app.session?.user?.preferences() || {})["xyppWsnNewDiscussionListLen"] || 5;
        if (comingDiscussions.length > maxLen) {
            comingDiscussions.pop();
        }
    }

    addMessageCb("discussion", (path: ModelPath, data: any) => {
        const discussion: Discussion = app.store.pushPayload<Discussion>(data.discussion);
        const idx = toPullUpDiscussions.findIndex(d => d.id() == discussion.id());
        if (idx != -1) {
            toPullUpDiscussions.splice(idx, 1);
        }
        toPullUpDiscussions.push(discussion);
        addOne(discussion.id() as string, discussion.title(), data.post);
        m.redraw();
    });



    extend(DiscussionList.prototype, "view", function (this: DiscussionList, vnode: any) {
        if (comingDiscussions.length && vnode && vnode.children && Array.isArray(vnode.children)) {
            vnode.children.unshift(ComingDiscussion.component({
                list: comingDiscussions,
                cb: (() => {
                    refresh();
                }).bind(this)
            }));
        }
    })
    extend(DiscussionList.prototype, "oncreate", function (this: DiscussionList) {
        const tag = (this.attrs as any).state.params.tags;
        WebsocketHelper.getInstance().setContext({
            discussionListTag: tag,
            discussionList: true
        }).reSubscribe();
    });
    extend(DiscussionList.prototype, "onbeforeremove", () => {
        WebsocketHelper.getInstance().setContext({
            discussionList: null
        }).reSubscribe();
    });


    extend(DiscussionPage.prototype, "show", function (this: DiscussionPage, r: any, discussion: Discussion) {
        if (discussion)
            for (let i = comingDiscussions.length - 1; i >= 0; i--) {
                if (comingDiscussions[i].id == discussion.id()) {
                    comingDiscussions.splice(i, 1);
                    break;
                }
            }
    })


    let savingList = false;
    extend(SettingsPage.prototype, 'settingsItems', function (items) {
        items.add(
            'xypp-wsn-newPostOption',
            <FieldSet label={app.translator.trans("xypp-websocket-notification.forum.new_discussion.title")} className="Settings-newPost">
                <p><Switch
                    state={((app.session?.user?.preferences() || {})["xyppWsnNewDiscussionAutoRefresh"] || false)}
                    onchange={(v: boolean) => {
                        app.session?.user?.savePreferences({
                            "xyppWsnNewDiscussionAutoRefresh": v
                        });
                    }}
                >{app.translator.trans("xypp-websocket-notification.forum.new_discussion.auto_refresh")}</Switch></p>
                <p>{app.translator.trans("xypp-websocket-notification.forum.new_discussion.list_length")}</p>
                <div>
                    <input
                        id="input-xyppWsnNewDiscussionListLen"
                        className="FormControl"
                        type="number"
                        value={((app.session?.user?.preferences() || {})["xyppWsnNewDiscussionListLen"] || 5)}
                    />
                    <Button className="Button Button--primary" onclick={((e: any) => {
                        e.preventDefault();
                        savingList = true;
                        m.redraw();
                        app.session?.user?.savePreferences({
                            "xyppWsnNewDiscussionListLen": parseInt($("#input-xyppWsnNewDiscussionListLen").val() as string)
                        }).then(() => {
                            savingList = false;
                            m.redraw();
                        });
                    })} disabled={savingList} loading={savingList}>{app.translator.trans("xypp-websocket-notification.forum.new_discussion.list_len_button")}</Button>
                </div>
            </FieldSet>
        );
    })
}