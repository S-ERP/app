// import SSocket from "servisofts-socket";
// import MDLAbstract from "../MDLAbstract";
// import { EventListener } from "./types";
// // import MDL from "..";
// import Model from "../../Model";

import SSocket from "servisofts-socket";
// import { Proyecto } from "./type";
import Model from "../../Model";
import MDL from "..";
// import MDL from "..";

export default class proveedor {
  // export default class proveedor extends MDLAbstract<EventListener> {
  async componentDidMount() {}

  async getAllProveedor() {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "proveedor",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    });


    return Object.values(resp.data || {});
    // return resp.data ;
    // return JSON.stringify(resp.data);
  }

  async getByKey(value: any) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "proveedor",
      type: "getByKey",
      key: value,
      key_empresa: Model.empresa.Action.getKey(),
    });
    return resp.data;
  }

  async editar(data: any) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "proveedor",
      type: "editar",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }

  async registrar(data: any) {
    data.key_empresa = MDL.empresa.select?.key;
    data.nombre = "oruro";
    data.nit = "10";
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "proveedor",
      type: "registro",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }
}
