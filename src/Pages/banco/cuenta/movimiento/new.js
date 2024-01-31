import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup, SView } from 'servisofts-component';
import Model from '../../../../Model';
import Components from '../../../../Components';
import Config from '../../../../Config';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_cuenta"],
            params: ["key_cuenta"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $inputs() {
        var imp = super.$inputs();
        imp["monto"].type = "money"
        imp["descripcion"].type = "textArea"
        imp["type"] = { label: "Tipo", required: true, type: "select", defaultValue: "", options: Model.cuenta_movimiento.Action.getTypes() }
        return imp;
    }
    $onSubmit(data) {
        data.key_cuenta = this.$params.key_cuenta
        data.key_cuenta_banco = this.$params.key_cuenta
        if (data.type == "egreso") {
            data.monto = data.monto * -1;
        }
        var cc = this.cuenta_contable_input.getValue();
        if (!cc) {
            SPopup.alert("Deve seleccionar una cuenta contable");
            return;
        }
        data.key_cuenta_contable = cc.key
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        }).then((resp) => {
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
    $header() {
        return <SView col={"xs-12"}>
            <Components.contabilidad.cuenta_contable.Select codigo={Config.cuenta_contable.banco_cuenta_movimiento.cuenta} ref={ref => this.cuenta_contable_input = ref} />
        </SView>
    }
}

export default connect(index);