import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SHr, SNavigation, SPopup, SText } from 'servisofts-component';
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
        this.state = {
            tipo: "inventario"
        }
    }

    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }

    $inputs() {
        let inp = super.$inputs();

        inp["tipo"].type = "select";
        inp["tipo"].isRequired = true;
        if (!inp["tipo"].defaultValue) {
            inp["tipo"].defaultValue = this.state.tipo
        }


        inp["tipo"].options = ["activo_fijo",
            "gasto_administrativo",
            "inventario",
            "venta_servicio",
            // "bancos"
        ]
        inp["tipo"].onChangeText = (e) => {
            this.setState({ tipo: e })
        }
        inp["descripcion"].onChangeText = (e) => {
            // this.nueva_cuenta.setValue(e)
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
            {this.state.tipo == "venta_servicio" ? null :
                <>
                    <NuevaCuentaAutomatica ref={ref => this.nueva_cuenta = ref}
                        key_ajuste={this.state.tipo}
                        key_empresa={Model.empresa.Action.getKey()} descripcion={(this.state.descripcion ?? "")} />
                </>}
            <SHr />
            <SText>Ganancia</SText>
            <NuevaCuentaAutomatica ref={ref => this.nueva_cuenta_ganancias = ref}
                key_ajuste={"ganancia"}
                key_empresa={Model.empresa.Action.getKey()} descripcion={(this.state.descripcion ?? "")} />


            {this.state.tipo == "venta_servicio" ? null :
                <>
                    <SHr />
                    <SText>Costo de producto</SText>
                    <NuevaCuentaAutomatica ref={ref => this.nueva_cuenta_costo = ref}
                        key_ajuste={"costo_producto"}
                        key_empresa={Model.empresa.Action.getKey()} descripcion={(this.state.descripcion ?? "")} />
                </>
            }
            <SHr />
            <SButtom type='danger'
                onPress={() => {
                    this.form.submit();
                }}>GUARDAR</SButtom>
        </>
    }
    async $onSubmit(data) {
        if (data.tipo != "venta_servicio") {
            const resp_cuenta = await this.nueva_cuenta.submit()
            data.key_cuenta_contable = resp_cuenta?.data?.key
        }


        const resp_cuenta_ganancia = await this.nueva_cuenta_ganancias.submit()
        data.key_cuenta_contable_ganancia = resp_cuenta_ganancia?.data?.key

        if (data.tipo != "venta_servicio") {
            const resp_cuenta_costo = await this.nueva_cuenta_costo.submit()
            data.key_cuenta_contable_costo = resp_cuenta_costo?.data?.key
        }

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
    }
}

export default connect(index);