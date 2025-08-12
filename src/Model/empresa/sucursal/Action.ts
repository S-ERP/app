// @ts-nocheck
import { SAction } from "servisofts-model";
import Model from "../..";
export default class Action extends SAction {
  getAll() {
    var empresa: any = Model.empresa.Action.getSelect();
    if (!empresa) return null;
    return this.getAllByKeyEmpresa(empresa.key);
  }

  getSelect() {
    return this._getReducer().select;
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
      key_usuario: Model.usuario.Action.getKey(),
    });
    return resp;
  }


  getByKey({ key }) {
    var reducer = this._getReducer();

    // Si ya tenemos el dato en el reducer, retornamos directo (optimización)
    if (reducer.data && reducer.data[key]) {
      return reducer.data[key];
    }

    // Sino, hacemos la consulta por clave
    var resp = super.getByKey({
      key: key,
      key_usuario: Model.usuario.Action.getKey(),
    });

    return resp;
  }

}