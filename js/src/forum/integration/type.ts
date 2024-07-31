import { extend } from "flarum/common/extend";
import ComposerBody from "flarum/forum/components/ComposerBody";
import { WebsocketHelper } from "../../common";
import { ModelPath } from "../../common/Data/ModelPath";
import app from "flarum/forum/app";
function initTypingTip() {

    extend(ComposerBody.prototype, "oninit", function (this: ComposerBody, val: any) {
        if ((this.attrs as any).discussion)
            WebsocketHelper.getInstance()
                .state(new ModelPath()
                    .add("state", app.session?.user?.id())
                    .add("discussion", (this.attrs as any).discussion.id())
                    .add("typing")
                );
    })
}