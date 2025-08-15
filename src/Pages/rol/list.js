import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';
import MDL from '../../MDL';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_servicio", "estado"],
            itemType: "2",
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                resolve();
            }
        });
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new", key_empresa: MDL.empresa?.select?.key });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table", key_empresa: MDL.empresa?.select?.key });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver", key_empresa: MDL.empresa?.select?.key });
    }
    $filter(data) {

        return data.estado != 0 && data.key_empresa == Model.empresa.Action.getSelect()?.key
    }

    $order() {
        return [{ key: "descripcion", order: "asc", peso: 1 }]
    }
    $getData() {
        return Parent.model.Action.getAll();
    }
}
export default connect(index);