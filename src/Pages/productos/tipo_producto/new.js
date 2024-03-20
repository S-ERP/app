import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SHr, SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../Model';
import { NuevaCuentaAutomatica } from 'servisofts-rn-contabilidad';

class index extends DPA.new {
    state = {
        tipo: "activo_fijo"
    }
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado", "key_empresa", "key_cuenta_contable"]
        });
    }

    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }

    $inputs() {
        let inp = super.$inputs();

        inp["tipo"].type = "select";
        inp["tipo"].isRequired = true;
        if (!inp["tipo"].defaultValue) {
            inp["tipo"].defaultValue = "activo_fijo";
        }


        inp["tipo"].options = ["activo_fijo", "gasto_administrativo", "inventario", "venta_servicio", "bancos" ]
        inp["tipo"].onChangeText = (e) => {
            this.setState({ tipo: e })
        }
        inp["descripcion"].onChangeText = (e) => {
            this.setState({ descripcion: e })
        }
        return inp;
    }

    $submitName() {
        return ""
    }
    $render() {
        // let banco = Model.banco.Action.getByKey(this.$params.key_banco)
        // if (!banco) return <SLoad />
        // let centro_costo = Model.centro_costo.Action.getByKey(sucursal.key_centro_costo);
        // if (!centro_costo) return <SLoad />
        return <>
            {super.$render()}
            <NuevaCuentaAutomatica ref={ref => this.nueva_cuenta = ref}
                key_ajuste={this.state.tipo}
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
            data.key_empresa = Model.empresa.Action.getSelect()?.key
            Parent.model.Action.registro({
                data: data,
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp) => {
                this.$submitFile(resp.data.key);
                SNavigation.goBack();
            }).catch(e => {
                console.error(e);
            })
        }).catch(e => {
            console.error(e);
        })
    }
}

export default connect(index);