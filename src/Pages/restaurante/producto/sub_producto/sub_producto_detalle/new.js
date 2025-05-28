import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../../../Model';

import PButtom from '../../../../../Components/PButtom';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_sub_producto"],
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_sub_producto"]
        });

        this.state = {
            loading: false
        };
    }

    $allowAccess() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
        return true;
    }

    $inputs() {
        var inp = super.$inputs();
        inp["precio"].type = "money"
        return inp;
    }

    $submitName() {
        return null
    }

    $onSubmit(data) {
        this.setState({ loading: true });
        data.key_sub_producto = this.$params.key_sub_producto;

        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            SPopup.alert("Error en el server: " + e.error)
            console.error(e);
            this.setState({ loading: false });
        })
    }

    $footer() {
        return <PButtom
            danger={true}
            loading={this.state.loading}
            fontSize={14}
            onPress={() => { this.form.submit() }}
        >
            Crear Sub Producto Detalle
        </PButtom>
    }
}

export default connect(index);