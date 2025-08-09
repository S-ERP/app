import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";
import cuenta_contable from "./cuenta_contable";

export default class contabilidad extends MDLAbstract<EventListener> {
  color_tipo = {
    "ACTIVO": "#4CAF50",
    "PASIVO": "#FF9800",
    "PATRIMONIO": "#2196F3",
    "INGRESO": "#9C27B0",
    "GASTO": "#F44336"
  }
  cuenta_contable = new cuenta_contable();
  async componentDidMount() {
    this.cuenta_contable.componentDidMount();
  }
  async saveAjusteEmpresa(ajuste: any) {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "ajuste_empresa",
      type: ajuste.key ? "editar" : "registro",
      data: ajuste,
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async getAjustes() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "ajuste",
      type: "getAllByEmpresa",
      key_empresa: MDL.empresa.select?.key,
      key_usuario: MDL.usuario.session?.key,
    });
    return resp.data;
  }
  async getCuentas() {
    const resp: any = await SSocket.sendPromise({
      version: "1.0",
      service: "contabilidad",
      component: "cuenta_contable",
      type: "getAll",
      eliminado: false,
      key_empresa: MDL.empresa?.select?.key,
      key_usuario: MDL.usuario?.session?.key,
    });
    return resp.data;
  }

  agruparCuentas(cuentas: any) {
    const mapa: any = {};
    const raiz: any[] = [];

    // Primero, crea un mapa con todos los códigos
    cuentas.forEach((cuenta: any) => {
      cuenta.hijos = [];
      mapa[cuenta.codigo] = cuenta;
    });

    // Ahora, asigna cada cuenta a su padre si existe
    cuentas.forEach((cuenta: any) => {
      const partes = cuenta.codigo.split(".");
      if (partes.length === 1) {
        raiz.push(cuenta); // Es un nodo raíz
      } else {
        const padreCodigo = partes.slice(0, -1).join(".");
        const padre = mapa[padreCodigo];
        if (padre) {
          padre.hijos.push(cuenta);
        } else {
          raiz.push(cuenta); // Si no se encuentra el padre, lo dejamos en la raíz
        }
      }
    });

    return raiz;
  }


  async getNivelesPlanCuentas() {
    return await this.executeFunction("get_niveles_del_plan_de_cuentas", [MDL?.empresa?.select?.key])
  }
  async reporte_balance_general() {
    return await this.executeFunction("reporte_balance_general", [MDL?.empresa?.select?.key])
  }

  async executeFunction(name: string, params?: any[]) {
    const resp: any = await SSocket.sendPromise({
      service: "contabilidad",
      component: "reporte",
      type: "execute_function",
      func: name,
      params: params?.map((param) => {
        if (typeof param === "string") {
          return "'" + param + "'";
        }
        return param;
      })
    })
    return resp.data as any[];
  }
  async getEnviroment() {
    const resp: any = await SSocket.sendPromise({
      service: "contabilidad",
      component: "enviroment",
      type: "getAll",
      key_empresa: MDL.empresa?.select?.key,
    });
    const agrup: any = {}
    const data = resp.data;
    Object.values(data).map((a: any) => {
      agrup[a.descripcion] = a;
    })
    return agrup
  }
}
