import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SHr, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import Components from '../../../Components';
import Config from '../../../Config';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Compra",
            excludes: ["key", "key_compra_venta", "observacion", "unidad_medida", "fecha_on", "key_usuario", "key_servicio", "estado", "cliente", "proveedor", "state", "key_sucursal"]
        });
    }
    // $allowAccess() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    // }
    $inputs() {
        var imp = super.$inputs();

        // imp["observacion"].col = "xs-6 md-3.6"

        // "activo_fijo" | "gasto_administrativo" | "inventario" | "venta_servicio"
        imp["tipo"] = {
            ...imp["tipo"],
            isRequired: true,
            type: "select",
            value: this.state.tipo,
            options: ["", "activo_fijo", "inventario", "gasto_administrativo" , "servicio"]
        }
        imp["descripcion"].col = "xs-12 md-12"
        imp["descripcion"].type = "textArea"
        imp["cantidad"].defaultValue = "1"
        imp["cantidad"].col = "xs-3.6"
        imp["cantidad"].type = "number"
        imp["precio_unitario"].col = "xs-8"
        imp["precio_unitario"].type = "money"
        // imp["unidad_medida"].col = "xs-5.8"
        imp["descuento"].col = "xs-12"
        imp["descuento"].type = "money"
        return imp;
    }
    $onSubmit(data) {
        // data.tipo = "compra"
        // if (!this.cuenta_contable_input.getValue()) {
        //     SPopup.alert("Seleccione una cuenta");
        //     return;
        // }
        data.key_compra_venta = this._params.key_compra_venta
        data.data = {
            key_cuenta_contable: this.state.tipo_producto?.key_cuenta_contable,
        }
        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            // this.$submitFile(resp.data.key);
            SNavigation.goBack();
            // SNavigation.replace(Parent.path + "/profile", { pk: resp.data.key });
        }).catch(e => {
            console.error(e);

        })
    }

    $render() {
        return <>
            <SHr height={30} />
            {/* <SText color={STheme.color.lightGray} justify>{"¡Hola! Cuando compras un producto en nuestro sistema, tienes que asignar una cuenta específica donde se abonarán los pagos correspondientes a ese producto. Es importante que selecciones correctamente la cuenta asignada para asegurarte de que los pagos se apliquen correctamente a tu compra. De esta manera, podrás llevar un control claro de tus transacciones y asegurarte de que todo esté en orden. Si tienes dudas sobre cómo seleccionar la cuenta correcta, no dudes en preguntarnos. ¡Estamos aquí para ayudarte!"}</SText> */}
            <SButtom type='danger' onPress={() => {
                SNavigation.navigate("/productos/tipo_producto", {
                    onSelect: (a) => {

                        this.setState({ tipo_producto: a, tipo: a.tipo })
                    }
                })
            }}>SELECT TIPO DE PRODUCTO</SButtom>
            <SHr height={30} />
            {/* <Components.contabilidad.cuenta_contable.Select codigo={Config.cuenta_contable.compra_detalle.cuenta} ref={ref => this.cuenta_contable_input = ref} /> */}
            <SHr h={8} />
            {super.$render()}
            <SHr height={100} />
        </>
    }
}

export default connect(index);