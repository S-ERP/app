import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup, SThread } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado"],

        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $inputs() {
        var inputs = super.$inputs();
        return inputs;
    }

    $onSubmit(data) {
        // if (data["Password"] != data["rep_pass"]) {
        //     SPopup.alert("Las contraceñas no coinciden.")
        //     return;
        // }
        data.key_empresa = Model.empresa.Action.getKey();
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then((resp) => {
            this.$submitFile(resp.data.key);
            SNavigation.replace("/cliente/profile", { pk: resp.data.key })

        }).catch(e => {
            this.reject("Error desconocido al registrar usuario")
        })
    }

}

export default connect(index);