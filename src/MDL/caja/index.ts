import { EventListener, Caja } from "./types";

import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";
import MDL from "..";

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
}
