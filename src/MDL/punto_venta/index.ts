import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";

export default class punto_venta extends MDLAbstract<EventListener> {
  async componentDidMount() { }

  async save(punto_venta: any) {
    if (punto_venta.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "empresa",
        component: "punto_venta",
        type: "editar",
        data: punto_venta,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "empresa",
        component: "punto_venta",
        type: "registro",
        data: punto_venta,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }
}
