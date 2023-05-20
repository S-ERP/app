import { SNavigation } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import Model from '../../../../Model';

const Parent = {
    name: "detalle",
    path: "/empresa/moneda/detalle",
    model: Model.empresa_moneda_detalle
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            page: false,
            Parent: Parent,
            type: "componentTitle",
            title: "Monedas",
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa_moneda",],
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
    $order() {
        var order = []
        order.push({ key: "valor", order: "asc", peso: 1 })
        return order;
    }
    onNew() {
        super.onNew({ key_empresa_moneda: this.props.key_empresa_moneda })
    }
    $onSelect(data) {
        SNavigation.navigate("/empresa/moneda/detalle/profile", { key_empresa_moneda: this.props.key_empresa_moneda, pk: data.key })
    }
    $getData() {
        return Parent.model.Action.getAll({ key_empresa_moneda: this.props.key_empresa_moneda });
    }
}
export default connect(index);