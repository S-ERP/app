import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "key_empresa"]
        });
    }

    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $inputs() {
        let inp = super.$inputs();

        inp["tipo"].type = "select";
        inp["tipo"].isRequired = true;
        if (!inp["tipo"].defaultValue) {
            inp["tipo"].defaultValue = "producto";
        }
        inp["tipo"].options = ["producto", "servicio"]
        return inp;
    }
    $onSubmit(data) {
        data.key_empresa = Model.empresa.Action.getSelect()?.key
        Parent.model.Action.registro({
            data: data,
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