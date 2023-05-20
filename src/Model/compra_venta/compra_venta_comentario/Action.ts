import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from 'servisofts-socket';

export default class Action extends SAction {

    getAll({ key_compra_venta }) {
        var reducer = this._getReducer();
        if (reducer.key_compra_venta != key_compra_venta) {
            reducer.data = null;
            reducer.key_compra_venta = key_compra_venta;
        }
        return super.getAll({
            key_compra_venta: key_compra_venta
        })
    }
}   