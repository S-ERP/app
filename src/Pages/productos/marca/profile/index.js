import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import Model from '../../../../Model';
import { SText, SView } from 'servisofts-component';
import ListaModelos from './listaModelos';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "key_usuario", "key_servicio"]

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
            <ListaModelos key_marca={this.pk} />
        </SView>
    }
}
export default connect(index);