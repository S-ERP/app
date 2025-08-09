import { Proyecto, EventListener } from "./type";

import MDLAbstract from "../MDLAbstract";

import proveedor from "./proveedor";
import Model from "../../Model";
import SSocket from "servisofts-socket";
import MDL from "..";

export default class compra_venta extends MDLAbstract<EventListener> {
  proveedor = new proveedor();

  async registrar(data: any) {
    const formar = {
      key_usuario: Model.usuario.Action.getKey(),
      key_empresa: MDL.empresa.select?.key,
      key_sucursal: "1efe069d-a49b-4b3c-b57b-ef488e274370",
      descuento: parseFloat(data.caja.descuento),
      monto_total: parseFloat(data.caja.monto_total),
      monto_factura: parseFloat(data.caja.monto_factura),
      detalle: data.detalle,
    };
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "ventaRapida",
      data: formar,
    });
    return resp.data;
  }
}
