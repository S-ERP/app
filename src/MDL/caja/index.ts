import { EventListener, Caja } from "./types";

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
      throw "Se requiere key_usuario y key_empresa"
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
}
