import { SHr, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Components from '../../../Components';
import Model from '../../../Model';
import ListaMonedaDetalle from './Components/listaMonedaDetalle';
import PuntoVentaTipoPago from './Components/PuntoVentaTipoPago';
import Config from '../../../Config';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_sucursal"],
            title: "Detalle del Punto de venta.",
            excludes: ["key", "key_usuario", "key_servicio", "estado", "lat", "lng", "key_sucursal", "key_cuenta_contable"],
        });
        // this.key_empresa = SNavigation.getParam("key_empresa");
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    onEdit() {
        SNavigation.navigate(Parent.path + "/edit", { pk: this.pk, key_sucursal: this.$params.key_sucursal })
    }
    onDelete() {
        SNavigation.navigate(Parent.path + "/delete", { pk: this.pk, key_sucursal: this.$params.key_sucursal })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk, { key_sucursal: this.$params.key_sucursal });
    }

    // getCuentaContable() {
    //     if (!this.data) return <SLoad />
    //     var cuenta_contable = null;
    //     if (this.data.key_cuenta_contable) {
    //         cuenta_contable = Model.cuenta_contable.Action.getByKey(this.data.key_cuenta_contable);
    //         if (!cuenta_contable) return <SLoad />
    //     }
    //     return <Components.contabilidad.cuenta_contable.Select
    //         // defaultValue={cuenta_contable}
    //         codigo={"1"}
    //         onChange={(cuenta) => {
    //             Parent.model.Action.editar({
    //                 data: {
    //                     ...this.data,
    //                     key_cuenta_contable: cuenta.key
    //                 },
    //                 key_usuario: Model.usuario.Action.getKey()
    //             })
    //         }} />
    // }
    $footer() {
        if (!this.data) return <SLoad />
        return <SView col={"xs-12"} >
            {/* {this.getCuentaContable()} */}
            <SHr />
            <SText>Cuenta de caja en moneda nacional:</SText>
            <Components.contabilidad.cuenta_contable.Select key_cuenta_contable={this?.data?.key_cuenta_contable} codigo={"1"} ref={ref => this.cuenta_contable_input = ref} onChange={e => {
                Parent.model.Action.editar({
                    data: {
                        ...this.data,
                        key_cuenta_contable: e.key
                    },
                    key_usuario: Model.usuario.Action.getKey()
                })
            }} />
            <SHr h={40} />
            <PuntoVentaTipoPago key_punto_venta={this.pk} />

        </SView>
    }

}
export default connect(index);