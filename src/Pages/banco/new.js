import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SHr, SNavigation } from 'servisofts-component';
import Model from '../../Model';
import { NuevaCuentaAutomatica } from 'servisofts-rn-contabilidad';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_empresa"]
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
        // let sucursal = Model.sucursal.Action.getByKey(this.$params.key_sucursal)
        // if (!sucursal) return <SLoad />
        // let centro_costo = Model.centro_costo.Action.getByKey(sucursal.key_centro_costo);
        // if (!centro_costo) return <SLoad />
        return <>
            {super.$render()}
            <NuevaCuentaAutomatica ref={ref => this.nueva_cuenta = ref} key_ajuste='bancos' key_empresa={Model.empresa.Action.getKey()} descripcion={" - " + (this.state.descripcion ?? "")} />
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
            data.key_empresa = Model.empresa.Action.getSelect()?.key
            Parent.model.Action.registro({
                data: data,
                key_usuario: Model.usuario.Action.getKey(),
                key_empresa: Model.empresa.Action.getKey()
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