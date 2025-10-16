import SSocket from "servisofts-socket";
import { Proyecto } from "./type";
import Model from "../../Model";

export default class tipoCliente {

    async getAll() {
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_cliente", type: "getAll", key_empresa: Model.empresa.Action.getKey() });
        return Object.values(resp.data ?? {});
    }

    async getByKey(key_empresa: String) {
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_cliente", type: "getByKey", key_empresa: key_empresa })
        return resp.data;
    }
    async registrar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_cliente", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
        return resp.data;
    }
    async addToCliente(data: { key_cliente: string, key_tipo_cliente: string }) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_tipo_cliente",
            type: "registro",
            data: {
                key_cliente: data.key_cliente,
                key_tipo_cliente: data.key_tipo_cliente
            },
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey()
        })
        return resp.data;
    }
    async editar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_cliente", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
    async eliminar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "tipo_cliente", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
}