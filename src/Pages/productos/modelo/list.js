import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import { SNavigation } from 'servisofts-component';
import item from './item';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio", "key_marca", "key_tipo_producto", "observacion"],
            item: item
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

    $getData() {
        this.modelos = Model.modelo.Action.getAll();;
        this.marcas = Model.marca.Action.getAll();
        this.tipo_productos = Model.tipo_producto.Action.getAll();
        if (!this.modelos || !this.marcas || !this.tipo_productos) return null;
        return this.modelos;
    }
}
export default connect(index);