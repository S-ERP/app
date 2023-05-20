import { SNavigation, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../../Model';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Detalle del tipo de producto.",
            excludes: ["key", "key_usuario", "key_servicio", "estado", "key_empresa_moneda"]
        });
        this.key_empresa_moneda = SNavigation.getParam("key_empresa_moneda");
    }
    $allowEdit() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    onEdit() {
        SNavigation.navigate("/empresa/moneda/detalle/edit", { pk: this.pk, key_empresa_moneda: this.key_empresa_moneda })
    }

    onDelete(){
        SNavigation.navigate("/empresa/moneda/detalle/delete", { pk: this.pk, key_empresa_moneda: this.key_empresa_moneda })
    }
    $allowDelete() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk, { key_empresa_moneda: this.key_empresa_moneda });
    }

}
export default connect(index);