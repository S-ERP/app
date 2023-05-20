import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket'
export default class Action extends SAction {
    getAllByKeyAlmacen(key_almacen) {
        var reducer = this._getReducer();
        if (reducer.key_almacen != key_almacen) {
            reducer.data = null;
        }
        reducer.key_almacen = key_almacen
        return super.getAll({
            key_almacen: key_almacen,
        })
    }
    getAllByKeyProducto({key_producto}) {
        var reducer = this._getReducer();
        if (reducer.key_producto != key_producto) {
            reducer.data = null;
        }
        reducer.key_producto = key_producto
        return super.getAllBy({
            key_producto: key_producto,
        })
    }
    traspaso(extra: {}) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                ...this.model.info,
                type: "traspaso",
                estado: "cargando",
                ...extra

            }).then((resp) => {
                this._dispatch(resp);
                resolve(resp);
            }).catch(e => {
                reject(e)
            })

        })
    }

    getHistorico({ key_producto }) {
        var reducer = this._getReducer();
        if (reducer.key_producto != key_producto) {
            reducer.data_history = null;
        }
        reducer.key_producto = key_producto;
        const data_history = reducer?.data_history;
        if (!data_history) {
            if (reducer.estado == "cargando") return null;
            const petition = {
                ...this.model.info,
                type: "getHistorico",
                estado: "cargando",
                key_producto: key_producto,
            }
            SSocket.send(petition);
            return null;
        }
        return data_history;
    }
}   