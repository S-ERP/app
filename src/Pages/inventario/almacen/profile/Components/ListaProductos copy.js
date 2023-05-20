import { SDate, SHr, SImage, SList, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import Model from '../../../../../Model';
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
            // item:item,
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
        var data = Model.almacen_producto.Action.getAllByKeyAlmacen(this.props.data.key);
        this.modelos = Model.modelo.Action.getAll();
        this.marcas = Model.marca.Action.getAll();
        this.productos = Model.producto.Action.getAll();
        this.tipo_productos = Model.tipo_producto.Action.getAll();
        if (!this.productos) return null;
        if (!this.modelos) return null;
        if (!this.marcas) return null;
        if (!this.tipo_productos) return null;
        if (!data) return null;

        Object.values(data).map((obj) => {
            obj.producto = this.productos[obj.key_producto]
            obj.modelo = this.modelos[obj.producto?.key_modelo]
            obj.marca = this.marcas[obj.modelo?.key_marca]
            obj.tipo_producto = this.tipo_productos[obj.modelo?.key_tipo_producto]
        })
        return data;
    }
    $item(data, opt) {
        const { producto, modelo, marca, tipo_producto } = data;

        return <SView card col={"xs-12"} style={{
            padding: 8
        }} onPress={() => {
            SNavigation.navigate("/productos/producto/profile", { pk: producto.key })
        }} row>
            <SView col={"xs-12"} center row>
                <SView width={60} height={60} style={{ padding: 4 }}>
                    <SView flex height card>
                        <SImage src={Model.producto._get_image_download_path(SSocket.api, data.key_producto)} />
                    </SView>
                </SView>
                <SView flex >
                    <SText fontSize={18}>{producto?.descripcion}</SText>
                </SView>
            </SView>
            <SHr />
            <SView col={"xs-4"} center>
                <SView width={35} height={35} style={{ padding: 4 }}>
                    <SView flex height card>
                        <SImage src={Model.marca._get_image_download_path(SSocket.api, marca?.key)} />
                    </SView>
                </SView>
                <SView  >
                    <SText color={STheme.color.lightGray}>{marca?.descripcion}</SText>
                </SView>
            </SView>
            <SView col={"xs-4"} center>
                <SView width={35} height={35} style={{ padding: 4 }}>
                    <SView flex height card>
                        <SImage src={Model.marca._get_image_download_path(SSocket.api, modelo?.key)} />
                    </SView>
                </SView>
                <SView >
                    <SText color={STheme.color.lightGray}>{modelo?.descripcion}</SText>
                </SView>
            </SView>
            <SView col={"xs-4"} center>
                <SView width={35} height={35} style={{ padding: 4 }}>
                    <SView flex height card>
                        <SImage src={Model.tipo_producto._get_image_download_path(SSocket.api, tipo_producto?.key)} />
                    </SView>
                </SView>
                <SView >
                    <SText color={STheme.color.lightGray}>{tipo_producto?.descripcion}</SText>
                </SView>
            </SView>
            <SHr />

            <SHr />
            {/* <SText>Precio de compra{producto?.precio_compra}</SText> */}
            {/* <SHr /> */}
            {/* <SText>{new SDate(producto?.fecha_on).toString("yyyy-MM-dd hh:mm")}</SText> */}

            {/* <SText>{producto?.key_modelo}</SText> */}
        </SView>
    }
}
export default connect(index);