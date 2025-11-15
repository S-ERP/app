import { EventListener, Caja, CajaDetalle } from "./types";

import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";
import MDL from "..";


export default class pasarela_empresa extends MDLAbstract<EventListener> {

  async componentDidMount() {

  }
  async getAll() {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "pasarela_empresa",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    })
    return Object.values(resp.data)
  }
  async getByKey(key: string) {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "pasarela_empresa",
      type: "getByKey",
      key: key,
      key_empresa: MDL.empresa.select?.key,
    })
    return resp.data
  }
  async registro(data: any) {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "pasarela_empresa",
      type: "registro",
      data: data,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    })
    return resp.data
  }
  async editar(data: any) {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "pasarela_empresa",
      type: "editar",
      data: data,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    })
    return resp.data
  }


}
