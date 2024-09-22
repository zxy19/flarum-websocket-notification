import AdminApplication from "flarum/admin/AdminApplication";
import ItemList from "flarum/common/utils/ItemList";
import ForumApplication from "flarum/forum/ForumApplication";
import { ModelPath } from "../Data/ModelPath";
import WebsocketAccessToken from "../model/WebsocketAccessToken";
import dayjs from "dayjs";
export type STATUS = "online" | "offline" | "connecting" | "partial";

const RETRY_INTERVALS = [100, 2000, 5000, 10000, 60000, 120000];

export class WebsocketHelper {
    app?: ForumApplication | AdminApplication;
    ws?: WebSocket
    statusChangeCb?: (status: STATUS) => void;
    lastConnected: number = 0;
    firstSubscribe: boolean = true;
    context: Record<string, any> = {};
    lastSubscribes: string[] = [];
    pingInterval?: any;
    nextRetry = 0;
    inRetryStatus = false;
    sendInConnecting: { [key: string]: any; type: string; }[] = [];
    static instance?: WebsocketHelper;
    public static getInstance(): WebsocketHelper {
        if (!WebsocketHelper.instance) {
            WebsocketHelper.instance = new WebsocketHelper();
        }
        return WebsocketHelper.instance;
    }
    init(app: ForumApplication | AdminApplication) {
        this.app = app;
        this.lastConnected = dayjs().unix() - 5;
    }
    stop() {
        try {
            this.ws?.close();
            this.ws = undefined;
        } catch (e) { }
    }
    async start() {
        if (this.app) {
            if (!this.app.forum.attribute<boolean>("xyppWsnEnable")) {
                return;
            }
            this.sendInConnecting = [];
            if (this.ws) {
                try {
                    this.ws.onclose = () => { }
                    this.ws.close();
                } finally {
                    this.ws = undefined;
                };
            }
            if (this.statusChangeCb) this.statusChangeCb("connecting");
            let item: WebsocketAccessToken | null = null;
            try {
                item = await this.app.store.createRecord<WebsocketAccessToken>("websocket-access-token").save({});
            } catch (e) {
                this.retry();
            }
            if (!item) {
                this.retry();
                return;
            }
            const ws = new WebSocket(item.url());
            this.ws = ws;
            ws.onclose = () => {
                this.retry();
                if (this.pingInterval)
                    clearInterval(this.pingInterval);
            }
            ws.onerror = () => {
                this.retry();
                if (this.pingInterval)
                    clearInterval(this.pingInterval);
            }
            ws.onopen = () => {
                this.firstSubscribe = true;
                this.lastSubscribes = [];
                this.reSubscribe();
                this.pingInterval = setInterval(this.ping.bind(this), 30000);
                this.sendInConnecting.forEach(v => this.send(v));
                this.sendInConnecting = [];
                if (this.statusChangeCb) this.statusChangeCb("online");
                this.nextRetry = 0;
                this.lastConnected = dayjs().unix();
            }
            ws.onmessage = (e) => {
                this.lastConnected = dayjs().unix();
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
        let data: any = {
            type: "subscribe",
            path: newSub
        };
        if (this.firstSubscribe) {
            this.firstSubscribe = false;
            data.restore = dayjs().unix() - this.lastConnected;
        }
        this.send(data);
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
            if (this.ws.readyState === WebSocket.CONNECTING) {
                this.sendInConnecting.push(data);
            } else if (this.ws.readyState === WebSocket.OPEN) {
                try {
                    this.ws.send(JSON.stringify(data));
                } catch (e) {
                    console.log(`Error Websocket Sending ${e}`);
                }
            }
        }
    }
    onStatusChange(cb: (status: STATUS) => void) {
        this.statusChangeCb = cb;
    }
    retry() {
        if (this.inRetryStatus) return;
        this.inRetryStatus = true;
        if (this.statusChangeCb) this.statusChangeCb("offline");
        setTimeout(() => {
            this.inRetryStatus = false;
            this.start();
        }, RETRY_INTERVALS[this.nextRetry - 1]);
        if (this.nextRetry < RETRY_INTERVALS.length) {
            this.nextRetry += 1;
        }
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