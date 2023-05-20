import { SDate, SHr, SIcon, SList, SLoad, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import Model from '../../../../../Model';
import item from "../../../../productos/producto/item";
const Parent = {
    name: "Ventas sin entregar.",
    path: `/inventario/almacen/profile/recepcion_compra`,
    model: Model.compra_venta_detalle
}
class index extends DPA.list {
    constructor(props) {
        super(props, {
            type: "componentTitle",
            Parent: Parent,
            item: item,
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

    entregar(obj) {
        SPopup.confirm({
            title: "Entregar al cliente",
            message: "Seguro que decea entregar",
            onPress: () => {
                Model.producto.Action.editar({
                    key_usuario: Model.usuario.Action.getKey(),
                    data: {
                        key: obj.key_producto,
                        key_cliente: objcliente.key_usuario,
                    }
                }).then(r => {
                    Model.compra_venta_detalle.Action.entregar({
                        key_compra_venta_detalle_producto: obj.key_compra_venta_detalle_producto,
                    }).then((resp) => {
                        console.log(resp);
                    }).catch(e => {
                        console.log(e)
                    })
                }).catch(e => {

                })

            }
        })
    }
    $filter(data) {
        return data.estado != "0"
    }
    $getData() {
        if (!this.props.data) return null;
        this.productos = Model.producto.Action.getAllByKeyAlmacen(this.props.data.key);
        this.ventas_sin_entregar = Model.compra_venta_detalle.Action.ventasSinEntregar({});
        if (!this.productos || !this.ventas_sin_entregar) return null;
        var obj_final = {};
        Object.values(this.ventas_sin_entregar).map((obj) => {
            let producto = this.productos.find(pro => pro.key == obj.key_producto);
            if (!producto) return null;
            obj.producto = producto;
            obj_final[producto.key] = obj;
        })
        return obj_final;
    }
    $item(data, opt) {
        return <SList
            data={new Array(data.cantidad).fill(0)}
            render={(obj) => {
                return this.my_item(data, opt)
            }}
        />
    }
    my_item(data, opt) {
        const { codigo, descripcion, cantidad, precio_unitario, proveedor, cliente, descuento, fecha_on, key, key_producto, key_compra_venta_detalle_producto } = data;
        return <SView card style={{
            padding: 8
        }} onPress={() => {
            this.entregar(data)
        }}>
            <SView row center onPress={() => {
                SNavigation.navigate("/productos/producto/profile", { pk: key_producto })
            }}>
                <SText fontSize={18} bold>{data?.producto?.descripcion}</SText>
                <SView flex />
                <SText bold fontSize={18}>x  {1} </SText>
                <SView width={8} />
                <SView width={10} height={10} style={{ borderRadius: 100 }} backgroundColor={STheme.color.danger} />
            </SView>
            <SHr />
            <SText>{data?.producto?.modelo?.descripcion}</SText>
            <SHr />
            <SText>{data?.producto?.modelo?.marca?.descripcion}</SText>
            <SHr />
            <SText>{data?.producto?.modelo?.tipo_producto?.descripcion}</SText>
            <SHr />

            <SView>
                <SText color={STheme.color.lightGray}>Cliente: {cliente?.razon_social}</SText>
                <SText color={STheme.color.lightGray}>Nit: {cliente?.nit}</SText>
                <SText color={STheme.color.lightGray}>Telefono: {cliente?.telefono}</SText>
                <SText color={STheme.color.lightGray}>Correo: {cliente?.correo}</SText>
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