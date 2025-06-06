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
  async editarCarrito(data: any[], key_cliente_proyecto:string) {
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
      name: "En llamada",
      color: STheme.color.warning,
      states: ["delivery_en_proceso"],
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
      states: ["spam", "double", "cancelado"],
    },
  ];

  stageColor = {
    nuevo: "#9b59b6", // violeta
    rellamada: "#2980b9", // azul
    vencido: "#f1c40f", // amarillo
    llamada_fallida: "#666666", 
    en_proceso: "#e67e22", // ámbar
    confirmado: "#27ae60", // verde
    pagado: "#2ecc71", // verde claro
    spam: "#c0392b", // rojo
    double: "#8e44ad", // púrpura
    cancelado: "#e74c3c", // rojo claro
    delivery_nuevo: "#3498db", // azul claro
    delivery_rellamada: "#1abc9c", // turquesa
    delivery_vencido: "#f39c12", // ámbar
    delivery_llamada_fallida: "#d35400", // naranja oscuro
    delivery_en_proceso: "#f39c12", // ámbar
  };

  stageNombre = {
    nuevo: "Nuevo",
    rellamada: "Re-llamar",
    vencido: "Vencido",
    llamada_fallida: "Llamada fallida",
    en_proceso: "En proceso",
    confirmado: "Confirmado",
    pagado: "Pagado",
    spam: "Spam",
    double: "Duplicado",
    cancelado: "Cancelado",
    delivery_nuevo: "Delivery nuevo",
    delivery_rellamada: "Re-llamar delivery",
    delivery_vencido: "Delivery vencido",
    delivery_llamada_fallida: "Delivery fallido",
    delivery_en_proceso: "Delivery en proceso",
  };
}