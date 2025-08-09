import SSocket from "servisofts-socket";
import { SStorage, STheme } from "servisofts-component";
import MDLAbstract from "../MDLAbstract";
import { Sucursal, EventListener } from "./type";
// import { Empresa, EventListener, Sucursal, TurnoHorarioAtencion } from "./type";

export default class sucursal extends MDLAbstract<EventListener> {

  select: Sucursal | undefined;

  constructor() {
    super();
    this.loadSucursalFromStorage();
  }

  loadSucursalFromStorage() {
    SStorage.getItem("sucursal_select", (item: any) => {
      if (!item) return;
      this.setSucursal(JSON.parse(item));
    });
  }

  setSucursal(sucursal: Sucursal) {
    this.select = sucursal;
    SStorage.setItem("sucursal_select", JSON.stringify(sucursal));
    this.dispatchEvent({ type: "onChangeSucursalSelect", data: sucursal });
  }

  async getSucursal(key: string): Promise<Sucursal> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "sucursal",
      type: "getByKey",
      key: key,
    });
    return resp.data as Sucursal;
  }

  // Opcional: para eliminar sucursal seleccionada del storage y estado
  clearSucursal() {
    this.select = undefined;
    SStorage.removeItem("sucursal_select");
    this.dispatchEvent({ type: "onChangeSucursalSelect", data: null });
  }
}
