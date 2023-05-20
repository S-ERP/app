import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SView } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "key_empresa"]
        });
    }
    // $allowAccess() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    // }
    // $getData(){
    //     var key_empresa =Model.empresa.Action.getSelect()?.key
    //     return key_empresa
    // }

    $onSubmit(data) {

        Parent.model.Action.registro(data).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);