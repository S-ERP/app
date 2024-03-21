// @ts-nocheck
import { SAction } from "servisofts-model";
import Model from "../..";
import SSocket from "servisofts-socket";
export default class Action extends SAction {
    getAll() {
        var empresa: any = Model.empresa.Action.getSelect();
        if (!empresa) return null;
        return this.getAllByKeyEmpresa(empresa.key)
    }
    getAllByKeyEmpresa(key_empresa) {
        // var empresa: any = Model.empresa.Action.getSelect();
        // if (!empresa) return null;
        var reducer = this._getReducer();
        if (reducer.key_empresa != key_empresa) {
            reducer.data = "";
            reducer.key_empresa = key_empresa;
        }

        var resp = super.getAll({
            key_empresa: key_empresa,
            key_usuario: Model.usuario.Action.getKey()
        })
        return resp;
    }
    quitarUsuario({ key_nota, key_usuario_nota }) {
        return new Promise((resolve, reject) => {
            SSocket.sendPromise({
                component: "nota",
                type: "quitarUsuario",
                key_nota: key_nota,
                key_usuario_nota: key_usuario_nota
            }).then((e:any) => {
                delete this._getReducer().data[e.key_nota];
                this._dispatch(e);
                resolve(e);
            }).catch(e => {
                reject(e);
            })
        })

    }
}