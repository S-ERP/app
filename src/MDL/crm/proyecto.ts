import SSocket from "servisofts-socket";
import { Proyecto } from "./type";
import Model from "../../Model";

export default class proyecto {

    async getAll() {
        const resp: any = await SSocket.sendPromise({
            service: "crm", component: "proyecto",
            type: "getAll",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey()
        });
        return Object.values(resp.data);
    }
    async registrar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
        return resp.data;
    }
    async editar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
    async eliminar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }

    
    
}