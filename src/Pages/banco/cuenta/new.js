import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SHr, SNavigation } from 'servisofts-component';
import Model from '../../../Model';
import { NuevaCuentaAutomatica } from 'servisofts-rn-contabilidad';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_banco"],
            params: ["key_banco"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }

    $inputs() {
        var inp = super.$inputs();
        inp["descripcion"].onChangeText = (e) => {
            this.setState({ descripcion: e })
        }
        return inp;
    }
    $submitName() {
        return ""
    }
    $render() {
        let banco = Model.banco.Action.getByKey(this.$params.key_banco)
        if (!banco) return <SLoad />
        // let centro_costo = Model.centro_costo.Action.getByKey(sucursal.key_centro_costo);
        // if (!centro_costo) return <SLoad />
        return <>
            {super.$render()}
            <NuevaCuentaAutomatica ref={ref => this.nueva_cuenta = ref}
                key_cuenta_contable={banco.key_cuenta_contable}
                key_empresa={Model.empresa.Action.getKey()} descripcion={" - " + (this.state.descripcion ?? "")} />
            <SHr />
            <SButtom type='danger'
                onPress={() => {
                    this.form.submit();
                }}>GUARDAR</SButtom>
        </>
    }
    $onSubmit(data) {
        this.nueva_cuenta.submit().then(resp_cuenta => {
            data.key_cuenta_contable = resp_cuenta?.data?.key
            data.key_banco = this.$params.key_banco
            Parent.model.Action.registro({
                data: data,
                key_usuario: Model.usuario.Action.getKey(),
            }).then((resp) => {
                SNavigation.goBack();
            }).catch(e => {
                console.error(e);

            })
        }).catch(e => {

        })
    }
}

export default connect(index);