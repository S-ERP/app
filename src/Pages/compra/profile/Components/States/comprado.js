import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SPage, SText, STheme, SView } from 'servisofts-component';
import Components from '../../../../../Components';
import Model from '../../../../../Model';
import Cliente from '../Cliente';
import Detalle from '../Detalle';
import PlanPagos from '../PlanPagos';
import Proveedor from '../Proveedor';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        this.data = this.props.data;
        var statei = Model.compra_venta.Action.getStateInfo(this.data.state)
        return (<SView col={"xs-12"} center card style={{ padding: 14, }}>
            <SHr />
            <SText center bold>{this.data?.descripcion}</SText>
            <SHr />
            <SText center >{this.data?.observacion}</SText>
            <Components.compra_venta.Separador data={this.data} />
            <Components.compra_venta.Estado data={this.data} disabled />
            <Components.compra_venta.Separador data={this.data} />
            <Proveedor data={this.data} disabled />
            <Components.compra_venta.Separador data={this.data} />
            <Cliente data={this.data} disabled />
            <Components.compra_venta.Separador data={this.data} />
            <Detalle data={this.data} disabled />
            <Components.compra_venta.Separador data={this.data} />
            <Components.compra_venta.Totales data={this.data} disabled />
            <Components.compra_venta.Separador data={this.data} />
            <PlanPagos ref={ref => this.pp = ref} data={this.data} disabled />
            <Components.compra_venta.Separador data={this.data} />
            <Components.compra_venta.QRCompra data={this.data} />
            <Components.compra_venta.Separador data={this.data} />
            <Components.compra_venta.Participantes data={this.data} disabled />
            <Components.compra_venta.Separador data={this.data} />
            <Components.compra_venta.Comentarios data={this.data} disabled />


            <Components.compra_venta.Exportar data={this.data} />
            <SView col={"xs-12"} row center>
                {/* <SView card style={{ padding: 16 }} onPress={() => {
                    Model.compra_venta.Action.changeState({ data: this.data, state: "denegado" })
                }}>
                    <SText bold color={STheme.color.danger}>DENEGAR</SText>
                </SView>
                <SView width={8} />
                <SView card style={{ padding: 16 }} onPress={() => {
                    Model.compra_venta.Action.changeState({ data: this.data, state: "comprado" })
                }}>
                    <SText bold color={STheme.color.success}>COMPRAR</SText>
                </SView> */}
                {/* <SView card style={{ padding: 16 }} onPress={() => {
                    Model.compra_venta.Action.changeState({ data: this.data, state: "cotizacion" })
                }}>
                    <SText bold color={STheme.color.danger}>VOLVER A COTIZACION</SText>
                </SView> */}
            </SView>
        </SView>

        );
    }
}