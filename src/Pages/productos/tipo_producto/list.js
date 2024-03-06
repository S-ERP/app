import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../../Model';
import { SHr, SText, STheme, SView } from 'servisofts-component';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            title: "Tipos de productos.",
            itemType: "2",
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_servicio", "observacion", "key_empresa", "key_cuenta_contable"]
        });
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $filter(data) {
        return data.estado != 0
    }

    $item(obj) {
        return <>
            <SView col={"xs-12"} card padding={4} onPress={this.$onSelect.bind(this, obj)}>
                <SText bold col={"xs-12"} fontSize={16} >{obj?.descripcion}</SText>
                <SText col={"xs-12"} fontSize={12} color={STheme.color.lightGray}>{obj?.cuenta_contable?.codigo} {obj?.cuenta_contable?.descripcion}</SText>
                <SHr />
                <SText col={"xs-12"} fontSize={12} color={STheme.color.lightGray}>{obj?.tipo}</SText>
            </SView>
        </>
    }
    $getData() {

        this.cuentas = Model.cuenta_contable.Action.getAll();
        this.data = Parent.model.Action.getAll();
        if (this.data && this.cuentas) {
            Object.values(this.data).map(a => {
                a.cuenta_contable = this.cuentas[a.key_cuenta_contable]
            })
        }
        return this.data;
    }
}
export default connect(index);