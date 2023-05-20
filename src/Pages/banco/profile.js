import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SList, SLoad, SText, SView } from 'servisofts-component';
import Model from '../../Model';
import C_banco_cuenta_list_by_banco from "./cuenta/Components/list_by_banco";
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "key_usuario", "estado"],
            // item: item
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
            <SHr />
            <C_banco_cuenta_list_by_banco key_banco={this.pk} />
        </SView>
    }
}
export default connect(index);