import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            title: "Cuentas",
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_banco"],
            params: ["key_banco"]
            // item: Item,

        });
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }

    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != 0 && data.key_banco == this.$params.key_banco
    }
    onNew() {
        super.onNew({ key_banco: this.$params.key_banco })
    }
    
    $getData() {
        return Parent.model.Action.getAll();
    }
}
export default connect(index);