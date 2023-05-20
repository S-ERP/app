import { SAction } from "servisofts-model";
import Model from "../..";
export default class Action extends SAction {
    // getAll() {
    //     var empresa: any = Model.empresa.Action.getSelect();
    //     if (!empresa) return null;
    //     return super.getAll({
    //         key_empresa: empresa.key,
    //         key_usuario: Model.usuario.Action.getKey()
    //     })
    // }

    getAllByKeyProducto(key_producto) {
        var producto = Model.producto.Action.getByKey(key_producto, {}, null);
        if (!producto) return null;
        var modelo = Model.modelo.Action.getByKey(producto.key_modelo, {}, null)
        if (!modelo) return null;
        return this.getAllByKeyTipoProducto(modelo.key_tipo_producto)
    }
    getAllByKeyTipoProducto(key_tipo_producto) {
        var datos = Model.inventario_dato.Action.getAll();
        if (!datos) return null;
        var resp = {};
        var dato_tp = Model.tipo_producto_inventario_dato.Action.getAllBy({
            key_tipo_producto: key_tipo_producto
        });
        if (!dato_tp) return null;
        Object.values(dato_tp).map((dr: any) => {
            var dato = datos[dr.key_inventario_dato]
            if (!dato) return;
            dato.tpid=dr;
            resp[dato.key] = dato;
        })
        return resp;
    }
    getTiposDato() {
        return [
            { key: "", content: "--" },
            { key: "text", content: "Texto" },
            { key: "number", content: "Numero" },
            { key: "money", content: "Moneda" },
            { key: "date", content: "Fecha" },
            // { key: "image", content: "Imagen" },
            { key: "file", content: "Archivo" },
            { key: "files", content: "Multiples Archivo" },
            { key: "checkBox", content: "ON/OFF" },
            { key: "link", content: "Link" },
        ]
    }
}   