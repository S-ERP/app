import { SDate, SHr, SList, SLoad, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import Model from '../../../../../Model';
import PopupTipoRecepcion from './PopupTipoRecepcion';

const Parent = {
    name: "Compras sin recepcionar.",
    path: `/inventario/almacen/profile/recepcion_compra`,
    model: Model.compra_venta_detalle
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            type: "componentTitle",
            Parent: Parent,
            title: Parent.name,
            excludes: ["key", "fecha_on", "key_usuario", "Password", "Telefono", "Correo", "CI"]
        });
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
    $filter(data) {
        return data.estado != "0"
    }
    $getData() {
        if (!this.props.data) return null;

        var data = Model.compra_venta_detalle.Action.comprasSinRecepcionar({ key_sucursal: "" });
        // console.log(this.props.data, data)
        return data;

    }
    $item(data, opt) {
        return this.my_item(data, opt)
        return <SList
            data={new Array(data.cantidad).fill(0)}
            limit={10}
            render={(obj) => {
                return this.my_item(data, opt)
            }}
        />
    }
    my_item(data, opt) {
        const { codigo, descripcion, cantidad, precio_unitario, proveedor, descuento, fecha_on, key, key_compra_venta } = data;
        return <SView card style={{
            padding: 8,
            overflow: "hidden"
        }} onPress={() => {
            var precio = precio_unitario - (descuento / cantidad)

            PopupTipoRecepcion.open({
                precio_compra: parseFloat(precio).toFixed(2),
                descripcion: descripcion,
                cantidad: cantidad,
                key_compra_venta_detalle: key,
                key_almacen: this.props.data.key,
                key_compra_venta: key_compra_venta
            });
        }}>

            <SView row center col={"xs-12"}>
                <SText fontSize={18} bold flex>{descripcion}</SText>
                <SView width={4} />
                <SText bold fontSize={18}>x  {cantidad} </SText>
                <SView width={8} />
                <SView width={10} height={10} style={{ borderRadius: 100 }} backgroundColor={STheme.color.danger} />
            </SView>
            <SHr />

            <SView>
                <SText color={STheme.color.lightGray}>Proveedor: {proveedor?.razon_social}</SText>
                <SText color={STheme.color.lightGray}>Nit: {proveedor?.nit}</SText>
            </SView>
            <SView row center>

                <SView flex />
                <SText color={STheme.color.lightGray} fontSize={12}>{new SDate(fecha_on).toString("dd de MONTH, yyyy, hh:mm")}</SText>
            </SView>
            <SHr />
            <SLoad type='window' hidden={!this.state.loading} label={this.state.loading} onCancel={() => {
                this.setState({ loading: "" });
            }} />
            {/* <SText>{JSON.stringify(data)}</SText> */}
        </SView>
    }
}
export default connect(index);