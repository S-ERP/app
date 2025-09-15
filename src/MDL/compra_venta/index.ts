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
      key_cliente: data?.cliente?.key,
      cliente: data?.cliente,
      key_cajero: data.key_cajero,
      key_caja: MDL.caja.activa?.key,
      tipos_pago: data?.caja?.tipos_pago,
      facturar: data?.caja?.conFactura,
      detalle: data.detalle,
      key_moneda: data.key_moneda,
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


  async getTransaccion(_tipo: String, fecha_inicio_: String, fecha_fin_: String) {
    const key_empresa = MDL.empresa?.select?.key || {};
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_compras_ventas_alvarito",
      params: ["'" + key_empresa + "'", "'" + fecha_inicio_ + "'", "'" + fecha_fin_ + "'", "'" + _tipo + "'"],
      // params: ["'" + 'f894ea35-5ad1-4b61-a2d0-9294965be169' + "'", "'" + '2025-09-01' + "'", "'" + '2025-09-06' + "'", "'" + 'venta' + "'"],
    });
    // console.log("🚀🚀🚀🚀🚀🚀 ~ file: indexresp:", resp.data)
    return resp.data || [];
  }

  async getTransaccionCuotasCompras(_key_proveedor: String) {
    //  @param {string} _key_usuario - Identificador único del usuario (cliente o proveedor).
    // Si `_tipo` es **"compra"**, el `_key_usuario` será interpretado como `key_proveedor`.
    // Si `_tipo` es **"venta"**, el `_key_usuario` será interpretado como `key_cliente` (en este caso, representa al acreditado).
    // const key_empresa = MDL.empresa?.select?.key || {};
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_compras_proveedor",
      params: ["'" + _key_proveedor + "'"],
      // params: ["'" + 'f894ea35-5ad1-4b61-a2d0-9294965be169' + "'", "'" + '2025-09-01' + "'", "'" + '2025-09-06' + "'", "'" + 'venta' + "'"],
    });
    // console.log("🚀🚀🚀🚀🚀🚀 ~ file: indexresp:", resp.data)
    return resp.data || [];
  }

  async getCuotasCompras(key_compra_venta: String) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_cuotas_compras",
      params: ["'" + key_compra_venta + "'"],
    });
    return resp.data || [];
  }


  async getTransaccionCuotasVentas(_key_cliente: String) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_ventas_cliente",
      params: ["'" + _key_cliente + "'"],
    });
    // console.log("🚀🚀🚀🚀🚀🚀 ~ file: indexresp:", resp.data)
    return resp.data || [];
  }




  async getCuotasResumenTotal_compras() {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_cuotas_resumen_total_compras",
      params: ["'" + Model.empresa.Action.getKey() + "'"],
    });
    return resp.data || [];
  }


  async getCuotasResumenTotal_ventas() {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_cuotas_resumen_total_ventas",
      params: ["'" + Model.empresa.Action.getKey() + "'"],
    });
    return resp.data || [];
  }




}
