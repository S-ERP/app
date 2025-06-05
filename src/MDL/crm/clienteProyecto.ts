import SSocket from "servisofts-socket";
import { Proyecto } from "./type";
import Model from "../../Model";
import { STheme } from "servisofts-component";

export default class clienteProyecto {

    async getAllPendientes() {
        const resp: any = await SSocket.sendPromise({
            service: "crm", component: "cliente_proyecto", type: "getAllLeadsPendientes",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey()
        });
        return Object.values(resp.data);
    }
    async getAll() {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "getAllFull",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey()
        });
        return Object.values(resp.data);
    }

    async getFull(key: String) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "getFull",
            key: key
        })
        return resp.data;
    }
    async registrar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "cliente_proyecto", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
        return resp.data;
    }
    async editar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "cliente_proyecto", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }
    async eliminar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({ service: "crm", component: "cliente_proyecto", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
        return resp.data;
    }

    stages = [
        { key: 'por_llamar', name: 'Por Llamar', color: STheme.color.lightGray, states: ["nuevo", "rellamada", "vencido", "llamada_fallida"] },
        { key: 'en_llamada', name: 'En llamada', color: STheme.color.warning, states: ["en_proceso"] },
        { key: 'confirmado', name: 'Confirmados', color: STheme.color.success, states: ["confirmado"] },
        { key: 'no_llamar', name: 'No llamar', color: STheme.color.danger, states: ["spam", "double", "cancelado"] },
    ];
    stagesDelivery = [
        { key: 'por_llamar', name: 'Por Llamar', color: STheme.color.lightGray, states: ["confirmado","delivery_nuevo", "delivery_rellamada", "delivery_vencido", "delivery_llamada_fallida"] },
        { key: 'en_llamada', name: 'En llamada', color: STheme.color.warning, states: ["delivery_en_proceso"] },
        { key: 'confirmado', name: 'Confirmados', color: STheme.color.success, states: ["pagado"] },
        { key: 'no_llamar', name: 'No llamar', color: STheme.color.danger, states: ["spam", "double", "cancelado"] },
    ];
}