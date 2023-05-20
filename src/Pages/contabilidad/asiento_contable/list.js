import { SNavigation } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_gestion"],
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa", "key_gestion"],
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
    $onSelect(data) {
        SNavigation.navigate(Parent.path + "/profile", { pk: data.key, key_gestion: this.$params.key_gestion })
    }
    $getData() {
        var data = Parent.model.Action.getAll({ key_gestion: this.$params.key_gestion });
        return data;
    }
}
export default connect(index);