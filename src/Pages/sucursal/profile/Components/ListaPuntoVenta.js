import { SNavigation } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import Model from '../../../../Model';

const Parent = {
    name: "Puntos de ventas",
    path: `/empresa/punto_venta`,
    model: Model.punto_venta
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            type: "componentTitle",
            Parent: Parent,
            title: Parent.name,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_sucursal", "lng", "lat", "key_cuenta_contable"]
        });
    }

    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != "0"
    }
    onNew() {
        SNavigation.navigate(Parent.path + "/new", { key_sucursal: this.props.key_sucursal })
    }
    $onSelect(data) {
        SNavigation.navigate("/empresa/punto_venta/profile", { key_sucursal: this.props.key_sucursal, pk: data.key })
    }
    $getData() {
        return Model.punto_venta.Action.getAll({ key_sucursal: this.props.key_sucursal });
    }
}
export default connect(index);