import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SPage, SText, STheme, SView } from 'servisofts-component';
import Components from '../../../../../Components';
import Model from '../../../../../Model';
import Cliente from '../Cliente';
import Detalle from '../Detalle';
import Proveedor from '../Proveedor';


export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getActions() {
        if (!this.isAdmin) return null
        return <SView col={"xs-12"} center row>

            <SView card style={{ padding: 16, }} onPress={() => {
                Model.compra_venta.Action.changeState({ data: this.data, state: "denegado" })
            }}>
                <SText bold color={STheme.color.danger}>DENEGAR</SText>
            </SView>
            <SView width={8} />

            <SView card style={{ padding: 16 }} onPress={() => {
                Model.compra_venta.Action.changeState({ data: this.data, state: "aprobado" })
            }}>
                <SText bold color={STheme.color.warning}>APROBAR</SText>
            </SView>
        </SView>
    }
    render() {

        this.data = this.props.data;
        this.isAdmin = Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });
        var statei = Model.compra_venta.Action.getStateInfo(this.data.state)
        return (<SView col={"xs-12"} center>
            <SView col={"xs-12"} center card style={{ padding: 14, }}>
                <SHr />
                <SText center bold fontSize={18}>{this.data?.descripcion}</SText>
                <SHr />
                <SText center >{this.data?.observacion}</SText>
                <Components.compra_venta.Separador data={this.data} />
                <Components.compra_venta.Estado data={this.data} />
                <Components.compra_venta.Separador data={this.data} />
                <Proveedor data={this.data} disabled={!this.isAdmin} />
                <Components.compra_venta.Separador data={this.data} />
                <Cliente data={this.data} disabled={!this.isAdmin} />
                <Components.compra_venta.Separador data={this.data} />
                <Detalle data={this.data} />
                <Components.compra_venta.Separador data={this.data} />
                <Components.compra_venta.Totales data={this.data} />

                <Components.compra_venta.Separador data={this.data} />
                <Components.compra_venta.QRCompra data={this.data} />
                <Components.compra_venta.Separador data={this.data} />
                {this.getActions()}
            </SView>
            <SHr height={16} />
            <Components.compra_venta.Exportar data={this.data} />
            <SHr height={50} />
            <Components.compra_venta.Participantes data={this.data} />
            <SHr height={50} />
            <SView col={"xs-12"} center card>
                <Components.compra_venta.Comentarios data={this.data} />
            </SView>
        </SView>
        );
    }
}