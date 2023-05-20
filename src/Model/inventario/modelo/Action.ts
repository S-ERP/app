import { SAction } from "servisofts-model";
import Model from "../..";
export default class Action extends SAction {
    getAllRecursive() {
        let marcas = Model.marca.Action.getAll();
        let tipo_producto = Model.tipo_producto.Action.getAll();
        let data = this.getAll();
        if (!marcas || !data || !tipo_producto) return null;
        Object.values(data).map((obj: any) => {
            obj.marca = marcas[obj.key_marca];
            obj.tipo_producto = tipo_producto[obj.key_tipo_producto];
        })
        return data;
    }
}   