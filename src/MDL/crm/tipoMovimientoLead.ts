import SSocket from "servisofts-socket";
import { Proyecto } from "./type";
import Model from "../../Model";

export default class tipoMovimientoLead {

    async getAll() {
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_movimiento_lead", type: "getAll", key_empresa: "c9caa964-88f3-43db-88df-684ecf5c0a1b" });
    // const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipoMovimientoLead", type: "getAll", key_empresa: Model.empresa.Action.getKey() });
    return Object.values(resp.data);
    }
    async getByKey(key_empresa: String) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "tipoMovimientoLead",
            type: "getByKey",
            key_empresa: key_empresa
        })
        return resp.data;
    }
    async registrar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_movimiento_lead", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
        return resp.data;
    }
    async editar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_movimiento_lead", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
    async eliminar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_movimiento_lead", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
}