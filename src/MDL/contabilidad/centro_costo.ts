import SSocket from "servisofts-socket";
import Model from "../../Model";
import MDL from "..";

export default class centro_costo {

    async getAll() {
        const resp: any = await SSocket.sendPromise({ service: "contabilidad", component: "centro_costo", type: "getAll", key_empresa: Model.empresa.Action.getKey() });
        return Object.values(resp.data ?? {});
    }

    async getByKey(key_empresa: String) {
        const resp: any = await SSocket.sendPromise({ service: "contabilidad", component: "centro_costo", type: "getByKey", key_empresa: key_empresa })
        return resp.data;
    }
    async registrar(data: any) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "contabilidad", component: "centro_costo", type: "registro", data: data,
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: MDL.empresa?.select?.key
        })
        return resp.data;
    }

    async editar(data: any) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "contabilidad", component: "centro_costo", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
    async eliminar(data: any) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "contabilidad", component: "centro_costo", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
}