import { EventListener, Pizarra } from "./types";

import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";
import MDL from "..";


export default class pizarra extends MDLAbstract<EventListener> {


  async componentDidMount() {

  }

  async save(data: Pizarra) {
    const resp = await SSocket.sendPromise({
      component: "pizarra",
      type: "save",
      key_usuario: MDL.usuario.session?.key,
      key_empresa: MDL.empresa.select?.key,
      data
    })
    return resp;
  }

  historico_cambios: { [key: string]: any[] } = {

  }
  popLastChange(instance_id: string) {
    const lastChage = this.historico_cambios[instance_id][this.historico_cambios[instance_id].length - 1];
    this.historico_cambios[instance_id].pop();
    console.log(this.historico_cambios[instance_id])
    return lastChage;
  }
  async saveLastChange(data: any) {
    if (!this.historico_cambios[data.id]) {
      this.historico_cambios[data.id] = []
    }
    this.historico_cambios[data.id].push(data);
    console.log(this.historico_cambios[data.id])
  }
  async saveNodo(data: any, instance_id: string) {


    const resp = await SSocket.sendPromise({
      component: "pizarra",
      type: "saveNodo",
      key_usuario: MDL.usuario.session?.key,
      key_empresa: MDL.empresa.select?.key,
      instance_id,
      data
    })
    return resp;
  }
  async get(id: string) {
    const resp: any = await SSocket.sendPromise({
      component: "pizarra",
      type: "get",
      key_usuario: MDL.usuario.session?.key,
      key_empresa: MDL.empresa.select?.key,
      id_pizarra: id
    })
    return resp.data;
  }
  async pizarra_usuario_save(p: { id_pizarra: string, data?: any }) {
    const resp: any = await SSocket.sendPromise({
      component: "pizarra",
      type: "save_pizarra_usuario",
      key_usuario: MDL.usuario.session?.key,
      key_empresa: MDL.empresa.select?.key,
      data: p
    })
    return resp.data;
  }

}
