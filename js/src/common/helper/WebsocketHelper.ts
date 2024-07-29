import AdminApplication from "flarum/admin/AdminApplication";
import ItemList from "flarum/common/utils/ItemList";
import ForumApplication from "flarum/forum/ForumApplication";
import { ModelPath } from "../Data/ModelPath";
import WebsocketAccessToken from "../model/WebsocketAccessToken";

export class WebsocketHelper {
    app?: ForumApplication | AdminApplication;
    ws?: WebSocket
    static instance?: WebsocketHelper;
    public static getInstance(): WebsocketHelper {
        if (!WebsocketHelper.instance) {
            WebsocketHelper.instance = new WebsocketHelper();
        }
        return WebsocketHelper.instance;
    }
    init(app: ForumApplication | AdminApplication) {
        this.app = app;
    }
    async start() {
        if (this.app) {
            const item = await this.app.store.createRecord<WebsocketAccessToken>("websocket-access-token").save({});
            const ws = new WebSocket(item.url());
            this.ws = ws;
            ws.onclose = () => {
                this.closeHandler();
            }
            ws.onopen = () => {
                this.reSubscribe();
            }
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "sync")
                    this.messageHandler(new ModelPath(data.path), data.data);
            }
        }
    }
    messageHandler(path: ModelPath, data: any) {
        
    }
    closeHandler() {
        setTimeout(() => {
            this.start();
        }, 5000);
    }
    getSubscribes(): ItemList<ModelPath> {
        return new ItemList<ModelPath>();
    }
    reSubscribe() {
        this.send({
            type: "subscribe",
            path: this.getSubscribes().toArray().map(v => v.toString())
        });
    }
    send(data: { type: string, [key: string]: any }) {
        if (this.ws) {
            this.ws.send(JSON.stringify(data));
        }
    }
}