// @ts-nocheck
import { SStorage, STheme, SThread } from "servisofts-component";
import { SAction } from "servisofts-model";
import Model from "../..";
import Config from "../../../Config";
import DataBase from "../../../DataBase";
import MDL from "../../../MDL";
import SSocket from "servisofts-socket";
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

    async changeEmpresaByKey(key_empresa) {
        const resp = await SSocket.sendPromise({

            service: "empresa",
            component: "empresa_usuario",
            type: "getAll",
            // key_empresa: MDL.empresa.select.key,
            key_usuario: MDL.usuario.session.key
        })
        const empresa_usuario = Object.values(resp.data).find(e => e?.key_empresa == key_empresa);
        console.log("esta es la empresa", empresa_usuario)
        this.setEmpresa(empresa_usuario?.empresa);
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