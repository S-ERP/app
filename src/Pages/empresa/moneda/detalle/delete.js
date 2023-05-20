import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../../Model';

class index extends DPA.delete {
    constructor(props) {
        super(props, { Parent: Parent, });
        this.key_empresa_moneda = SNavigation.getParam("key_empresa_moneda");
    }
    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }

    $onDelete() {
        this.data.estado = 0;
        Parent.model.Action.editar({
            data: this.data,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            SNavigation.goBack();
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }

    $getData() {
        return Parent.model.Action.getByKey(this.pk, { key_empresa_moneda: this.key_empresa_moneda });
    }
}
export default connect(index);