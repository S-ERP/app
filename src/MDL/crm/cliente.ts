import SSocket from "servisofts-socket";
import { Cliente } from "./type";
import Model from "../../Model";
export default class cliente {
    async getAll() {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
        });
        return Object.values(resp.data);
    }
    async buscar_telefono(telefono: string) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente",
            type: "buscar_telefono",
            key_empresa: Model.empresa.Action.getKey(),
            telefono: telefono,
        });
        return resp.data;
    }
    async buscar_nit(valor: string) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente",
            type: "buscar_nit",
            key_empresa: Model.empresa.Action.getKey(),
            nit: valor,
        });
        return resp.data;
    }
    async getByKey(key_cliente: string) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente",
            type: "getByKey",
            key: key_cliente,
            key_empresa: Model.empresa.Action.getKey(),
        });
        return Object.values(resp.data)[0];
    }
    async registrar(data: Cliente) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente",
            type: "registro",
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }
    async editar(data: Cliente) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente",
            type: "editar",
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }
    async eliminar(data: Cliente) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente",
            type: "editar",
            data: { ...data, estado: 0 },
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }
}