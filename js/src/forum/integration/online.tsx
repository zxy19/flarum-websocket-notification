import ItemList from "flarum/common/utils/ItemList";
import { ModelPath } from "../../common/Data/ModelPath";
import { addMessageCb, addSubscribeCb } from "../../common/util/frontend";
import app from "flarum/forum/app";
import Post from "flarum/common/models/Post";
import User from "flarum/common/models/User";
import { override } from "flarum/common/extend";

export function initOnline() {

    addSubscribeCb("online", (items: ItemList<ModelPath>, context: Record<string, any>) => {
        items.add("online", new ModelPath().add("state").add("online"));
    });

    addMessageCb("online", (path: ModelPath, data: any) => {
        const id = path.getId("state");
        if (id) {
            const model = app.store.getById<User>("users", id);
            if (model) {
                model.pushAttributes({
                    onlineState: data.state
                });
                m.redraw();
            }
        }
    });

    override(User.prototype, "isOnline", function (this: User, fn: () => boolean) {
        const online = this.attribute("onlineState");
        if (online === false || online === true) return online;
        return fn();
    })
}