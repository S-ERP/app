import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "cliente", "proveedor", "tipo", "state", "key_sucursal"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $inputs() {
        var inp = super.$inputs();
        inp["observacion"].type = "textArea";
        return inp;
    }
    $onSubmit(data) {
        data.tipo = "venta"
        data.tipo_pago = "contado"
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            this.$submitFile(resp.data.key);
            SNavigation.replace(Parent.path + "/profile", { pk: resp.data.key });
        }).catch(e => {
            console.error(e);

        })
    }
}

export default connect(index);