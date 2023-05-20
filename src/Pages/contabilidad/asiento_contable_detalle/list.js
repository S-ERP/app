import { SNavigation } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_asiento_contable"],
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa"],
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
    $onSelect(data) {
        SNavigation.navigate(Parent.path + "/profile", { pk: data.key, key_asiento_contable: this.$params.key_asiento_contable })
    }
    $getData() {
        var data = Parent.model.Action.getAll({ key_asiento_contable: this.$params.key_asiento_contable });
        return data;
    }
}
export default connect(index);