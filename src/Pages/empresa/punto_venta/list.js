import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Puntos de venta",
            itemType: "3",
            params: ["key_sucursal"],
            excludes: ["key", "key_usuario", "key_servicio", "estado", "lat", "lng", "key_sucursal", "fecha_on", "direccion", "key_cuenta_contable"]
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
        return Parent.model.Action.getAllBySucursal({ key_sucursal: this.$params.key_sucursal });
    }
}
export default connect(index);