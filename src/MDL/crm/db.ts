import SSocket from "servisofts-socket";
import { Cliente } from "./type";
import Model from "../../Model";

export default class db {

    async ejecutarConsultaArray(query: string) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "db",
            type: "ejecutarConsultaArray",
            query: query,
            // key_empresa: Model.empresa.Action.getKey(),
        });
        return resp.data as any[]
    }

    async ejecutarConsultaObject(query: string) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "db",
            type: "ejecutarConsultaObject",
            query: query,
            // key_empresa: Model.empresa.Action.getKey(),
        });
        return resp.data as any
    }

}