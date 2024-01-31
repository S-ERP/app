import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SList, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import C_cuenta_movimiento_list_by_cuenta from "./movimiento/Components/list_by_cuenta";
import item from './item';
import { CuentaContable } from 'servisofts-rn-contabilidad';
import Components from '../../../Components';
import Config from '../../../Config';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            item: item,
            Parent: Parent,
            excludes: ["key", "key_usuario", "estado", "key_banco", "fecha_on"],
            params: ["pk", "key_banco"]
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
    $allowBack() {
        return true;
    }

    $getData() {
        var data = Parent.model.Action.getByKey(this.pk, null, {});
        if (data) {
            if (!data.key) {
                SNavigation.goBack();
                return null;
            }
        }
        return data;
    }
    getCuentaContable() {
        if (!this.data) return <SLoad />
        return <Components.contabilidad.cuenta_contable.Select
            key_cuenta_contable={this.data.key_cuenta_contable}
            codigo={Config.cuenta_contable.banco_cuenta.cuenta}
            onChange={(cuenta) => {
                Model.banco_cuenta.Action.editar({
                    data: {
                        ...this.data,
                        key_cuenta_contable: cuenta.key
                    },
                    key_usuario: Model.usuario.Action.getKey()
                })
            }} />
    }
    $footer() {
        return <SView col={"xs-12"}>
            {this.getCuentaContable()}
            <SHr />
            <C_cuenta_movimiento_list_by_cuenta key_cuenta={this.pk} />
        </SView>
    }

}
export default connect(index);