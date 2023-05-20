import DPA, { connect } from 'servisofts-page';
import Model from '../../../../Model';
import Item from '../../modelo/item';
const Parent = {
    name: "modelo",
    path: "/productos/modelo",
    model: Model.modelo
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            page: false,
            Parent: Parent,
            title: "Modelos",
            type: "componentTitle",
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_marca", "key_tipo_producto", "Observacion"],
            item: Item,

        });
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }

    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != 0
    }
    onNew() {
        super.onNew({ key_marca: this.props.key_marca })
    }


    $getData() {
        var data = Parent.model.Action.getAllBy({ key_marca: this.props.key_marca });
        var tipo_producto = Model.tipo_producto.Action.getAll();
        if (!data || !tipo_producto) return null;
        return data;
    }
}
export default connect(index);