import SSocket from "servisofts-socket";
import Model from "../../Model";
import MDL from "..";

export default class asistencia {
  async componentDidMount() { }

  async getAll() {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "asistencia",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    });
    // console.clear();
    console.log("%c" + JSON.stringify(resp.data),`color: #0c30ff; font-weight: bold;`);
    return Object.values(resp.data || {});
    // return resp.data;
    // return JSON.stringify(resp.data);
  }


  async getByKey(key_: string) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "asistencia",
      type: "getByKey",
      key: key_,
      key_empresa: Model.empresa.Action.getKey(),
    });
    return resp.data;
  }

  async editar(data: any) {
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "asistencia",
      type: "editar",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }

  async registrar(data: any) {
    data.key_empresa = MDL.empresa.select?.key;
    const resp: any = await SSocket.sendPromise({
      service: "inventario",
      component: "asistencia",
      type: "registro",
      data: data,
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp.data;
  }
}