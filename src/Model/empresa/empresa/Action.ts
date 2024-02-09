import { SStorage } from "servisofts-component";
import { SAction } from "servisofts-model";
import Model from "../..";
export default class Action extends SAction {

    getSelect() {
        // var data = super.getAll();
        // if (!data) return null;
        // if (Object.values(data).length > 0) {
        //     return Object.values(data)[0];
        // }

        return this._getReducer().select;
    }
    setEmpresa(data) {
        SStorage.setItem("empresa_select", JSON.stringify(data));
        Model._events.CLEAR();
    }
}