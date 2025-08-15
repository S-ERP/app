import { Proyecto, EventListener } from "./type";

import MDLAbstract from "../MDLAbstract";

import Model from "../../Model";
import SSocket from "servisofts-socket";
import MDL from "..";
import { SStorage } from "servisofts-component";
import proveedor from "./proveedor";
export default class compra_venta extends MDLAbstract<EventListener> {
  sucursalSeleccionada = null;
  proveedor = new proveedor();

  async registrar(data: any) {
    const sucursal = this.sucursalSeleccionada;
    console.log("faaaaaa "+JSON.stringify(data))
    return;
    const formar = {
      key_usuario: Model.usuario.Action.getKey(),
      key_empresa: MDL.empresa.select?.key,
      //key_sucursal: sucursal?.key_sucursal || "default_key_aqui",
      key_sucursal: data.key_sucursal,
      key_cliente: data.key_sucursal,
      key_vendedor: data.key_sucursal,
      descuento: parseFloat(data.caja.descuento),
      monto_total: parseFloat(data.caja.monto_total),
      // monto_factura: parseFloat(data.caja.monto_factura),
      facturar: data?.caja?.conFactura,
      detalle: data.detalle,
    };

    //console.log("dime quien " + JSON.stringify(formar));
    //return;
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "ventaRapida",
      data: formar,
    });
    return resp.data;
  }


  getByKey(value: any) {
    return SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "getByKey",
      key: value,
      key_empresa: Model.empresa.Action.getKey(),
    }).then((resp: any) => resp.data);
  }

  async getByKeyComraVenta(value: any) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_compraventa_byalvaro",
      params: ["'" + value + "'"],
    });
    return resp.data[0] || [];
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
