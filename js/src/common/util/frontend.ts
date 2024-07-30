import ItemList from "flarum/common/utils/ItemList";
import { ModelPath } from "../Data/ModelPath";
import { extend, override } from "flarum/common/extend"
import { WebsocketHelper } from "../helper/WebsocketHelper";
export function addSubscribeCb(name: string, cb: (items: ItemList<ModelPath>, context: Record<string, any>) => void) {
    extend(WebsocketHelper.prototype, "getSubscribes", cb);
}
export function addMessageCb(name: string, cb: (path: ModelPath, data: any) => void) {
    override(WebsocketHelper.prototype, "messageHandler", function (orig: (path: ModelPath, data: any) => void, path: ModelPath, data: any) {
        if (path.get()?.name == name) {
            return cb(path, data);
        }
        orig(path, data);
    });
}
