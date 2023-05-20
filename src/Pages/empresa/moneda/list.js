import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Tipos de productos.",
            itemType: "2",
            params: ["key_empresa"],
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa", "observacion"]
        });
    }
    $allowNew() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $filter(data) {
        return data.estado != 0
    }
    $getData() {
        return Parent.model.Action.getAll({ key_empresa: this.$params.key_empresa });
    }
}
export default connect(index);