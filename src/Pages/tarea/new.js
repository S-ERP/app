import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $onSubmit(data) {
        data.key_empresa = Model.empresa.Action.getSelect()?.key
        data.key_usuario = Model.usuario.Action.getKey();
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getSelect()?.key
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);
        })
    }
}

export default connect(index);