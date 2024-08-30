import { extend } from "flarum/common/extend";
import ComposerBody from "flarum/forum/components/ComposerBody";
import { WebsocketHelper } from "../../common";
import { ModelPath } from "../../common/Data/ModelPath";
import app from "flarum/forum/app";
import DiscussionPage from "flarum/forum/components/DiscussionPage";
import Discussion from "flarum/common/models/Discussion";
import User from "flarum/common/models/User";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import ItemList from "flarum/common/utils/ItemList";
import PostStream from "flarum/forum/components/PostStream";
import TypingTip from "./components/TypingTip";
import FieldSet from "flarum/common/components/FieldSet";
import Switch from "flarum/common/components/Switch";
import SettingsPage from "flarum/forum/components/SettingsPage";
export function initTypingTip() {
    addMessageCb("typing", (path: ModelPath, data: any) => {
        const discussion = app.store.getById("discussions", path.getId("discussion") as string);
        if (discussion) {
            const typings = (discussion as any).typingUsers;
            for (let i = 0; i < typings.length; i++) {
                if (typings[i].id() == path.getId("state")) {
                    typings.splice(i, 1);
                    if (!data.state) {
                        m.redraw();
                        return;
                    }
                }
            }
            if (!data.state) {
                (discussion as any).restTypingUsers--;
                return;
            }
            typings.unshift(app.store.pushPayload<User>(data.user));
            m.redraw();
        }
    });
    addSubscribeCb("typing", (items, context) => {
        if (!app.forum.attribute("xyppWsnTypeTip")) {
            return;
        }
        if (context.discussion) {
            items.add("typing", new ModelPath().add("state").add("session").add("discussion", context.discussion).add("typing"));
        }
    });
    extend(ComposerBody.prototype, "oninit", function (this: ComposerBody, val: any) {
        if (!app.forum.attribute("xyppWsnTypeTip")) {
            return;
        }
        if ((app.session?.user?.preferences() || {})["xyppWsnNoTypeTip"]) {
            return;
        }
        if ((this.attrs as any).discussion)
            WebsocketHelper.getInstance()
                .state(new ModelPath()
                    .add("state", app.session?.user?.id())
                    .add("session")
                    .add("discussion", (this.attrs as any).discussion.id())
                    .add("typing")
                );
        if ((this.attrs as any).post)
            WebsocketHelper.getInstance()
                .state(new ModelPath()
                    .add("state", app.session?.user?.id())
                    .add("session")
                    .add("discussion", (this.attrs as any).post.discussion().id())
                    .add("typing")
                );
    });
    extend(ComposerBody.prototype, "onbeforeremove", function (this: ComposerBody, r: any) {
        if (!app.forum.attribute("xyppWsnTypeTip")) {
            return;
        }
        if ((app.session?.user?.preferences() || {})["xyppWsnNoTypeTip"]) {
            return;
        }
        if ((this.attrs as any).discussion)
            WebsocketHelper.getInstance()
                .state(new ModelPath()
                    .add("state", app.session?.user?.id())
                    .add("session")
                    .add("release")
                    .add("discussion", (this.attrs as any).discussion.id())
                    .add("typing")
                );
        if ((this.attrs as any).post)
            WebsocketHelper.getInstance()
                .state(new ModelPath()
                    .add("state", app.session?.user?.id())
                    .add("session")
                    .add("release")
                    .add("discussion", (this.attrs as any).post.discussion().id())
                    .add("typing")
                );
    });
    extend(DiscussionPage.prototype, "show", function (this: DiscussionPage, r: any, discussion: Discussion) {
        const typings: {
            user: { data: any }[]
        } = discussion.attribute("typeTip");
        //@ts-ignore
        discussion.typingUsers = [];
        for (const user of typings.user) {
            let u: User | undefined = app.store.getById<User>("users", user.data.id);
            if (!u) {
                u = app.store.pushPayload<User>(user);
            }
            //@ts-ignore
            discussion.typingUsers.push(u);
        }
    })
    extend(PostStream.prototype, "endItems", function (this: PostStream, items: ItemList<any>) {
        if (this.discussion.typingUsers.length)
            items.add("typings", TypingTip.component({
                typingUsers: this.discussion.typingUsers,
                key: "typingTip"
            }));
    });

    extend(SettingsPage.prototype, 'settingsItems', function (items) {
        items.add(
            'xypp-wsn-typing-option',
            <FieldSet label={app.translator.trans("xypp-websocket-notification.forum.typing.title")} className="Settings-typing">
                <p><Switch
                    state={((app.session?.user?.preferences() || {})["xyppWsnNoTypeTip"] || false)}
                    onchange={(v: boolean) => {
                        app.session?.user?.savePreferences({
                            "xyppWsnNoTypeTip": v
                        });
                    }}
                >{app.translator.trans("xypp-websocket-notification.forum.typing.no_type_tip")}</Switch></p>
            </FieldSet>
        );
    })

}