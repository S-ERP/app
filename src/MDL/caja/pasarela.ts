import { EventListener, Caja, CajaDetalle } from "./types";

import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";
import MDL from "..";


export default class pasarela extends MDLAbstract<EventListener> {

  async componentDidMount() {
   
  }
  async getAll() {
    const resp: any = await SSocket.sendPromise({
      service: "caja",
      component: "pasarela",
      type: "getAll"
    })
    return Object.values(resp.data)
  }


}
