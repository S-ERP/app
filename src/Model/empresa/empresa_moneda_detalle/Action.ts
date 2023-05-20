import { SAction } from "servisofts-model";
import Model from "../..";
export default class Action extends SAction {
    getAll({ key_empresa_moneda }) {
        var reducer = this._getReducer();
        if (reducer.key_empresa_moneda != key_empresa_moneda) {
            reducer.data = null;
            reducer.key_empresa_moneda = key_empresa_moneda;
        }
        return super.getAll({
            key_empresa_moneda: key_empresa_moneda
        })
    }
    getAllByEmpresa({ key_empresa }) {
        var reducer = this._getReducer();
        if (reducer.key_empresa != key_empresa) {
            reducer.data = null;
            reducer.key_empresa = key_empresa;
        }
        return super.getAll({
            key_empresa: key_empresa
        })
    }
    // getAll() {
    //     var empresa: any = Model.empresa.Action.getSelect();
    //     if (!empresa) return null;
    //     return this.getAllByKeyEmpresa(empresa.key)
    // }

    // getAllByKeyEmpresa(key_empresa) {
    //     var reducer = this._getReducer();
    //     if (reducer.key_empresa != key_empresa) {
    //         reducer.data = "";
    //         reducer.key_empresa = key_empresa;
    //     }

    //     var resp = super.getAll({
    //         key_empresa: key_empresa,
    //         key_usuario: Model.usuario.Action.getKey()
    //     })
    //     return resp;
    // }
}   