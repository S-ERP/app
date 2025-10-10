// @ts-nocheck
import { SStorage, STheme, SThread } from "servisofts-component";
import { SAction } from "servisofts-model";
import Model from "../..";
import Config from "../../../Config";
import DataBase from "../../../DataBase";
import MDL from "../../../MDL";
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
        if (!data) {
            SStorage.removeItem("empresa_select");
        } else {
            SStorage.setItem("empresa_select", JSON.stringify(data));
        }
        DataBase.clear();

        this._getReducer().select = data;
        new SThread(100, "asdasd", true).start(() => {
            STheme.color = {
                ...STheme.color,
                ...Config.theme["dark"],
                ...(data.theme ?? {})
            }
            STheme.repaint();

            try {
                MDL.empresa.setEmpresa(data);
                MDL.caja.setActiva(null);
                MDL.caja.componentDidMount();
                Model._events.CLEAR();
            } catch (error) {
                console.error(error)
            }
        })
    }
}