import { STheme } from "servisofts-component";
import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket'
import { compra_venta_state } from "./index"
export default class Action extends SAction {

    registro(extra?: {}): Promise<unknown> {
        return super.registro({
            ...extra,
            key_usuario: Model.usuario.Action.getKey(),
        })
    }

    aprobar({ key_compra_venta }): Promise<unknown> {
        return super.editar({
            data: {
                key: key_compra_venta,
                state: "aprobado"
            },
            key_usuario: Model.usuario.Action.getKey(),
        })
    }
    changeState(obj: { data: any, state: compra_venta_state }): Promise<unknown> {
        return super.editar({
            data: {
                ...obj.data,
                state: obj.state
            },
            key_usuario: Model.usuario.Action.getKey(),
        })
    }


    getStateInfo(key) {
        var statesi = {
            "cotizacion": { color: STheme.color.lightGray, label: "Cotizacion" },
            "aprobado": { color: STheme.color.warning, label: "Aprobado" },
            "denegado": { color: STheme.color.danger, label: "Denegado" },
            "comprado": { color: STheme.color.success, label: "Comprado" },
            "vendido": { color: STheme.color.success, label: "Vendido" },
        }
        if (!key) return statesi;
        return statesi[key];

    }
    getAll(extra) {
        if (!Model.usuario.Action.getKey()) return null;
        return super.getAll({
            key_usuario: Model.usuario.Action.getKey()
        })
    }
    pdf({ key_compra_venta }): Promise<unknown> {
        return SSocket.sendPromise({
            ...this.model.info,
            type: "pdf",
            key_compra_venta: key_compra_venta,
            key_usuario: Model.usuario.Action.getKey()
        })
    }
    getClientes() {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "getClientes",
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            })
        })
    }
    getDeudaProveedores() {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "getDeudaProveedores",
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            })
        })
    }
    getClientesDeudores() {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "getClientesDeudores",
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            })
        })
    }
    getByKeyCliente(key_cliente) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "getByKeyCliente",
                key_cliente: key_cliente,
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            })
        })
    }
    getStates(key_sucursal, fecha_inicio, fecha_fin) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "getStates",
                key_sucursal: key_sucursal,
                fecha_inicio: fecha_inicio,
                fecha_fin: fecha_fin,
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp: any) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            })
        })
    }
}   