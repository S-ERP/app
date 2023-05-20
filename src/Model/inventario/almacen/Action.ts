import { SAction } from "servisofts-model";
import Model from "../..";
export default class Action extends SAction {
    getAll() {
        var sucursales: any = Model.sucursal.Action.getAll();
        var data = super.getAll({
            // key_empresa: empresa.key,
            key_usuario: Model.usuario.Action.getKey()
        })
        if (!sucursales) return null;
        if (!data) return null;
        var objFinal = {};
        Object.values(data).map((obj: any) => {
            const suc = sucursales[obj.key_sucursal];
            if (!suc) return;
            if (!suc.estado) return;
            objFinal[obj.key] = obj;
        })

        return objFinal;
    }
}   