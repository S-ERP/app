import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SDate, SNavigation } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa"]
        });
    }

    $inputs() {
        let inputs = super.$inputs();
        // inputs["fecha_inicio"].type = "date"
        // inputs["fecha_fin"].type = "date"
        inputs["fecha_inicio"].defaultValue = new SDate().toString("yyyy-MM-dd hh:mm:ss")
        inputs["fecha_fin"].defaultValue = new SDate().addHour(1).toString("yyyy-MM-dd hh:mm:ss")
        return inputs;
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