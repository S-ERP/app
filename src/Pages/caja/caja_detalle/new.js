import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SHr, SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import Components from '../../../Components';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "key_tipo_pago",]
        });
    }


    $allowAccess() {
        return true;
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }

    getOptionsTipo() {
        return [
            { key: "", content: "--" },
            { key: "ingreso", content: "Ingreso" },
            { key: "egreso", content: "Egreso" },
        ]
    }
    $inputs() {
        var inp = super.$inputs();
        inp["descripcion"].type = "textArea"
        inp["descripcion"].required = true
        inp["monto"].type = "money"
        inp["monto"].required = true
        inp["tipo"] = { label: "Tipo de movimiento", required: true, type: "select", defaultValue: "", options: this.getOptionsTipo() }
        return inp;
    }
    $submitName() {
        return ""
    }
    $onSubmit(data) {
        if (!this.state.key_tipo_pago) {
            SPopup.alert("Debe seleccionar el tipo de pago");
            return;
        }
        data.key_tipo_pago = this.state.key_tipo_pago;
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            this.$submitFile(resp.data.key);
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }
    handlePress() {
        this.form.submit();
    }
    $footer() {
        return <SView col={"xs-12"} center>
            <SHr />
            <SText>{this.state.key_tipo_pago}</SText>
            <SHr />
            <Components.empresa.tipo_pago.Select select={this.state.key_tipo_pago} onSelect={(obj) => {
                this.setState({ key_tipo_pago: obj.key })
            }} />
            <SHr height={16} />
            <SButtom type={"danger"} onPress={this.handlePress.bind(this)}>CONFIRMAR</SButtom>
        </SView>
    }
}

export default connect(index);