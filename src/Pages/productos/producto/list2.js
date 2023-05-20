import { SText, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import item from './item';
class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Lista de productos",
            item: item,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio", "key_modelo"]
        });
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $filter(data) {
        return data.estado != 0
    }

    // $item(props) {
    //     return super.$item(props, {
    //         header: (itm) => {
    //             var modelo = this.modelos[itm.data.key_modelo] ?? {};
    //             var marca = this.marcas[modelo?.key_marca] ?? {};
    //             var tipo_producto = this.tipo_productos[modelo?.key_tipo_producto] ?? {};
    //             return <>
    //                 {itm.buildLabel({ label: "Marca", value: marca?.descripcion })}
    //                 {itm.buildLabel({ label: "Modelo", value: modelo?.descripcion })}
    //                 {itm.buildLabel({ label: "Tipo", value: tipo_producto?.descripcion })}
    //             </>
    //         }
    //     });
    // }
    $getData() {
        var data = Parent.model.Action.getAll();
        this.marcas = Model.marca.Action.getAll();
        this.modelos = Model.modelo.Action.getAll();
        this.tipo_productos = Model.tipo_producto.Action.getAll();
        if (!this.modelos) return null;
        if (!this.marcas) return null;
        if (!this.tipo_productos) return null;
        Object.values(data).map(obj => {
            obj.modelo = this.modelos[obj.key_modelo];
            obj.marca = this.marcas[obj.modelo.key_marca];
            obj.tipo_producto = this.tipo_productos[obj.modelo.key_tipo_producto];
        })
        return data;
    }
}
export default connect(index);