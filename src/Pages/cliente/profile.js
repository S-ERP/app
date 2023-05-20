import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SForm, SHr, SInput, SList, SNavigation, SText, SView } from 'servisofts-component';
import Model from '../../Model';
import DatosDocumentos from '../usuario/Components/DatosDocumentos';
import ItemVenta from '../venta/item'
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "Password"],
            itemType: "1",
            onRefresh: (resolve) => {
                this.componentDidMount()
                resolve()
            }
        });
    }

    componentDidMount() {
        Model.compra_venta.Action.getByKeyCliente(this.pk).then(resp => {
            this.setState({ ventas: resp.data })
        }).catch(e => {
            console.error(e);
        })
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

    $footer() {
        return <SView col={"xs-12"}>
            <DatosDocumentos key_usuario={this.pk} />
            <SHr />
            <SText>Compras</SText>
            <SView col={"xs-12"} center>
                <SList
                    data={this.state.ventas}
                    render={(obj) => {
                        return <ItemVenta data={obj} col={"xs-12"} onPress={() => {
                            SNavigation.navigate("/venta/profile", { pk: obj.key })
                        }} />
                    }} />
            </SView>
        </SView>

    }
}
export default connect(index);