import DPA, { connect } from 'servisofts-page';
import { Parent } from "./index"
import Model from '../../Model';
import Item from "./item"
class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            item: Item,
            title:"En cotizacion",
            itemType: "default",
            excludes: ["key", "key_usuario", "estado", "key_servicio", "proveedor", "cliente", "tipo", "key_sucursal"]
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
    $order() {
        return [{ key: "fecha_on", order: "desc" }]
    }
    $filter(data) {
        return data.estado != 0 && data.tipo == "compra" && data.state == "cotizacion"
    }
    $getData() {
        return Parent.model.Action.getAll();
    }

}
export default connect(index);