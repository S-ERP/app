import { SNavigation, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';

class index extends DPA.list {

    // static TOPBAR = <SView col={"xs-12"} height={55} backgroundColor={"#f0f"} />
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado"],
            // item: Item,
            params:["cuenta?"],
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                resolve();
            }
        });
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    onNew() {
        super.onNew({ key_empresa: this.empresa?.key })
    }

    $onSelect(obj) {
        if (this?.$params?.cuenta) {
            SNavigation.navigate("/banco/profile", {
                pk: obj.key,
                onSelect: super.$onSelect.bind(this)
            })
            return;
        }
        return super.$onSelect(obj);
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != 0
    }
    $getData() {
        return Parent.model.Action.getAll();
    }
}
export default connect(index);