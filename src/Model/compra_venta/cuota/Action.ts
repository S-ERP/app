// @ts-nocheck
import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket'
export default class Action extends SAction {

    getAll(extra?: {}) {
        return super.getAll({
            ...extra,
            key_empresa: Model.empresa.Action.getSelect()?.key,
        })
    }
    getAllByKeyCompraVenta({ key_compra_venta }) {
        var reducer = this._getReducer();
        if (reducer.key_compra_venta != key_compra_venta) {
            reducer.data = null;
        }
        reducer.key_compra_venta = key_compra_venta;
        return super.getAll({ key_compra_venta });
    }
    async registroAll(extra = {}) {
        return new Promise((resolve, reject) => {
            var reducer = this._getReducer();
            const petition = {
                ...this.model.info,
                type: "registroAll",
                estado: "cargando",
                ...extra
            }
            SSocket.sendPromise(petition).then((resp) => {
                this._dispatch(resp);
                this._dispatch({
                    component: "compra_venta",
                    type: "change_plan_pago",
                    data: resp
                });

                resolve(resp);
            }).catch(e => {
                reject(e);
            });
        });
    }
    async getPendientes(extra = {}) {
        return new Promise((resolve, reject) => {
            var reducer = this._getReducer();
            const petition = {
                ...this.model.info,
                key_empresa: Model.empresa.Action.getSelect()?.key,
                type: "getPendientes",
                estado: "cargando",
                ...extra
            }
            SSocket.sendPromise(petition).then((resp) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            });
        });
    }
    async getAllByK(extra: { key_cliente?: any, key_proveedor?: any }) {
        return new Promise((resolve, reject) => {
            var reducer = this._getReducer();
            const petition = {
                ...this.model.info,
                type: "getAll",
                estado: "cargando",
                key_empresa: Model.empresa.Action.getSelect()?.key,
                ...extra
            }
            SSocket.sendPromise(petition).then((resp) => {
                resolve(resp);
            }).catch(e => {
                reject(e);
            });
        });
    }

}   