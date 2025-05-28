import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: []
        });
    }
    $allowAccess() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
        return true
    }

    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    $inputs() {
        var inp = super.$inputs();
        inp["cantidad_seleccion"].type = "number"
        inp["cantidad_seleccion"].defaultValue = inp["cantidad_seleccion"].defaultValue + ""
        return inp;
    }


    $onSubmit(data) {
        data.cantidad_seleccion = parseInt(data.cantidad_seleccion);
        data.cantidad_seleccion_minima = parseInt(data.cantidad_seleccion_minima);

        if (data.cantidad_seleccion_minima > data.cantidad_seleccion) {
            SPopup.alert("La cantidad mínima no puede ser mayor a la cantidad máxima")
            return;
        }

        if (data.cantidad_seleccion <= 0) {
            SPopup.alert("La cantidad máxima no puede ser igual a 0, si no quiere ofertar este Sub Producto tiene la opción de desactivarlo.")
            return;
        }

        if (data.cantidad_seleccion == 1 && data.cantidad_seleccion_minima != 1) {
            SPopup.alert("Si la cantidad máxima es 1, la cantidad mínima debe ser 1.")
            return;
        }
        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data
            },
            key_usuario: Model.usuario.Action.getKey(),
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);
        })
    }
}

export default connect(index);