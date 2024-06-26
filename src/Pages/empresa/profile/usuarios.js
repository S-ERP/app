import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import { SButtom, SHr, SList, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import ListaUsuarios from './Components/listaUsuarios';
import InvitarUsuario from '../../../Components/empresa/InvitarUsuario';

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
    $allowBack() {
        return true;
    }
    $footer() {
        return <SView col={"xs-12"}>
            <SHr />
            <InvitarUsuario />
            <ListaUsuarios key_empresa={this.pk} />
        </SView>
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }
}
export default connect(index);