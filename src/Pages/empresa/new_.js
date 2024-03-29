import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $onSubmit(data) {
        console.log("data");
        console.log(data);
        // data.key_servicio = "1427e867-c4f7-4602-a1aa-5deabf2d0372";
        // Parent.model.Action.registro({
        //     data: data,
        //     key_usuario: Model.usuario.Action.getKey()
        // }).then((resp) => {
        //     Model.empresa.Action.setEmpresa(resp.data);
        //     SNavigation.replace("/empresa/init")
        //     SNavigation.goBack();
        // }).catch(e => {
        //     console.error(e);

        // })
    }
}

export default connect(index);