import React from "react";
import { SInput, SPopup, SText, STheme, SView } from "servisofts-component";
import Label from "./Label";
import { Factura } from "../../../MDL/factura/type";



type NitNumeroProps = {
    factura: Factura,
    estado?: string,
    ambiente?: number,
    mostrarErrores?: boolean,
    onEstadoChange?: (estado: string) => void
}
const customStyle: any = "facturaDuplicar";
const errorStyle = { borderWidth: 2, borderColor: STheme.color.danger };
const ESTADOS = ["enviada", "procesando", "emitida", "anulada"];
export default class NitNumero extends React.Component<NitNumeroProps> {

    getEstadoColor(estado?: string) {
        if (estado == "enviada") return STheme.color.success;
        if (estado == "emitida") return STheme.color.warning;
        if (estado == "anulada") return STheme.color.danger;
        if (estado == "procesando") return STheme.color.gray;
        return STheme.color.primary;
    }

    openSelectEstado() {
        SPopup.open({
            key: "select_estado_factura",
            content: <SView width={140} backgroundColor={STheme.color.background} withoutFeedback center
                style={{ borderRadius: 6, overflow: "hidden", borderWidth: 1, borderColor: "#66666699" }}>
                {ESTADOS.map(estado => (
                    <SView key={estado} col={"xs-12"} padding={6}
                        onPress={() => {
                            SPopup.close("select_estado_factura");
                            if (this.props.onEstadoChange) this.props.onEstadoChange(estado);
                        }}>
                        <SView backgroundColor={this.getEstadoColor(estado)} height={22} borderRadius={4} center>
                            <SText fontSize={11} color={"#fff"} bold>{estado.toUpperCase()}</SText>
                        </SView>
                    </SView>
                ))}
            </SView>
        });
    }

    render() {
        return <SView col={"xs-12"} center>
            <SView col={"xs-12"} row >
                <Label bold flex>{"NIT"}</Label>

                <SInput flex customStyle={customStyle}
                    disabled
                    style={{ backgroundColor: STheme.color.text + "33" }}
                    defaultValue={this.props.factura.data.nitEmisor}

                    onChangeText={e => {
                        this.props.factura.data.nitEmisor = e
                    }} />
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"FACTURA N"}</Label>
                <SInput flex customStyle={customStyle}
                    defaultValue={this.props.factura.data.numeroFactura}
                    style={this.props.mostrarErrores && !this.props.factura.data.numeroFactura ? errorStyle : undefined}
                    onChangeText={e => {
                        this.props.factura.data.numeroFactura = e
                    }} />
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"CÓD. AUTORIZACIÓN"}</Label>
                <SInput flex customStyle={customStyle}
                    defaultValue={this.props.factura.data.cuf}
                    style={!this.props.factura.data.cuf ? errorStyle : undefined}
                    onChangeText={e => {
                        this.props.factura.data.cuf = e
                    }} />
            </SView>
            <SView col={"xs-12"} row >
                <Label bold flex>{"MÉTODO DE PAGO"}</Label>
                <SInput flex customStyle={customStyle}
                    defaultValue={this.props.factura.data.codigoMetodoPago}
                    style={this.props.mostrarErrores && !this.props.factura.data.codigoMetodoPago ? errorStyle : undefined}
                    onChangeText={e => {
                        this.props.factura.data.codigoMetodoPago = e
                    }} />
            </SView>
            <SView col={"xs-12"} row center>
                <Label bold flex>{"ESTADO"}</Label>
                <SView flex center>
                    <SView backgroundColor={this.getEstadoColor(this.props.estado)} width={90} height={22} borderRadius={4} center
                        onPress={() => this.openSelectEstado()}>
                        <SText fontSize={11} color={"#fff"} bold>{(this.props.estado || "-").toUpperCase()}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}