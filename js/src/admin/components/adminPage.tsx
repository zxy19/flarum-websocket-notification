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
    oncreate(vnode: any): void {
        super.oncreate(vnode);
    }
    content(vnode: any) {
        return <div className="xypp-wsn-adminPage-container">
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
                            default: 'UTC',
                            label: _trans(`settings.${type}.${key}`),
                        })
                    })}
                </div>
            })}
            {this.submitButton()}
        </div>
    }
}