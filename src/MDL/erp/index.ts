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


    compare(a: any, b: any, lvl = 0) {
        const keys = Object.keys(a);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (k == "key" && lvl == 0) continue;
            if (k == "callback" && lvl == 0) continue;

            // Compraramos si a[k] es json
            if (typeof a[k] == "object" && typeof b[k] == "object" && a[k] != null && b[k] != null) {
                if (!this.compare(a[k], b[k], lvl + 1)) return false;
                continue;
            }
            if (a[k] != b[k]) return false;
        }

        // .forEach(k => {
        //     if (k == "key") return;
        //     if (k == "callback") return;
        //     if (e[k] == (listener as any)[k]) return;
        //     valid = false;
        // })
        return true;
    }
    async componentDidMount() {
        SSocket.addEventListener("onMessage", (e: any) => {
            if (this.server_listeners) {
                this.server_listeners.forEach((listener: any) => {
                    let valid = this.compare(listener, e)

                    if (valid) {
                        if (listener.callback) listener.callback(e);
                    }
                })
            }
        })
    }

    addServerListener(listener: ServerListener & { callback: (data: any) => void, } & { [k: string]: any }) {
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
