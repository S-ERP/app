import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key_empresa", "url", "component", "type", "service"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    $inputs() {
        let inputs = super.$inputs();
        // inputs["fecha_inicio"].type = "date"
        // inputs["fecha_fin"].type = "date"
        return inputs;
    }
    $onSubmit(data) {
        if (!data?.tiempo_iteracion_seg) data.tiempo_iteracion_seg = 0;
        if (!data?.fecha_fin) delete data.fecha_fin;
        Parent.model.Action.editar({
            data: {
                ...this.data,
                ...data
            },
            key_usuario: ""
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);