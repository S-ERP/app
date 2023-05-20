import { SAction } from "servisofts-model";
import Model from "../..";
export default class Action extends SAction {
    getAll({ key_punto_venta }) {
        var reducer = this._getReducer();
        if (reducer.key_punto_venta != key_punto_venta) {
            reducer.data = null;
            reducer.key_punto_venta = key_punto_venta;
        }
        return super.getAll({
            key_punto_venta: key_punto_venta
        })
    }
}   