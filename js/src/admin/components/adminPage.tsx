import ExtensionPage from "flarum/admin/components/ExtensionPage";
import app from 'flarum/admin/app';
import Button from "flarum/common/components/Button";
import LoadingIndicator from "flarum/common/components/LoadingIndicator";
function _trans(key: string): string {
    return app.translator.trans("xypp-websocket-notification.admin." + key) as string;
}
export default class adminPage extends ExtensionPage {
    WS_KEYS = [
        "port", "address", "cert", "pk", "self-signed"
    ];
    WS_TYPES = ["websocket", "internal"];
    WS_FUNCTIONS = ["discussion", "post", "notification"]
    oncreate(vnode: any): void {
        super.oncreate(vnode);
    }
    content(vnode: any) {
        return <div className="xypp-wsn-adminPage-container">
            {/** 通用设置 */}
            <div className="xypp-wsn-adminPage-group">
                <h2>{_trans(`settings.common.title`)}</h2>
                <div>
                    {_trans(`settings.common.desc`)}
                </div>
                {this.buildSettingComponent({
                    type: "text",
                    setting: `xypp.ws_notification.common.public_address`,
                    label: _trans(`settings.common.public_address`),
                })}
                {this.buildSettingComponent({
                    type: "text",
                    setting: `xypp.ws_notification.common.internal_address`,
                    label: _trans(`settings.common.internal_address`),
                })}
            </div>
            {/** 功能设置 */}
            <div className="xypp-wsn-adminPage-group">
                <h2>{_trans(`settings.function.title`)}</h2>
                <div>
                    {_trans(`settings.function.desc`)}
                </div>
                {this.WS_FUNCTIONS.map((key) => {
                    return this.buildSettingComponent({
                        type: "boolean",
                        setting: `xypp.ws_notification.function.${key}`,
                        label: _trans(`settings.function.${key}`),
                    })
                })}
            </div>
            {/** WebSocket设置 */}
            {this.WS_TYPES.map((type) => {
                return <div className="xypp-wsn-adminPage-group">
                    <h2>{_trans(`settings.${type}.title`)}</h2>
                    <div>
                        {_trans(`settings.${type}.desc`)}
                    </div>
                    {this.WS_KEYS.map((key) => {
                        return this.buildSettingComponent({
                            type: key === "self-signed" ? "boolean" : "text",
                            setting: `xypp.ws_notification.${type}.${key}`,
                            label: _trans(`settings.${type}.${key}`),
                        })
                    })}
                </div>
            })}
            {this.submitButton()}
        </div>
    }
}