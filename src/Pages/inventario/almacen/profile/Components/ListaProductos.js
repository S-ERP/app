import { SDate, SHr, SIcon, SImage, SList, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import Model from '../../../../../Model';
import item from "../../../../productos/producto/item"
import SSocket from 'servisofts-socket'
const Parent = {
    name: "Productos en el almacen.",
    path: `/inventario/almacen/profile/productos`,
    model: Model.almacen_producto
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            type: "componentTitle",
            Parent: Parent,
            title: Parent.name,
            item: item,
            excludes: ["key", "fecha_on", "key_usuario", "Password", "Telefono", "Correo", "CI"]
        });
        this.state = {
            select: {
                "disponible": true,
                // "aprobado": true,
            },
            ...this.state,
        }
    }

    // $allowNew() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    // }
    // $allowTable() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    // }
    // $allowAccess() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    // }

    optionItem({ key, label, color }) {
        var select = !!this.state.select[key]
        return <SView height={28} center style={{
            paddingLeft: 8,
            paddingRight: 8,
            opacity: select ? 1 : 0.5,
            backgroundColor: color + "99",
        }} onPress={() => {

            if (!select) {
                this.state.select[key] = true;
            } else {
                delete this.state.select[key];
            }
            this.setState({ ...this.state })
        }} row>
            {!select ? null : <> <SIcon name={"Close"} width={12} height={12} fill={STheme.color.text} /> <SView width={8} /></>}
            <SText>{label}</SText>
        </SView>
    }

    $menu() {
        var items = super.$menu();
        items.push({
            children: this.optionItem({ key: "disponible", label: "Disponible", color: STheme.color.accent })
        })
        items.push({
            children: this.optionItem({ key: "pendiente_entrega", label: "Pendientes de entrega", color: STheme.color.warning })
        })
        items.push({
            children: this.optionItem({ key: "vendido", label: "Entregado", color: STheme.color.danger })
        })
        return items;
    }
    $filter(data) {
        return data.estado != "0"
    }
    $getData() {
        if (!this.props.data) return null;
        this.productos = Model.producto.Action.getAllRecursive();
        if (!this.productos) return null;

        let r = {};
        Object.values(this.productos).map((obj) => {
            if (obj.key_almacen != this.props.data.key) return null
            r[obj.key] = obj;
        })
        return r;
    }
    $filter(data) {
        if (!data.estado) return false;


        if (!this.state.select["pendiente_entrega"]) {
            if (data?.venta_sin_entregar?.length > 0) {
                return false;
            }
        }
        if (!this.state.select["vendido"]) {
            if (data.key_cliente) {
                return false;
            }
        }
        if (!this.state.select["disponible"]) {
            if (data.key_almacen && !data.key_cliente && data?.venta_sin_entregar?.length <= 0) {
                return false;
            }
        }
        return true;
    }
    $onSelect(obj) {
        SNavigation.navigate("/productos/producto/profile", { pk: obj.key })
    }
    // $item(data, opt) {
    //     const { key, descripcion, modelo, marca, tipo_producto } = data;

    //     return <SView card col={"xs-12"} style={{
    //         padding: 8
    //     }} onPress={() => {
    //         SNavigation.navigate("/productos/producto/profile", { pk: key })
    //     }} row>
    //         <SView col={"xs-12"} center row>
    //             <SView width={60} height={60} style={{ padding: 4 }}>
    //                 <SView flex height card>
    //                     <SImage src={Model.producto._get_image_download_path(SSocket.api, key)} />
    //                 </SView>
    //             </SView>
    //             <SView flex >
    //                 <SText fontSize={18}>{descripcion}</SText>
    //                 {/* {this} */}
    //             </SView>
    //         </SView>
    //         <SHr />
    //     </SView>
    // }
}
export default connect(index);