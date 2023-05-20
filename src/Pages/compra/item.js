import DPA, { connect } from 'servisofts-page';
import { Parent } from "./index"
import { SDate, SHr, SIcon, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket'
class index extends DPA.item {
    sizeImage = 32
    constructor(props) {
        super(props, {
            Parent: Parent,
            padding: 0,
            // row:false
        });
    }
    $getData() {
        var data = super.$getData();
        return data;
    }

    renderState() {
        var statesInfo = Model.compra_venta.Action.getStateInfo()[this.data.state];

        return <SView row center style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 120, height: 20,
            backgroundColor: statesInfo.color,
            transform: [{
                rotateZ: '45deg'
            }, { translateX: "30%" }, { translateY: -8 }]
        }} >
            <SText fontSize={12} bold color={STheme.color.text}>{statesInfo.label}</SText>
            {/* <SView width={8} /> */}
            {/* <SView backgroundColor={statesInfo.color} width={size} height={size} style={{
                borderRadius: 100
            }}>

            </SView> */}
        </SView>
    }

    render_cliente() {
        if (!this.data.cliente) return <SText>Sin cliente</SText>
        return <SView col={"xs-12"} row center>
            <SView width={this.sizeImage} height={this.sizeImage} style={{ padding: 4 }}>
                <SView flex height card style={{
                    overflow: 'hidden',
                }}>
                    <SImage src={Model.sucursal._get_image_download_path(SSocket.api, this.data?.key_sucursal)} />
                </SView>
            </SView>
            <SText fontSize={12}>{this.data?.cliente?.razon_social}</SText>
            <SView flex />
        </SView>
    }
    render_proveedor() {
        if (!this.data.proveedor) return <SText>Sin proveedor</SText>
        return <SView col={"xs-12"} row center>
            <SView width={this.sizeImage} height={this.sizeImage} style={{ padding: 4 }}>
                <SView flex height card style={{
                    overflow: 'hidden',
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + this.data?.proveedor?.key_usuario} />
                </SView>
            </SView>
            <SText fontSize={12}>{this.data?.proveedor?.razon_social}</SText>
            <SView flex />
        </SView>
    }
    render_tipo_pago() {
        return <SView row center col={"xs-12"}>
            <SText fontSize={12} >{"Tipo de pago:"}</SText>
            <SView width={8} />
            <SText color={STheme.color.lightGray} bold>{this.data?.tipo_pago}</SText>
            <SView flex />
        </SView>
    }
    $renderContent() {
        return <SView col={"xs-12"} style={{
            overflow: "hidden",
            padding: 8,
        }}>
            {this.renderState()}
            <SText bold>{this.data.descripcion}</SText>
            <SText color={STheme.color.gray}>{this.data.observacion}</SText>
            <SHr />
            {this.render_tipo_pago()}
            <SHr />
            {this.render_proveedor()}
            <SHr />
            {this.render_cliente()}
            <SView col={"xs-12"} row center>
                <SView flex />
                <SText fontSize={12}>{new SDate(this.data.fecha_on).toString("dd de MONTH, yyyy hh:mm")}</SText>
                <SView width={this.sizeImage} height={this.sizeImage} style={{ padding: 4 }}>
                    <SView flex height card style={{
                        overflow: 'hidden',
                    }}>
                        <SImage src={SSocket.api.root + "usuario/" + this.data.key_usuario} />
                    </SView>
                </SView>
            </SView>

        </SView>
    }
}
export default connect(index);