import { SHr, SLoad, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Components from '../../../Components';
import Model from '../../../Model';
import Editar_tipo_producto_inventario_dato from './Components/Editar_tipo_producto_inventario_dato';
import Config from '../../../Config';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Detalle del tipo de producto.",
            excludes: ["key", "key_usuario", "key_servicio", "estado", "key_cuenta_contable"]

        });
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    // getCuentaContableCredito() {
    //     if (!this.data) return <SLoad />
    //     var cuenta_contable = null;
    //     if (this.data.key_cuenta_contable_credito) {
    //         cuenta_contable = Model.cuenta_contable.Action.getByKey(this.data.key_cuenta_contable_credito);
    //         if (!cuenta_contable) return <SLoad />
    //     }
    //     return <Components.contabilidad.cuenta_contable.Select
    //         defaultValue={cuenta_contable}
    //         codigo={Config.cuenta_contable.tipo_producto_credito.cuenta}
    //         onChange={(cuenta) => {
    //             Model.tipo_producto.Action.editar({
    //                 data: {
    //                     ...this.data,
    //                     key_cuenta_contable_credito: cuenta.key
    //                 },
    //                 key_usuario: Model.usuario.Action.getKey()
    //             })
    //         }} />
    // }
    getCuentaContable(key_value) {
        if (!this.data) return <SLoad />
        var cuenta_contable = null;
        if (this.data[key_value]) {
            cuenta_contable = Model.cuenta_contable.Action.getByKey(this.data[key_value]);
            if (!cuenta_contable) return <SLoad />
        }
        return <Components.contabilidad.cuenta_contable.Select
            defaultValue={cuenta_contable}
            // codigo={"1"}
            onChange={(cuenta) => {
                Model.tipo_producto.Action.editar({
                    data: {
                        ...this.data,
                        [key_value]: cuenta.key
                    },
                    key_usuario: Model.usuario.Action.getKey()
                })
            }} />
    }
    $footer() {
        return <SView col={"xs-12"}>
            <SHr />
            <SText color={STheme.color.lightGray}>Cuenta contable</SText>
            {this.getCuentaContable("key_cuenta_contable")}
            <SHr />
            <SText color={STheme.color.lightGray}>Cuenta contable ganancias</SText>
            {this.getCuentaContable("key_cuenta_contable_ganancia")}
            <SHr />
            <SText color={STheme.color.lightGray}>Cuenta contable costos</SText>
            {this.getCuentaContable("key_cuenta_contable_costo")}
            <SHr />
            {/* <SText color={STheme.color.lightGray}>Cuenta contable al credito</SText> */}
            {/* {this.getCuentaContableCredito()} */}
            <Editar_tipo_producto_inventario_dato key_tipo_producto={this.pk} />
        </SView>

    }
}
export default connect(index);