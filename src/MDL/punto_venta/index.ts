import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";

export default class punto_venta extends MDLAbstract<EventListener> {
  async componentDidMount() {}

  //   async saveConteoManualInventario(obj: any) {
  //     if (!obj.key) {
  //       const resp: any = await SSocket.sendPromise({
  //         service: "inventario",
  //         component: "conteo_manual_inventario",
  //         type: "registro",
  //         data: obj.data,
  //         key_almacen: obj.key_almacen,
  //         key_usuario: MDL.usuario.session?.key,
  //       });

  //       this.dispatchEvent({
  //         type: "chavalEventos",
  //       });
  //       return resp.data;
  //     }
  //   }
}
