import { EventListener, Descuento } from "./types";
import MDLAbstract from "../MDLAbstract";
import Model from "../../Model";
import SSocket from "servisofts-socket";
import MDL from "..";
import { SNotification, SStorage, STheme } from "servisofts-component";
export default class compra_venta extends MDLAbstract<EventListener> {
  sucursalSeleccionada = null;
  monedaSeleccionada: any = null;
  async registrar(data: any) {
    const formar = {
      descripcion: "Venta desde punto de venta",
      key_usuario: data.key_cajero,
      key_cliente: data?.cliente?.key,
      cliente: data?.cliente,
      key_cajero: data.key_cajero,
      key_caja: MDL.caja.activa?.key,
      tipos_pago: data?.caja?.tipos_pago,
      facturar: data?.caja?.conFactura,
      detalle: data.detalle,
      key_moneda: data.key_moneda,
      descuentos: data.descuentos,
      key_almacen: '0f8fb5f0-c4c1-4e98-ad8d-dcdbfba65258'
    };
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja_detalle",
      type: "venta",
      data: formar
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
  totalItemsCarrito = 0
  updateCarritoItems(carritoCantidad: any) {
    this.totalItemsCarrito = carritoCantidad;
    this.dispatchEvent({ type: "carrito_globo" })
  }
  setMonedaSeleccionada(moneda: any) {
    this.monedaSeleccionada = moneda;
    return moneda;
  }
  getMonedaSeleccionada() {
    return this.monedaSeleccionada;
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
  getJson(value: any) {
    return SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "getJson",
      key: value,
      key_empresa: Model.empresa.Action.getKey(),
    }).then((resp: any) => resp.data);
  }
  getTotales(value: any) {
    var compra_venta_detalle = value
    console.log("compra_venta_detalle", compra_venta_detalle)
    var descuentoData = compra_venta_detalle.descuento;
    if (!compra_venta_detalle) return null;
    var t = {
      subtotal: 0,
      descuento: 0,
      total: 0,
      gifcard: 0,
      total_a_pagar: 0,
      credito_fiscal: 0,
    }
    Object.values(compra_venta_detalle.detalle).map(((obj: any) => {
      if (!obj.estado) return;
      const { precio_unitario, precio_unitario_base, precio_facturado, cantidad, descuento } = obj;
      const precio = (((precio_unitario_base ?? 0) * cantidad) - (descuento ?? 0));
      t.subtotal += precio;
    }))
    t.descuento = descuentoData;
    t.total = t.subtotal - descuentoData
    t.total_a_pagar = t.total - t.gifcard
    return t;
  }
  async getByKeyComraVenta(value: any) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_pdf",
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
  async getTransaccion(_tipo: String, fecha_inicio_: String, fecha_fin_: String) {
    const key_empresa = MDL.empresa?.select?.key || {};
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_compras_ventas_alvarito",
      params: ["'" + key_empresa + "'", "'" + fecha_inicio_ + "'", "'" + fecha_fin_ + "'", "'" + _tipo + "'"],
    });
    return resp.data || [];
  }
  async getAllCostos() {
    const key_empresa = MDL.empresa?.select?.key || {};
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "get_compra_venta_costos",
      params: ["'" + key_empresa + "'"],
    });
    return resp.data || [];
  }


  async editar_compra_venta_detalle_costo(___data: any) {
    ___data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "compra_venta", component: "compra_venta_detalle_costo", type: "editar", data: ___data, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }




  async getTransaccionCuotasCompras(_key_proveedor: String) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: "_get_compras_proveedor",
      params: ["'" + _key_proveedor + "'"],
    });
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
  async execute_function(func: string, params: string[]) {
    let newParams: any = [];
    if (params) {
      params.map(p => {
        if (typeof p == "string") {
          p = "'" + p + "'"
        }
        newParams.push(p)
      })
    }
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "reporte",
      type: "execute_function",
      func: func,
      params: newParams,
    });
    return resp.data || [];
  }
  async registrarDescuento(data: Descuento) {
    data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "compra_venta", component: "descuento", type: "registro", data: data, key_usuario: Model.usuario.Action.getKey(), key_empresa: Model.empresa.Action.getKey() })
    return resp.data;
  }
  async editarDescuento(data: Descuento) {
    data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "compra_venta", component: "descuento", type: "editar", data: data, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
  async eliminarDescuento(data: Descuento) {
    data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({ service: "compra_venta", component: "descuento", type: "editar", data: { ...data, estado: 0 }, key_usuario: Model.usuario.Action.getKey() });
    return resp.data;
  }
  async factura(value: any) {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "compra_venta",
      type: "factura",
      key: value,
      key_empresa: Model.empresa.Action.getKey(),
    });
    return resp.data;
  }
  async _contabilizar(value: any) {
    return "contabilizando";
  }
  async _desContabilizar(value: any) {
    return "Des_contabilizando";
  }
}
