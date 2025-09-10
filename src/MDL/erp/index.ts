import { EventListener } from "./types";

import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";

type ServerListener = {
    key: string,
    service?: string,
    component: string,
    type: string,
}
export default class erp extends MDLAbstract<EventListener> {


    server_listeners: ServerListener[] = []


    async componentDidMount() {
        SSocket.addEventListener("onMessage", (e: any) => {
            if (this.server_listeners) {
                this.server_listeners.forEach((listener:any) => {
                    let valid = true
                    Object.keys(listener).forEach(k => {
                        if (k == "key") return;
                        if (k == "callback") return;
                        if (e[k] == (listener as any)[k]) return;
                        valid = false;
                    })
                    if (valid) {
                        if (listener.callback) listener.callback(e);
                    }
                })
            }
        })
    }

    addServerListener(listener: ServerListener & { callback: (data: any) => void, } & {[k: string]: any}) {
        const exists: any = this.server_listeners.find((a) => {
            return a.key == listener.key
        })
        if (exists) {

            exists.callback = listener.callback;
            return;
        }
        this.server_listeners.push(listener);
        this.updateListener();
        return listener;
    }

    updateListener() {
        SSocket.sendPromise({
            component: "listener",
            type: "save",
            listeners: this.server_listeners.map((a) => {
                const b = { ...a };
                delete (b as any).callback;
                return b;
            })
        })
    }
    removeServerListener(listener: ServerListener) {
        this.server_listeners = this.server_listeners.filter((a) => {
            return !(a.key == listener.key)
        })
        this.updateListener();

    }

}
