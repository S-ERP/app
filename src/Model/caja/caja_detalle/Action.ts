import { SAction } from "servisofts-model";
import Model from "../..";

export default class Action extends SAction {
    getAll({ key_caja }) {
        var reducer = this._getReducer();
        if (reducer.key_caja != key_caja) {
            reducer.data = null;
            reducer.key_caja = key_caja;
        }
        return super.getAll({
            key_caja: key_caja
        })
    }
    getMontoEnCaja({ key_caja }) {
        var caja_detales = this.getAll({ key_caja: key_caja });
        if (!caja_detales) return null;
        var monto_actual = 0;
        Object.values(caja_detales).map((obj: any) => {
            monto_actual += parseFloat(obj.monto);
        })
        return monto_actual;
    }

}   