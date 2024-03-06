import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SHr, SNavigation, SPopup } from 'servisofts-component';
import Model from '../../Model';
import { NuevaCuentaAutomatica, NuevoCentroAutomatico } from 'servisofts-rn-contabilidad';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "estado", "lat", "lng"]
        });
    }
    $allowAccess() { 
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $inputs() {
        var inp = super.$inputs();
        inp["telefono"].type = "phone";
        inp["correo"].type = "email";
        // inp["descripcion"].onChangeText = (e) => {
        //     this.setState({ descripcion: e })
        // }
        return inp;
    }
    $submitName() {
        return ""
    }
    $render() {
        return <>
            {super.$render()}
            {/* <NuevoCentroAutomatico ref={ref => this.nueva_cuenta = ref} key_ajuste='caja' key_empresa={Model.empresa.Action.getKey()} descripcion={this.state.descripcion} /> */}
            {/* <NuevaCuentaAutomatica ref={ref => this.nueva_cuenta_2 = ref} key_ajuste='bancos' key_empresa={Model.empresa.Action.getKey()} descripcion={this.state.descripcion} /> */}
            <SHr />
            <SButtom type='danger'
                onPress={() => {
                    this.form.submit();
                }}>GUARDAR</SButtom>
        </>
    }

    $onSubmit(data) {
        Model.centro_costo.Action.registro({
            codigo: data.observacion ?? data.descripcion,
            descripcion: data.descripcion
        }).then(e => {

            data.key_centro_costo = e?.data?.key
            if (!data.key_centro_costo) return null;
            Parent.model.Action.registro({
                data: data,
                key_usuario: Model.usuario.Action.getKey(),
                key_empresa: Model.empresa.Action.getKey()
            }).then((resp) => {
                SNavigation.goBack();
            }).catch(e => {
                console.error(e);
            })

        })




    }
}

export default connect(index);