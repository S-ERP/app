import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import { SButtom, SHr, SList, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import { MenuPages } from 'servisofts-rn-roles_permisos';
class index extends DPA.profile {
    constructor(props) {
        super(props, { Parent: Parent, excludes: ["key", "key_usuario", "key_servicio", "estado"] });
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
            <SText fontSize={16} bold>Menu</SText>
            <SHr />
            <MenuPages path={"/empresa/profile/"} permiso={"ver"} params={{
                pk: this.pk
            }}>
            </MenuPages>
        </SView>
    }

}
export default connect(index);