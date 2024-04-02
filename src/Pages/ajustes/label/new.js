import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "key_empresa"]
        });
    }

    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }


    $onSubmit(data) {
        data.key_empresa = Model.empresa.Action.getKey();
        Parent.model.Action.registro({
            data: data,
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            this.$submitFile(resp.data.key);
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);