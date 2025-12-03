
import MDLAbstract from "../MDLAbstract";
import SSocket from "servisofts-socket";
import MDL from "..";
import { SDate } from "servisofts-component";
export default class caja extends MDLAbstract<any> {



  async componentDidMount() {

  }

  
  async getAll() {

    const resp: any = await SSocket.sendPromise({
      component: "habilidad",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    })
    return Object.values(resp.data)
  }

  async registro(){
    const resp: any = await SSocket.sendPromise({
      component: "habilidad",
      type: "registro",
      key_empresa: MDL.empresa.select?.key,
    })
    return resp.data
  }

}
