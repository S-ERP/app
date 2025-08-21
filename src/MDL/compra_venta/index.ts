import { Proyecto, EventListener } from "./type";

import MDLAbstract from "../MDLAbstract";
import Model from "../../Model";
import SSocket from "servisofts-socket";
import MDL from "..";
import { SStorage, STheme } from "servisofts-component";
import proveedor from "./proveedor";


export default class compra_venta extends MDLAbstract<EventListener> {
  sucursalSeleccionada = null;
  proveedor = new proveedor();

  async registrar(data: any) {
    const sucursal = this.sucursalSeleccionada;
    console.log("se esta registrando todo " + JSON.stringify(data))
    // return;
    const formar = {
      key_usuario: Model.usuario.Action.getKey(),
      // key_empresa: MDL.empresa.select?.key,
      //key_sucursal: sucursal?.key_sucursal || "default_key_aqui",
      // key_sucursal: data.key_sucursal,
      key_cliente: data.key_cliente,
      // key_vendedor: data.key_vendedor,
      key_caja: MDL.caja.activa?.key,
      key_tipo_pago: data?.caja?.key_tipo_pago,
      // key_tipo_pago: "efectivo",
      // descuento: parseFloat(data.caja.descuento),
      // monto_total: parseFloat(data.caja.monto_total),
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

  getStateInfo(key?: string) {
    const states: any = {
      cotizacion: { color: STheme.color.lightGray, label: "Cotización" },
      aprobado: { color: STheme.color.warning, label: "Aprobado" },
      denegado: { color: STheme.color.danger, label: "Denegado" },
      comprado: { color: STheme.color.success, label: "Comprado" },
      vendido: { color: STheme.color.success, label: "Vendido" },
    };
    if (!key) return states;
    return states[key] ?? null;
  }

  // color: "#8e44ad", // púrpura
  // color: "#f39c12", // ámbar
  // color: "#1abc9c", // turquesa
  // color: "#171F58", // ámbar
  // color: "#41C34A", // violeta

  getTipoPago(key?: string) {
    const _states: any = {
      contado: { color: "#034400ff", label: "Contado" },
      pp_discrecional: { color: "#1207b1ff", label: "Discrecional" },
      pp_financiero: { color: "#008dbcff", label: "Financiero" },
    };
    if (!key) return _states;
    return _states[key] ?? null;
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

  async getByKeyDetalle(value: any) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_compraventa_byalvaro",
      params: ["'" + value + "'"],
    });
    return resp.data[0].detalle || [];
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
