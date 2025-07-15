import SSocket from "servisofts-socket";
import MDLAbstract from "../MDLAbstract";
import { EventListener } from "./types";
import MDL from "..";
import cuenta_contable from "./cuenta_contable";

export default class contabilidad extends MDLAbstract<EventListener> {

    cuenta_contable = new cuenta_contable();
    async componentDidMount() {
        this.cuenta_contable.componentDidMount();
    }

    async saveAjusteEmpresa(ajuste: any) {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "contabilidad",
            "component": "ajuste_empresa",
            "type": ajuste.key ? "editar" : "registro",
            data: ajuste,
            "key_empresa": MDL.empresa.select?.key,
            "key_usuario": MDL.usuario.session?.key
        });
        return resp.data
    }
    async getAjustes() {

        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "contabilidad",
            "component": "ajuste",
            "type": "getAllByEmpresa",
            "key_empresa": MDL.empresa.select?.key,
            "key_usuario": MDL.usuario.session?.key
        });
        return resp.data
    }
    async getCuentas() {
        const resp: any = await SSocket.sendPromise({
            "version": "1.0",
            "service": "contabilidad",
            "component": "cuenta_contable",
            "type": "getAll",
            "eliminado": false,
            "key_empresa": MDL.empresa?.select?.key,
            "key_usuario": MDL.usuario?.session?.key
        })
        return resp.data
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
            const partes = cuenta.codigo.split('.');
            if (partes.length === 1) {
                raiz.push(cuenta); // Es un nodo raíz
            } else {
                const padreCodigo = partes.slice(0, -1).join('.');
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
}