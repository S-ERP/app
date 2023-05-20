import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            itemType: "default",
            excludes: ["key", "key_usuario", "estado", "key_servicio", "proveedor", "cliente", "tipo", "state", "key_sucursal"]
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
        return data.estado != 0 && data.tipo == "compra"
    }
    $getData() {
        return Parent.model.Action.getAll();
    }
}
export default connect(index);