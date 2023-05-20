import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
// import Editar_modelo_inventario_dato from './Components/Editar_modelo_inventario_dato';
import { SView } from 'servisofts-component';
import item from './item';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Perfil del modelo",
            excludes: ["key", "key_usuario", "key_servicio", "key_marca", "estado", "key_tipo_producto"],
            item: item

        });
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }
    $footer() {
        return <SView col={"xs-12"}>
            {/* <Editar_modelo_inventario_dato key_modelo={this.pk} /> */}
        </SView>

    }
}
export default connect(index);