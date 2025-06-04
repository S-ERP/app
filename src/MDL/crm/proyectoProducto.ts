import SSocket from "servisofts-socket";
import { Campana, Proyecto, ProyectoProducto } from "./type";
import Model from "../../Model";

export default class proyectoProducto {

  async getAll() {
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "getAll", key_usuario: Model.usuario.Action.getKey() });
    return Object.values(resp.data);
  }
  async getAllConProductos() {
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "getAll", key_usuario: Model.usuario.Action.getKey() });
    const respProductos: any = await SSocket.sendPromise({
      "version": "1.0",
      "service": "inventario",
      "component": "producto",
      "type": "getAll",
      "estado": "cargando",
      "key_empresa": Model.empresa.Action.getKey(),
      "key_usuario": Model.usuario.Action.getKey(),
    })

    const arr = Object.values(resp.data);
    arr.forEach((obj: any) => {
      obj.producto = respProductos.data[obj.key_producto];
    })
    return arr;
  }
  async registrar(data: ProyectoProducto) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey() })
    return resp.data;
  }
  async editar(data: ProyectoProducto) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
  async eliminar(data: ProyectoProducto) {
    //   data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "crm", component: "proyecto_producto", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
}