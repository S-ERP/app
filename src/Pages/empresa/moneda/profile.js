import { SNavigation, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import ListaMonedaDetalle from './Components/listaMonedaDetalle';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Detalle del tipo de producto.",
            excludes: ["key", "key_usuario", "key_servicio", "estado"]
        });
        this.key_empresa = SNavigation.getParam("key_empresa");
    }
    $allowEdit() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    onEdit() {
        SNavigation.navigate("/empresa/moneda/edit", { pk: this.pk, key_empresa: this.key_empresa })
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
        return Parent.model.Action.getByKey(this.pk, { key_empresa: this.key_empresa });
    }
    $footer() {
        return <SView col={"xs-12"} >
            <ListaMonedaDetalle key_empresa_moneda={this.pk} />
        </SView>
    }

}
export default connect(index);