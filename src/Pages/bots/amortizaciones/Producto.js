import React, { Component } from 'react';
import { SDate, SHr, SImage, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Hanldes from './Handles';


export default class Producto extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }



    renderLabel(key, value) {
        return <SView col={"xs-12 sm-6"} padding={4}>
            <SView row col={"xs-12"}>
                <SView col={"xs-4"}>
                    <SText fontSize={12} color={STheme.color.lightGray}>{key}</SText>
                </SView>
                <SText bold>{value}</SText>
            </SView>
            <SHr h={4} />
            <SHr h={1} color={STheme.color.card} />
        </SView>
    }

    renderAction(label, callback) {
        return <SView padding={4} onPress={callback}>
            <SView padding={8} card>
                <SText>{label}</SText>
            </SView>
        </SView>
    }

    renderCuotasCompraVenta() {
        if (!this.state.compra_venta) return <SText>{"Precione verificar para continuar"}</SText>
        let cuotas = Object.values(this.state.compra_venta.cuotas);
        return <SView col={"xs-12"} row>
            <SHr />
            <SText bold>Plan de pagos sistema</SText>
            <SHr h={4} />
            <SView col={"xs-12"} row>
                {/* {this.renderLabel("Desde", new SDate(cuotas[0]["FECHA  PAGO"]).toString("yyyy-MM-dd"))} */}
                {/* {this.renderLabel("Hasta", new SDate(cuotas[cuotas.length - 1]["FECHA  PAGO"]).toString("yyyy-MM-dd"))} */}
                {this.renderLabel("# de cuotas", cuotas.length)}
                {this.renderLabel("Monto", SMath.formatMoney(cuotas[0]["monto"]))}
                {this.renderLabel("Total", SMath.formatMoney(cuotas.reduce((acc, val) => acc + val["monto"], 0)))}
            </SView>
        </SView>
    }
    render() {
        const data = this.props.data;
        const cuotas = data?.cuotas ?? [];
        return <SView center card col={"xs-12"} padding={8}>
            <SView col={"xs-12"}>
                {this.renderLabel("Cliente", data["CLIENTE"])}
                <SView col={"xs-12"} row>
                    {this.renderLabel("Marca", data["MARCA:"])}
                    {this.renderLabel("Modelo", data["MODELO:"])}
                    {this.renderLabel("Chasis", data["CHASIS:"])}
                    {this.renderLabel("Motor", data["MOTOR:"])}
                    {this.renderLabel("FRV", data["FRV:"])}
                    {this.renderLabel("Poliza", data["POLIZA:"])}
                    {this.renderLabel("Color", data["COLOR:"])}
                    {this.renderLabel("Año", data["AÑO:"])}
                </SView>
                <SHr />
                <SText bold>Plan de pagos excel</SText>
                <SHr h={4} />
                <SView col={"xs-12"} row>
                    {this.renderLabel("Desde", new SDate(cuotas[0]["FECHA  PAGO"]).toString("yyyy-MM-dd"))}
                    {this.renderLabel("Hasta", new SDate(cuotas[cuotas.length - 1]["FECHA  PAGO"]).toString("yyyy-MM-dd"))}
                    {this.renderLabel("# de cuotas", cuotas.length)}
                    {this.renderLabel("Monto", SMath.formatMoney(cuotas[0]["CUOTA"]))}
                    {this.renderLabel("Total", SMath.formatMoney(cuotas.reduce((acc, val) => acc + val["CUOTA"], 0)))}

                </SView>
                <SHr />
                {this.renderCuotasCompraVenta()}
                <SHr />
                <SView col={"xs-12"} row style={{
                    justifyContent: "space-between"
                }}>
                    {this.renderAction("Log", () => console.log(data))}
                    {!this.state?.compra_venta ? null : this.renderAction("Ver venta", () => SNavigation.navigate("/venta/profile", { pk: this.state?.compra_venta?.key }))}
                    {this.renderAction("Verificar", Hanldes.verificarProducto.bind(this))}
                    {/* {this.renderAction("Verificar Cuotas", Hanldes.verificarCuotas.bind(this))} */}
                </SView>
                <SView col={"xs-12"} center>
                    <SLoad hidden={!this.state.loading} />
                    <SText bold color={this.state.loading ? STheme.color.warning : STheme.color.danger}>{this.state.error}</SText>
                </SView>
            </SView>
        </SView>
    }
}
