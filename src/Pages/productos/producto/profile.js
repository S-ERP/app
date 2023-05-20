import { SButtom, SHr, SNavigation, SPopup, SText, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { MenuPages } from 'servisofts-rn-roles_permisos';
import { Parent } from "."
import Model from '../../../Model';
import AlmacenActual from './Components/AlmacenActual';
import AlmacenProductoHistory from './Components/AlmacenProductoHistory';
import DatosDocumentos from './Components/DatosDocumentos';
import item from './item';
import QRProducto from '../../../Components/QRProducto';
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            itemType: "1",
            excludes: ["key", "key_usuario", "key_servicio",],
            onRefresh: (resolve) => {
                Parent.model.Action.CLEAR();
                Model.inventario_dato.Action.CLEAR();
                Model.producto_inventario_dato.Action.CLEAR();
                resolve();
            },
            item: item

        });
    }
    componentDidMount(){
        if(!Model.usuario.Action.getKey()){
            SNavigation.navigate("/login");
        }
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
        if(!Model.usuario.Action.getKey()){
            return null;
        }
        return Parent.model.Action.getByKey(this.pk);
    }
    $footer() {
        return <SView col={"xs-12"} center>
            <DatosDocumentos key_producto={this.pk} />
            <SHr />
            <SView col={"xs-12"} row>
                <SView flex />
                <QRProducto pk={this.pk} />
            </SView>
            <SHr />
            <AlmacenActual key_producto={this.pk} />
            <SHr />

            <AlmacenProductoHistory key_producto={this.pk} />
            <SHr />

        </SView>

    }
    // $footer() {
    //     return <SView col={"xs-12"} center>
    //         <MenuPages path={"/productos/producto/profile"} >

    //         </MenuPages>

    //     </SView>
    // }
}
export default connect(index);