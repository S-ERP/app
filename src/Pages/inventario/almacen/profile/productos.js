import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import { SHr, SList, SLoad, SText, SView } from 'servisofts-component';
import Model from '../../../../Model';
import { MenuPages } from 'servisofts-rn-roles_permisos';
import Item from "../item"
import ListaProductos from './Components/ListaProductos';
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio", "key_sucursal"],
            item: Item
        });
    }
    $allowBack() {
        return true;
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
        return <SView col={"xs-12"} >
            <SHr />
            <ListaProductos data={this.data} />
        </SView>
    }
}
export default connect(index);