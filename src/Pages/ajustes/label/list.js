import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio", "required", "caducable"],
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                resolve();
            }
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
    $order() {
        let order = super.$order();
        order = [{
            key: "dias", order: "asc", peso: 1, type: "number"
        }];

        return order;
    }
    $getData() {
        return Parent.model.Action.getAll();
    }
}
export default connect(index);