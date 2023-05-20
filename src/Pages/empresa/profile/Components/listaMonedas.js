import { SNavigation } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import Model from '../../../../Model';

const Parent = {
    name: "moneda",
    path: "/empresa/moneda",
    model: Model.empresa_moneda
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            page: false,
            Parent: Parent,
            type: "componentTitle",
            title: "Monedas",
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "lat", "lng", "observacion", "key_empresa", "direccion"],
            // item: Item,

        });
    }
    $allowNew() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }

    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != 0
    }
    onNew() {
        super.onNew({ key_empresa: this.props.key_empresa })
    }
    $onSelect(data) {
        SNavigation.navigate("/empresa/moneda/profile", { key_empresa: this.props.key_empresa, pk: data.key })
    }
    $getData() {
        return Parent.model.Action.getAll({ key_empresa: this.props.key_empresa });
    }
}
export default connect(index);