import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SView } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: [],
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }
    $inputs() {
        var inputs = super.$inputs();
        inputs["correo"].type = "email"
        // inputs["Telefono"].type = "phone"
        return inputs;
    }


    $onSubmit(data) {
        if (!data.lat) data.lat = 0;
        if (!data.lng) data.lng = 0;
        if(!data.fecha_nacimiento) delete data.fecha_nacimiento
        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data
            },
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            SNavigation.replace("/cliente/profile", { pk: resp.data.key })
        }).catch(e => {
            console.error(e);
        })
    }


}

export default connect(index);