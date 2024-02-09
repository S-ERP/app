import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SNavigation } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.delete {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // params: ["key_gestion"],
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $onDelete() {
        this.data.estado = 0;
        Parent.model.Action.eliminar(this.pk).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }

    $getData() {
        // var data = Parent.model.Action.getAll({ key_gestion: this.$params.key_gestion })
        // if (!data) return null;
        return {
            key: this.pk
        }
    }
}
export default connect(index);