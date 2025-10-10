import { EventListener, Caja, CajaDetalle } from "./types";

import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";
import MDL from "..";
import { SDate } from "servisofts-component";

export default class caja extends MDLAbstract<EventListener> {

  activa: Caja | null = null;

  async componentDidMount() {
    try {
      await this.getActiva();
    } catch (error) {
      console.error(error);
    }
  }
  setActiva(caja: Caja) {
    this.activa = caja;
    this.dispatchEvent({ type: "onChangeActiva" })
  }

  async getActiva() {
    const key_usuario = MDL.usuario.session?.key;
    const key_empresa = MDL.empresa.select?.key
    if (!key_usuario || !key_empresa) {
      // throw "Se requiere key_usuario y key_empresa"
      throw "Debe abrir caja";
    }
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja",
      type: "getActiva",
      key_usuario: key_usuario,
      key_empresa: key_empresa
    })
    const arr: any = Object.values(resp.data);
    this.setActiva(arr[0]);
    return arr[0];
  }
  async getLast({ key_punto_venta = "" }) {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja",
      type: "getLast",
      key_punto_venta: key_punto_venta,
    })
    return resp.data
  }
  async getDetalle(key_caja: string) {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja_detalle",
      type: "getAll",
      key_caja: key_caja,
    })
    return Object.values(resp.data)
  }
  async abrir({ key_punto_venta = "", key_sucursal = "", key_cuenta_contable = "", fecha = new SDate().toString("yyyy-MM-dd") }) {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja",
      type: "registro",
      // key_punto_venta: key_punto_venta,
      data: {
        key_usuario: MDL.usuario.session?.key,
        key_cuenta_contable: key_cuenta_contable,
        key_punto_venta: key_punto_venta,
        key_sucursal: key_sucursal,
        fraccionar_moneda: false,
        key_empresa: MDL.empresa.select?.key,
        fecha: fecha
      },
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    })
    this.getActiva();
    return resp.data
  }
  async cerrar({ key_punto_venta = "", key = "" }) {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja",
      type: "editar",
      action: "cerrar",
      // key_punto_venta: key_punto_venta,
      data: {
        key: key,
        key_punto_venta: key_punto_venta
      },
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    })
    this.getActiva();
    return resp.data
  }
  async registro_detalle(caja_detalle: CajaDetalle) {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja_detalle",
      type: "registro",
      // key_punto_venta: key_punto_venta,
      data: caja_detalle,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    })
    this.dispatchEvent({ type: "onDetalleChange" })
    return resp.data
  }

  async editar_detalle(caja_detalle: CajaDetalle) {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja_detalle",
      type: "editar",
      data: caja_detalle,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    })
    this.dispatchEvent({ type: "onDetalleChange" })
    return resp.data
  }

  async getAll(key: string) {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja",
      type: "getAll",
      key_empresa: key,
    })
    return Object.values(resp.data)
  }

  async getAllCajasByEmpresa(key_empresa: string, fecha_inicio: string, fecha_fin: string) {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja",
      type: "getAllCajasByEmpresa",
      key_empresa: key_empresa,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin,
    })
    return Object.values(resp.data)
  }


  async tipo_pago_getAll() {

    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "tipo_pago",
      type: "getAll",
    })
    return resp.data
  }

  async empresa_tipo_pago_save(tipo_pago: any) {
    tipo_pago.key_empresa = MDL.empresa.select?.key;
    if (tipo_pago.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "caja",
        component: "empresa_tipo_pago",
        type: "editar",
        data: tipo_pago,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "caja",
        component: "empresa_tipo_pago",
        type: "registro",
        data: tipo_pago,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }

  async empresa_tipo_pago_getAll(p?: { key_punto_venta?: string }) {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "empresa_tipo_pago",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
      key_punto_venta: p?.key_punto_venta
    })
    return resp.data
  }

  async empresa_tipo_pago_punto_venta_getAll() {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "empresa_tipo_pago_punto_venta",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    })
    return Object.values(resp.data);
  }

  async empresa_tipo_pago_punto_venta_registro(data: any): Promise<any[]> {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "empresa_tipo_pago_punto_venta",
      type: "registro",
      data: data,
      key_empresa: MDL.empresa.select?.key,
    });
    return resp.data;
  }

  async empresa_tipo_pago_punto_venta_eliminar(data: { key_punto_venta: string, key_empresa_tipo_pago: string }): Promise<any[]> {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "empresa_tipo_pago_punto_venta",
      type: "eliminar",
      data: data,
      key_empresa: MDL.empresa.select?.key,
    });
    return resp.data;
  }

  async traspaso(data: {
    key_empresa_tipo_pago_origen: string,
    key_empresa_tipo_pago_destino: string,
    monto_origen: number,
    monto_destino: number, descripcion: string
  }) {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "caja_detalle",
      type: "traspaso",
      data: data,
      key_empresa: MDL.empresa.select?.key,
    });
    this.dispatchEvent({ type: "onDetalleChange" })
    return resp;
  }

  detalle_types = {
    "apertura": {
      "label": "Apertura",
      "color": "#41C34A"
    },
    "ingreso": {
      "label": "Ingreso",
      "color": "#41C34A"
    },
    "egreso": {
      "label": "Egreso",
      "color": "#E74C3C"
    },
    "venta_rapida": {
      "label": "Venta Rápida",
      "color": "#41C34A"
    },
    "compra_rapida": {
      "label": "Compra Rápida",
      "color": "#9b59b6"
    }
  }



}
