// @ts-nocheck
import { SStorage, STheme, SThread } from "servisofts-component";
import { SAction } from "servisofts-model";
import Model from "../..";
import Config from "../../../Config";
export default class Action extends SAction {

    getSelect() {
        // var data = super.getAll();
        // if (!data) return null;
        // if (Object.values(data).length > 0) {
        //     return Object.values(data)[0];
        // }

        return this._getReducer().select;
    }
    getKey() {
        return this._getReducer().select?.key;
    }
    setEmpresa(data) {
        SStorage.setItem("empresa_select", JSON.stringify(data));
        Model._events.CLEAR();
        new SThread(100, "asdasd", true).start(() => {
            STheme.color = {
                ...STheme.color,
                ...Config.theme["dark"],
                ...(data.theme ?? {})
            }
            STheme.repaint();
        })
    }
}