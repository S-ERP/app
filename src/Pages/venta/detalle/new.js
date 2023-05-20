import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "key_compra_venta", "observacion", "unidad_medida", "fecha_on", "key_usuario", "key_servicio", "estado", "cliente", "proveedor", "state", "key_sucursal"]
        });
    }
    // $allowAccess() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    // }
    $inputs() {
        var imp = super.$inputs();

        // imp["observacion"].col = "xs-6 md-3.6"
        imp["tipo"] = {
            ...imp["tipo"],
            type: "select",
            defaultValue: "producto",
            options: ["producto", "servicio"]
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
        data.key_compra_venta = this._params.key_compra_venta
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
}

export default connect(index);