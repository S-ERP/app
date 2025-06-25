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

  async registrar(data: reporte) {
    data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({
      service: "crm",
      component: "proyecto",
      type: "registro",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }
}
