import SSocket from "servisofts-socket";
import { Proyecto } from "./type";
import Model from "../../Model";
import MDL from "..";

export default class reporte {
  async _get_confirmados() {
    const resp: any = await SSocket.sendPromise({
      service: "crm",
      component: "reporte",
      type: "_get_confirmados",
      key_empresa: Model.empresa.Action.getKey(),
    });
    return Object.values(resp.data);
  }

  async _get_confirmados_ranking(aaaa: String, bbbb: String) {
    const resp: any = await SSocket.sendPromise({
      service: "crm",
      component: "reporte",
      type: "_get_confirmados_ranking",
      key_empresa: Model.empresa.Action.getKey(),
      fecha_inicio: aaaa,
      fecha_fin: bbbb,
    });
    return resp.data;
  }
}
