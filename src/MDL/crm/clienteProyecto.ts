import SSocket from "servisofts-socket";
import { Proyecto } from "./type";
import Model from "../../Model";
import { STheme } from "servisofts-component";

export default class clienteProyecto {
    async getAllPendientes() {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "getAllLeadsPendientes",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        });
        return Object.values(resp.data);
    }
    async getAll() {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "getAllFull",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        });
        return Object.values(resp.data);
    }

    async getFull(key: String) {
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "getFull",
            key: key,
        });
        return resp.data;
    }
    async registrar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "registro",
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }
    async editar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "editar",
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }
    async editarCarrito(data: any[], key_cliente_proyecto: string) {
        // data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "editarCarrito",
            key_cliente_proyecto: key_cliente_proyecto,
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }
    async eliminar(data: Proyecto) {
        data.key_empresa = Model.empresa.Action.getKey();
        const resp: any = await SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "editar",
            data: { ...data, estado: 0 },
            key_usuario: Model.usuario.Action.getKey(),
        });
        return resp.data;
    }



    STATES = {
        nuevo: {
            color: "#9b59b6", // violeta
            name: "Nuevo",
            key: "nuevo",
        },
        rellamada: {
            color: "#2980b9", // azul
            name: "Re-llamar",
            key: "rellamada",
        },
        vencido: {
            color: "#f1c40f", // amarillo
            name: "Vencido",
            key: "vencido",
        },
        llamada_fallida: {
            color: "#666666", // gris
            name: "Llamada fallida",
            key: "llamada_fallida",
        },
        en_proceso: {
            color: "#e67e22", // ámbar
            name: "En proceso",
            key: "en_proceso",
        },
        confirmado: {
            color: "#27ae60", // verde
            name: "Confirmado",
            key: "confirmado",
        },
        pagado: {
            color: "#2ecc71", // verde claro
            name: "Pagado",
            key: "pagado",
        },
        spam: {
            color: "#c0392b", // rojo
            name: "Spam",
            key: "spam",
        },
        double: {
            color: "#8e44ad", // púrpura
            name: "Duplicado",
            key: "double",
        },
        cancelado: {
            color: "#e74c3c", // rojo claro
            name: "Cancelado",
            key: "cancelado",
        },
        delivery_nuevo: {
            color: "#3498db", // azul claro
            name: "Delivery nuevo",
            key: "delivery_nuevo",
        },
        delivery_rellamada: {
            color: "#1abc9c", // turquesa
            name: "Re-llamar delivery",
            key: "delivery_rellamada",
        },
        delivery_vencido: {
            color: "#f39c12", // ámbar
            name: "Delivery vencido",
            key: "delivery_vencido",
        },
        delivery_llamada_fallida: {
            color: "#666666", // naranja oscuro
            name: "Llamada fallida delivery",
            key: "delivery_llamada_fallida",
        },
        delivery_en_proceso: {
            color: "#f39c12", // ámbar
            name: "En proceso delivery",
            key: "delivery_en_proceso",
        },
        despacho: {
            color: "#171F58", // ámbar
            name: "En despacho",
            key: "despacho",
        },
        devuelto: {
            color: "#e74c3c", // rojo claro
            name: "Devuelto",
            key: "devuelto",
        },
        rechazo: {
            color: "#c0392b", // rojo
            name: "Rechazo",
            key: "rechazo",
        },

    }

    stages = [
        {
            key: "por_llamar",
            name: "Por Llamar",
            color: STheme.color.lightGray,
            states: ["nuevo", "rellamada", "vencido", "llamada_fallida"],
        },
        {
            key: "en_llamada",
            name: "En llamada",
            color: STheme.color.warning,
            states: ["en_proceso"],
        },
        {
            key: "confirmado",
            name: "Confirmados",
            color: STheme.color.success,
            states: ["confirmado"],
        },
        {
            key: "no_llamar",
            name: "No llamar",
            color: STheme.color.danger,
            states: ["spam", "double", "cancelado"],
        },
    ];
    stagesDelivery = [
        {
            key: "por_llamar",
            name: "Por Llamar",
            color: STheme.color.lightGray,
            states: [
                "confirmado",
                "delivery_nuevo",
                "delivery_rellamada",
                "delivery_vencido",
                "delivery_llamada_fallida",
            ],
        },
        {
            key: "en_llamada",
            name: "En proceso",
            color: STheme.color.warning,
            states: ["delivery_en_proceso"],
        },
        {
            key: "en_delivery",
            name: "En delivery",
            color: "#171F58",
            states: ["despacho"],
        },
        {
            key: "confirmado",
            name: "Confirmados",
            color: STheme.color.success,
            states: ["pagado"],
        },
        {
            key: "no_llamar",
            name: "No llamar",
            color: STheme.color.danger,
            states: ["devuelto", "rechazo"],
        },
    ];
}