import { SNavigation, SText, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Linking } from 'react-native'
import { Parent } from '.';
import { AsientoContableStatic } from 'servisofts-rn-contabilidad';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // params: ["key_gestion"],
            type: "page",
            excludes: ["key", "key_usuario", "key_servicio", "key_sucursal"],
            onRefresh: (resolve) => {
                Model.asiento_contable.Action.CLEAR();
            }
        });
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }

    onEdit() {
        SNavigation.navigate("/contabilidad/asiento", {
            pk: this.pk,
            key_gestion: this.$params.key_gestion
        })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    // onDelete() {
    //     SNavigation.navigate("/contabilidad/asiento/delete", {
    //         pk: this.pk,
    //         key_gestion: this.$params.key_gestion
    //     })
    // }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        console.log(this.$params.key_gestion)
        return {
            key: this.pk,
            key_gestion: this.$params.key_gestion
        };
        var data = Parent.model.Action.getAll({ key_gestion: this.$params.key_gestion })
        if (!data) return null;
        return data[this.pk]
    }

    $menu() {
        let menu = super.$menu()
        console.log(menu)
        menu.push({ label: "Clonar", onPress: this.clonar.bind(this) })
        menu.push({ label: "PDF", onPress: this.export_pdf.bind(this) })
        return menu
    }
    clonar() {
        SNavigation.navigate("/contabilidad/asiento", {
            pk: this.pk,
            key_gestion: this.$params.key_gestion,
            clone: true
        })
    }
    export_pdf() {
        Model.asiento_contable.Action.pdf({ key: this.pk }).then((resp) => {
            this.setState({ loading: false })
            console.log(SSocket.api.contabilidad + "pdf/" + resp.data);
            Linking.openURL(SSocket.api.contabilidad + "pdf/" + resp.data);
        }).catch(e => {
            this.setState({ loading: false })
            console.error(e)
        });
    }


    $render() {
        this.data = this.$getData();
        // if (!this.data) return null;
        return <SView style={{
            padding: 8,
        }} flex>
            <AsientoContableStatic key_asiento_contable={this.pk} key_gestion={this.$params.key_gestion} />
        </SView>
    }
}
export default connect(index);