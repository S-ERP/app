import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_sucursal"],
            excludes: ["key_cuenta_contable", "lat", "lng"]
        });
    }




    $allowAccess() {
        return true;
        return Parent.model.Action.getByKey(this.pk, { key_sucursal: this._params.key_sucursal });
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk, { key_sucursal: this.$params.key_sucursal });
    }
    $onSubmit(data) {

        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data,
                // key_cuenta_contable: cuenta.key,
            },
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);