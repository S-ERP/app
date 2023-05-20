import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SDate, SHr, SIcon, SImage, SList, SLoad, SMath, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
class index extends DPA.item {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // row:false
        });
    }
    $getData() {
        var data = super.$getData();
        this.modelo = Model.modelo.Action.getByKey(data.key_modelo)
        if (!this.modelo) return null;
        this.marca = Model.marca.Action.getByKey(this.modelo.key_marca)
        this.tipo_producto = Model.tipo_producto.Action.getByKey(this.modelo.key_tipo_producto)
        // if (!this.marca) return null;
        // if (!this.tipo_producto) return null;
        return data;
    }

    getEstado() {
        var text = "";
        var color = "#ff0"
        if (this.data.key_almacen) {
            text = "Disponible"
            color = STheme.color.accent
        }
        if (this.data.key_cliente) {
            text = "Entregado"
            color = STheme.color.danger
        }
        if (this.data?.venta_sin_entregar?.length > 0) {
            text = "Pendiente de entrega"
            color = STheme.color.warning
        }
        return <SView center row style={{
            position: "absolute",
            bottom: 4,
            right: 4
        }}>
            <SText fontSize={10} color={STheme.color.lightGray}>{text}</SText>
            <SView width={4} />
            <SView width={10} height={10} style={{ borderRadius: 100, backgroundColor: color }} />

        </SView>
    }


    getImages() {
        var size = 22;
        return <SView col={"xs-12"} row>
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.tipo_producto._get_image_download_path(SSocket.api, this.tipo_producto?.key)} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={4} />
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.marca._get_image_download_path(SSocket.api, this.marca?.key)} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={4} />
            <SView card width={size} height={size} style={{ overflow: 'hidden', }}>
                <SImage src={Model.modelo._get_image_download_path(SSocket.api, this.modelo?.key)} style={{ resizeMode: "cover" }} />
            </SView>
        </SView>
    }
    $render() {
        this.data = this.$getData()
        if (!this.data) return <SLoad />
        const { descripcion, observacion, precio_compra, precio_venta, precio_venta_credito } = this.data;

        return <SView col={"xs-12"} row flex card style={{
            padding: 4
        }} onPress={this.props.onPress}>
            <SView width={100} height={120} style={{ padding: 4 }}>
                <SView card flex height style={{
                    overflow: 'hidden',
                }}>
                    <SImage src={Model.producto._get_image_download_path(SSocket.api, this.data.key)+"?time"+new Date().getTime()} style={{
                        resizeMode: "cover"
                    }} />
                </SView>
            </SView>
            <SView flex style={{ padding: 4 }}>
                <SText fontSize={16} bold>{descripcion}</SText>

                <SView row>
                    <SText fontSize={12} color={STheme.color.lightGray}>{this.tipo_producto?.descripcion}</SText>
                    <SView width={8} />
                    <SText fontSize={12} color={STheme.color.lightGray}>{this.marca?.descripcion}</SText>
                    <SView width={8} />
                    <SText fontSize={12} color={STheme.color.lightGray}>{this.modelo?.descripcion}</SText>
                    <SView width={8} />
                    <SText fontSize={12} color={STheme.color.lightGray}>{observacion}</SText>
                </SView>
                <SHr />
                {this.getImages()}
                <SHr />
                <SText fontSize={18} >Bs. {SMath.formatMoney(precio_venta)}</SText>
                <SText fontSize={10} color={STheme.color.lightGray}>Bs. {SMath.formatMoney(precio_venta_credito)} Al credito</SText>
            </SView>

            {this.getEstado()}
        </SView>
    }
}
export default connect(index);