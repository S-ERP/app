import { SNavigation, SText } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { AsientoContable } from 'servisofts-rn-contabilidad';
import Model from '../../../Model';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_gestion"],
            excludes: ["key", "key_usuario", "key_servicio", "key_sucursal"],

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
        var data = Parent.model.Action.getAll({ key_gestion: this.$params.key_gestion })
        if (!data) return null;
        return data[this.pk]
    }
    $render(){
        return <AsientoContable key_gestion={this.$params.key_gestion} key_asiento_contable={this.pk} />
    }
    // $footer() {
    //     return <AsientoContable key_gestion={this.$params.key_gestion} key_asiento_contable={this.pk} />
    //     // return <SText onPress={() => { SNavigation.navigate("/contabilidad/asiento_contable_detalle", { key_asiento_contable: this.pk }) }}>Ver asientos</SText>
    // }
}
export default connect(index);