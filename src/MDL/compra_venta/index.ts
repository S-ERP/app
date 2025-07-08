import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
// import MDL from "..";
import Model from "../../Model";

export default class compra_venta extends MDLAbstract<EventListener> {
  async componentDidMount() {}

  async getAllProveedor() {
    const resp: any = await SSocket.sendPromise({
      service: "compra_venta",
      component: "proveedor",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    });

    console.log("todo " + JSON.stringify(resp.data));

    return Object.values(resp.data || {});
    // return resp.data ;
    // return JSON.stringify(resp.data);
  }


    // tengo que hacer el getByKey
    // luego el register

    // tengo que traer lo de empresa, trabajo
    // async

}
