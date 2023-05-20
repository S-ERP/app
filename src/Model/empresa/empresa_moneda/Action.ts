import { SAction } from "servisofts-model";
// import Model from "../..";
export default class Action extends SAction {
    getAll({ key_empresa }) {
        var reducer = this._getReducer();
        if (reducer.key_empresa != key_empresa) {
            reducer.data = null;
            reducer.key_empresa = key_empresa;
        }
        return super.getAll({
            key_empresa: key_empresa
        })
    }

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