import { Proyecto, EventListener } from "./type";

import MDLAbstract from "../MDLAbstract";

import proveedor from "./proveedor";
import Model from "../../Model";
import SSocket from "servisofts-socket";
import MDL from "..";

export default class compra_venta extends MDLAbstract<EventListener> {
  proveedor = new proveedor();

  async registrar(data: any) {

    console.log("aqui " + JSON.stringify(data));
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "ventaRapida",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
      key_empresa: MDL.empresa.select?.key,
    });
    return resp.data;
  }
}
