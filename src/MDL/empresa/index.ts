import SSocket from "servisofts-socket";
import Model from "../../Model";
import { Empresa, EventListener, Sucursal, TurnoHorarioAtencion } from "./type";
import { SStorage, STheme, SThread } from "servisofts-component";
import { Platform } from "react-native";
import packageInfo from "../../../package.json";
import MDLAbstract from "../MDLAbstract";
import MDL from "..";

export default class empresa extends MDLAbstract<EventListener> {
  select: Empresa | undefined;

  constructor() {
    super();
    this.loadEmpresaFromStorage();
  }

  async componentDidMount() {
    await this.init()
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
        ...STheme.defaultColors,
        ...empresa.theme,
      };
      // STheme.repaint();
    }
    if (MDL?.caja) {
      MDL.caja.getActiva();
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

  __tipo_pago: any = null;
  async getTipoPago(): Promise<Sucursal[]> {
    if (this.__tipo_pago) return this.__tipo_pago;
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "tipo_pago",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
    });
    this.__tipo_pago = resp.data;
    return this.__tipo_pago;
  }
  async getByKeyFull(): Promise<any> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKeyFull",
      key: MDL.empresa.select?.key,
    });
    return resp.data;
  }

  _full: any = null;
  async getFull(): Promise<any> {
    if (this._full) {
      if (this._full.key === this.select?.key) return this._full;
    }
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKeyFull",
      key: this.select?.key,
    });
    this._full = resp.data;
    return resp.data;
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


  // const moneda_ = {
  //                                           ...e.row,
  //                                           estado: 0,
  //                                       }
  //                                       SSocket.sendPromise({
  //                                           service: "empresa",
  //                                           component: "empresa_moneda", // 🔥 corregido
  //                                           type: "editar",
  //                                           data: moneda_,
  //                                           key_usuario: MDL.usuario.session?.key,
  //                                       }).then(() => {
  //                                           this.table.loadData();
  //                                           this.forceUpdate();
  //                                       }).catch(err => {
  //                                           console.error("response", err);
  //                                       })



  async getMonedas(): Promise<any> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKeyFull",
      key: MDL.empresa.select?.key,
    });
    return resp.data.monedas;
  }

  async registrarMoneda(data: any) {
    data.key_usuario = MDL.usuario.session?.key;
    data.key_empresa = MDL.empresa.select?.key;

    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_moneda",
      type: "registro",
      key_turno: MDL.usuario.session?.key,
      data: data,
    });
    console.log("jajajsssssss ", resp.data);
    return resp;
  }

  async editarMoneda(data: any) {
    data.key_usuario = MDL.usuario.session?.key;
    data.key_empresa = MDL.empresa.select?.key;

    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_moneda",
      type: "editar",
      key_turno: MDL.usuario.session?.key,
      data: data,
    });
    console.log("jajajsssssss ", resp.data);
    return resp.data;
  }

  async getHistorialMoneda(key: any) {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "empresa_moneda",
      type: "getByKeyHistorialMoneda",
      key: key,

    });
    console.log("jajajsssssss ", resp.data);
    return resp.data;
  }


  // async getEmpresa(key: string) {
  //   const resp: any = await SSocket.sendPromise({
  //     service: "empresa",
  //     component: "empresa",
  //     type: "getByKey",
  //     key: key,
  //   });
  //   return resp.data as Empresa;
  // }





}
