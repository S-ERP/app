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
    // if (MDL?.caja) {
    //   try {
    //     MDL.caja.getActiva();
    //   } catch (error) {
    //     console.error(error);
    //   }
    // }
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
      key_empresa: MDL.empresa.select?.key,
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
      key_empresa: MDL.empresa.select?.key,
    });
    this.__tipo_pago = resp.data;
    return this.__tipo_pago;
  }

  async getAllPuntoVentaTipoPago(): Promise<Sucursal[]> {
    const resp: any = await SSocket.sendPromise({
      service: "empresa",
      component: "punto_venta_tipo_pago",
      type: "getAll",
      key_empresa: MDL.empresa.select?.key,
    });
    return resp.data;
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

  _getFullCache: any = {
    data: null,
    key_empresa: "",
    promise: null
  }
  _full: any = null;
  async getFull(): Promise<any> {
    if (this._getFullCache.key_empresa != this.select?.key) {
      this._getFullCache.data = null;
      this._getFullCache.promise = null;
      this._getFullCache.key_empresa = this.select?.key;
    }
    if (this._getFullCache.data) return this._getFullCache.data;
    if (this._getFullCache.promise) return this._getFullCache.promise;
    // if (this._full) {
    //   if (this._full.key === this.select?.key) return this._full;
    // }
    this._getFullCache.promise = SSocket.sendPromise({
      service: "empresa",
      component: "empresa",
      type: "getByKeyFull",
      key: this.select?.key,
    }).then(e => {
      this._getFullCache.data = e.data;  // Guardamos en caché
      this._getFullCache.promise = null;     // Limpiamos la promesa en curso
      return this._getFullCache.data;
    }).catch(e => {
      this._getFullCache.promise = null;     // Limpiar para futuros intentos
      throw e;
    })
    return this._getFullCache.promise;

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


  async saveTipoPago(tipo_pago: any) {
    tipo_pago.key_empresa = MDL.empresa.select?.key;
    if (tipo_pago.key) {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "empresa",
        component: "punto_venta_tipo_pago",
        type: "editar",
        data: tipo_pago,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    } else {
      const resp: any = await SSocket.sendPromise({
        version: "1.0",
        service: "empresa",
        component: "punto_venta_tipo_pago",
        type: "registro",
        data: tipo_pago,
        key_empresa: MDL.empresa.select?.key,
        key_usuario: MDL.usuario.session?.key,
      });
      return resp.data;
    }
  }


}
