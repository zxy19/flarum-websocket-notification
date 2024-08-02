import AdminApplication from "flarum/admin/AdminApplication";
import ItemList from "flarum/common/utils/ItemList";
import ForumApplication from "flarum/forum/ForumApplication";
import { ModelPath } from "../Data/ModelPath";
import WebsocketAccessToken from "../model/WebsocketAccessToken";
export type STATUS = "online" | "offline" | "connecting";

export class WebsocketHelper {
    app?: ForumApplication | AdminApplication;
    ws?: WebSocket
    statusChangeCb?: (status: STATUS) => void;
    context: Record<string, any> = {};
    lastSubscribes: string[] = [];
    pingInterval?: any;
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
            if (this.ws) {
                try {
                    this.ws.onclose = () => { }
                    this.ws.close();
                } finally {
                    this.ws = undefined;
                };
            }
            if (this.statusChangeCb) this.statusChangeCb("connecting");
            const item = await this.app.store.createRecord<WebsocketAccessToken>("websocket-access-token").save({});
            const ws = new WebSocket(item.url());
            this.ws = ws;
            ws.onclose = () => {
                this.closeHandler();
                if (this.pingInterval)
                    clearInterval(this.pingInterval);
                if (this.statusChangeCb) this.statusChangeCb("offline");
            }
            ws.onerror = () => {
                if (this.pingInterval)
                    clearInterval(this.pingInterval);
                if (this.statusChangeCb) this.statusChangeCb("offline");
            }
            ws.onopen = () => {
                this.lastSubscribes = [];
                this.reSubscribe();
                this.pingInterval = setInterval(this.ping.bind(this), 30000);
                if (this.statusChangeCb) this.statusChangeCb("online");
            }
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === "sync")
                    this.messageHandler(new ModelPath(data.path), data.data);
            }
        }
    }
    messageHandler(path: ModelPath, data: any) {
        // To be implemented in extends
        console.log(`No handler found ${path.toString()}: ${JSON.stringify(data)}`);
    }
    closeHandler() {
        setTimeout(() => {
            this.start();
        }, 5000);
    }
    getSubscribes(context: Record<string, any>): ItemList<ModelPath> {
        return new ItemList<ModelPath>();
    }
    setContext(context: Record<string, any>) {
        Object.keys(context).forEach(v => {
            if (context[v] === null && this.context[v]) delete this.context[v];
            else this.context[v] = context[v];
        });
        return this;
    }
    reSubscribe(tempContext?: Record<string, any>) {
        const newSub = this.getSubscribes(Object.assign(tempContext || {}, this.context)).toArray().map(v => v.toString());
        console.log(`ReSubscribe: ${newSub.join(", ")}`);
        if (!this.changed(newSub)) return;
        this.lastSubscribes = newSub;
        this.send({
            type: "subscribe",
            path: newSub
        });
        return this;
    }
    state(path: ModelPath) {
        if (!this.app?.session.user) return;
        this.send({
            type: "state",
            path: path.toString()
        })
    }
    send(data: { type: string, [key: string]: any }) {
        if (this.ws) {
            this.ws.send(JSON.stringify(data));
        }
    }
    onStatusChange(cb: (status: STATUS) => void) {
        this.statusChangeCb = cb;
    }
    protected ping() {
        this.send({
            type: "ping"
        });
    }
    protected changed(newSub: string[]): boolean {
        newSub.sort((a, b) => a.localeCompare(b));
        if (newSub.length !== this.lastSubscribes.length) return true;
        for (let i = 0; i < newSub.length; i++) {
            if (newSub[i] !== this.lastSubscribes[i]) return true;
        }
        return false;
    }
}