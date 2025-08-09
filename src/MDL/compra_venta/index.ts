import { Proyecto, EventListener } from "./type";

import MDLAbstract from "../MDLAbstract";

import proveedor from "./proveedor";
import Model from "../../Model";
import SSocket from "servisofts-socket";
import MDL from "..";
import sucursal from "./sucursal";
import { SStorage } from "servisofts-component";

export default class compra_venta extends MDLAbstract<EventListener> {
  proveedor = new proveedor();
  sucursalSeleccionada = null;

  async registrar(data: any) {
    const sucursal = this.sucursalSeleccionada;
    const formar = {
      key_usuario: Model.usuario.Action.getKey(),
      key_empresa: MDL.empresa.select?.key,
      key_sucursal: sucursal?.key_sucursal || "",
      //   key_sucursal: sucursal?.key_sucursal || "default_key_aqui",
      descuento: parseFloat(data.caja.descuento),
      monto_total: parseFloat(data.caja.monto_total),
      monto_factura: parseFloat(data.caja.monto_factura),
      detalle: data.detalle,
    };

    console.log("dime quien " + JSON.stringify(formar));
    return;
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "ventaRapida",
      data: formar,
    });
    return resp.data;
  }

  setSucursalSeleccionada(sucursal: any) {
    this.sucursalSeleccionada = sucursal;
    return new Promise((resolve, reject) => {
      try {
        SStorage.setItem("sucursal_seleccionada", JSON.stringify(sucursal));
        resolve("Sucursal guardada correctamente");
      } catch (e) {
        reject(e);
      }
    });
  }

  async getSucursalSeleccionada() {
    try {
      const sucursalStr = await SStorage.getItem("sucursal_seleccionada");
      if (!sucursalStr) return null;
      const sucursalObj = JSON.parse(sucursalStr);
      this.sucursalSeleccionada = sucursalObj;
      return sucursalObj;
    } catch (e) {
      console.error("Error al cargar sucursal seleccionada:", e);
      return null;
    }
  }
}
