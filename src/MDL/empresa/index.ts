import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Empresa, EventListener, Sucursal, TurnoHorarioAtencion } from "./type";
import { SStorage, STheme, SThread } from "servisofts-component";
import { Platform } from "react-native";
import packageInfo from "../../../package.json";
import MDLAbstract from "../MDLAbstract";

export default class empresa extends MDLAbstract<EventListener> {
  select: Empresa | undefined;

  constructor() {
    super();
    this.loadEmpresaFromStorage();
  }

  loadEmpresaFromStorage() {
    SStorage.getItem("empresa_select", (imt: any) => {
      console.log("Cargando la empresa");
      if (!imt) return;
      this.setEmpresa(JSON.parse(imt));
    });
  }

  loadTheme() {
    if (this.select && this.select.theme) {
      STheme.color = {
        ...STheme.color,
        ...this.select.theme,
      };
      STheme.repaint();
    }
  }
  async init() {
    this.loadTheme();
    if (this.select) {
      this.select = await this.getEmpresa(this.select.key);
      this.setEmpresa(this.select);
    }
  }
  setEmpresa(empresa: Empresa) {
    this.select = empresa;
    SStorage.setItem("empresa_select", JSON.stringify(empresa));
    if (empresa.theme) {
      STheme.color = {
        ...STheme.color,
        ...empresa.theme,
      };
      // STheme.repaint();
    }
    this.dispatchEvent({ type: "onChangeEmpresaSelect", data: empresa });
  }

  async getEmpresa(key: string) {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKey",
      key: key,
    });
    return resp.data as Empresa;
  }

  async getAllSucursales(): Promise<Sucursal[]> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "sucursal",
      type: "getByKeyEmpresa",
      key_empresa: Model.empresa.Action.getKey(),
    });
    return Object.values(resp.data);
  }

  setUsuarioLog(data: {
    url: string;
    platform?: string;
    version_app?: string;
    params?: any;
  }) {
    if (!Model.empresa.Action.getKey() || !Model.usuario.Action.getUsuarioLog())
      return;
    data.platform = Platform.OS;
    data.version_app = packageInfo.version;
    SSocket.sendPromise({
      service: "empresa",
      component: "empresa_usuario_log",
      type: "registro",
      key_empresa: Model.empresa.Action.getKey(),
      key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
      data: data,
    })
      .then((e) => {
        // this.setState({ dataLog: e.data })
      })
      .catch((e) => {
        console.error(e);
      });
  }
  async ordenarPaginas(urls: string[], order: "vicita" | "fecha" = "vicita") {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_usuario_log",
      type: "ordenar_paginas",
      order: "vicita",
      key_empresa: Model.empresa.Action.getKey(),
      key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
      data: urls,
    });
    return resp.data as any[];
  }

  async getAllTurno() {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "turno",
      type: "getAll",
    });
    return resp.data as Empresa;
  }

  async getAllHorario() {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "getAll",
    });
    return resp.data as Empresa;
  }

  async getTurnosHorariosAtencion() {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_get_turno_horarios_atencion",
      key_empresa: Model.empresa.Action.getKey(),
    });
    return resp.data as any[];
  }

  async registroTurnosHorariosAtencion(data: TurnoHorarioAtencion) {
    data.key_usuario = Model.usuario.Action.getKey();
    data.key_empresa = Model.empresa.Action.getKey();
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_registroTurnosHorariosAtencion",
      data: data,
    });
    return resp.data;
  }

  async editarTurnosHorariosAtencion(data: TurnoHorarioAtencion) {
    data.key_usuario = Model.usuario.Action.getKey();
    data.key_empresa = Model.empresa.Action.getKey();

    // data.horarios.forEach((h) => (h.dia = "8"));

    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_editarTurnosHorariosAtencion",
      data: data,
    });
    return resp.data;
  }

  async getByyKeyTurnosHorariosAtencion(parametro: any) {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "horario_atencion",
      type: "_getByKeyTurnosHorariosAtencion",
      key_turno: parametro,
    });
    console.log("jajaj ", resp.data);
    return resp.data;
  }
}
