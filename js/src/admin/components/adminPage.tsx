import ExtensionPage from "flarum/admin/components/ExtensionPage";
import app from 'flarum/admin/app';
import Button from "flarum/common/components/Button";
import LoadingIndicator from "flarum/common/components/LoadingIndicator";
import { WebsocketHelper } from "../../common";
import { override } from "flarum/common/extend";
import Alert from "flarum/common/components/Alert";
function _trans(key: string): string {
    return app.translator.trans("xypp-websocket-notification.admin." + key) as string;
}
export default class adminPage extends ExtensionPage {
    WS_KEYS = [
        "port", "address", "cert", "pk", "self-signed"
    ];
    WS_TYPES = ["websocket", "internal"];
    WS_FUNCTIONS = ["discussion", "post", "notification", "like", "typing", "reaction", "poll", "online"]
    testing = false;
    testingServer = false;
    wsHelper?: WebsocketHelper;
    oncreate(vnode: any): void {
        super.oncreate(vnode);
        override(WebsocketHelper.prototype, "retry", () => {
            this.testFail();
        });
        this.wsHelper = WebsocketHelper.getInstance();
        this.wsHelper.init(app);
        this.wsHelper.onStatusChange(this.testResult.bind(this));
    }
    content(vnode: any) {
        return <div className="xypp-wsn-adminPage-container container">
            <div className="xypp-wsn-adminPage-connect-test">
                <h2>{_trans(`settings.test.test`)}</h2>
                <Button
                    onclick={this.testConnection.bind(this)}
                    className="Button Button--primary"
                    loading={this.testing}
                    disabled={this.testing}
                >{_trans(`settings.test.test`)}</Button>
                <Button
                    onclick={this.testServer.bind(this)}
                    className="Button Button--primary"
                    loading={this.testingServer}
                    disabled={this.testingServer}
                >{_trans(`settings.test.test_server`)}</Button>
            </div>
            {/** 通用设置 */}
            <div className="xypp-wsn-adminPage-group">
                <h2>{_trans(`settings.common.title`)}</h2>
                <div className="xypp-wsn-adminPage-group-desc">
                    {_trans(`settings.common.desc`)}
                </div>
                {this.buildSettingComponent({
                    type: "boolean",
                    setting: `xypp.ws_notification.common.enable`,
                    label: _trans(`settings.common.enable`),
                })}
                {this.buildSettingComponent({
                    type: "boolean",
                    setting: `xypp.ws_notification.common.queue`,
                    label: _trans(`settings.common.queue`),
                })}
                {this.buildSettingComponent({
                    type: "boolean",
                    setting: `xypp.ws_notification.common.wait_done`,
                    label: _trans(`settings.common.wait_done`),
                })}
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
                {this.buildSettingComponent({
                    type: "number",
                    setting: `xypp.ws_notification.common.max_subscribe_hold`,
                    label: _trans(`settings.common.max_subscribe_hold`),
                })}
                {this.buildSettingComponent({
                    type: "number",
                    setting: `xypp.ws_notification.common.max_states_hold`,
                    label: _trans(`settings.common.max_state_hold`),
                })}
            </div>
            {/** 功能设置 */}
            <div className="xypp-wsn-adminPage-group">
                <h2>{_trans(`settings.function.title`)}</h2>
                <div className="xypp-wsn-adminPage-group-desc">
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
            <div className="xypp-wsn-adminPage-group">
                <h2>{_trans(`settings.options.title`)}</h2>
                <div className="xypp-wsn-adminPage-group-desc">
                    {_trans(`settings.options.desc`)}
                </div>
                {this.buildSettingComponent({
                    type: "number",
                    setting: `xypp.ws_notification.options.typing_limit`,
                    label: _trans(`settings.options.typing_limit`),
                })}
                {this.buildSettingComponent({
                    type: "boolean",
                    setting: `xypp.ws_notification.options.no_state_check`,
                    label: _trans(`settings.options.no_state_check`),
                })}
            </div>
            <div className="xypp-wsn-adminPage-group">
                <h2>{_trans(`settings.paster.title`)}</h2>
                <div className="xypp-wsn-adminPage-group-desc">
                    {_trans(`settings.paster.desc`)}
                </div>
                {this.buildSettingComponent({
                    type: "number",
                    setting: `xypp.ws_notification.paster.max_record_count`,
                    label: _trans(`settings.paster.max_record_count`),
                })}
                {this.buildSettingComponent({
                    type: "number",
                    setting: `xypp.ws_notification.paster.max_restore_count`,
                    label: _trans(`settings.paster.max_restore_count`),
                })}
                {this.buildSettingComponent({
                    type: "number",
                    setting: `xypp.ws_notification.paster.max_restore_time`,
                    label: _trans(`settings.paster.max_restore_time`),
                })}
            </div>
            {/** WebSocket设置 */}
            {this.WS_TYPES.map((type) => {
                return <div className="xypp-wsn-adminPage-group">
                    <h2>{_trans(`settings.${type}.title`)}</h2>
                    <div className="xypp-wsn-adminPage-group-desc">
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

    testConnection() {
        this.testing = true;
        m.redraw();
        this.wsHelper?.start();
    }
    testResult(rest: string) {
        if (rest === "online") {
            this.testing = false;
            app.alerts.show(Alert, { type: "success" }, _trans("settings.test.success"));
            m.redraw();
            this.wsHelper?.stop();
        }
    }
    testFail() {
        if (this.testing) {
            this.testing = false;
            app.alerts.show(Alert, { type: "danger" }, _trans("settings.test.fail"));
            m.redraw();
            this.wsHelper?.stop();
        }
    }

    async testServer() {
        this.testingServer = true;
        m.redraw();
        const result = await app.request<{ result: boolean }>({
            method: "GET",
            url: app.forum.attribute("apiUrl") + "/websocket-test"
        });
        if (result.result) {
            app.alerts.show(Alert, { type: "success" }, _trans("settings.test.success"));
        } else {
            app.alerts.show(Alert, { type: "danger" }, _trans("settings.test.fail"));
        }
        this.testingServer = false;
        m.redraw();
    }
}