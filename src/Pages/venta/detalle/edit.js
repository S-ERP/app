import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SNavigation, SPopup, SThread } from 'servisofts-component';
import Model from '../../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_compra_venta"],
            excludes: ["key", "key_compra_venta", "observacion", "unidad_medida", "fecha_on", "key_usuario", "key_servicio", "estado", "cliente", "proveedor", "tipo", "state", "key_sucursal"]

        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $getData() {
        if (!this.pk);
        var getAll = Parent.model.Action.getAll({ key_compra_venta: this.$params.key_compra_venta });
        if (!getAll) return null
        return getAll[this.pk]
    }
    $inputs() {
        var imp = super.$inputs();
        // imp["observacion"].col = "xs-6 md-3.6"
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
        new SThread(1000, "esperarFoto", false).start(() => {
            var dto = {
                ...this.data,
                ...data
            }
            if (!dto.descuento) {
                dto.descuento = 0;
            }
            Parent.model.Action.editar({
                data: dto,
                key_usuario: ""
            }).then((resp) => {
                SNavigation.goBack();
            }).catch(e => {
                console.error(e);

            })
        })

    }
}

export default connect(index);