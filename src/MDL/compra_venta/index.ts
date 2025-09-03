import { EventListener } from "./types";

import MDLAbstract from "../MDLAbstract";
import Model from "../../Model";
import SSocket from "servisofts-socket";
import MDL from "..";
import { SStorage, STheme } from "servisofts-component";


export default class compra_venta extends MDLAbstract<EventListener> {
  sucursalSeleccionada = null;

  async registrar(data: any) {
    // const sucursal = this.sucursalSeleccionada;
    // console.log("se esta registrando todo " + JSON.stringify(data))
    // return;
    const formar = {
      key_usuario: data.key_cajero,
      key_cliente: data?.key_cliente,
      cliente: data?.cliente,
      key_cajero: data.key_cajero,
      key_caja: MDL.caja.activa?.key,
      tipos_pago: data?.caja?.tipos_pago,
      facturar: data?.caja?.conFactura,
      detalle: data.detalle,
    };

    // console.log("dime quien " + JSON.stringify(formar));
    // return;
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "ventaRapida",
      data: formar,
      key_cliente: data?.key_cliente,
      cliente: data?.cliente,
    });
    MDL.caja.dispatchEvent({ type: "onDetalleChange" })
    this.dispatchEvent({ type: "venta_realizada" })
    return resp.data;
  }

  vaciarAll() {
    this.dispatchEvent({ type: "venta_realizada" })
  }

  conStock() {
    this.dispatchEvent({ type: "conStock" })
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
  async getAll() {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    });

    return resp.data;
    // return Object.values(resp.data || {});
    // return resp.data ;
    // return JSON.stringify(resp.data);
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


  async getTransaccion(_tipo: any, fecha_inicio_: any, fecha_fin_: any) {

    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_compras_ventas_alvarito",
      params: ["'" + _tipo + "'", "'" + fecha_inicio_ + "'", "'" + fecha_fin_ + "'"],
    });
    return resp.data[0] || [];
  }


}
