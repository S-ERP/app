import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SList, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

export default class puntos_de_ventas extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.codigo_sucursal = SNavigation.getParam("codigo_sucursal");
    }

    componentDidMount() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getPuntosDeVentas",
            estado: "cargando",
            nit: Model.empresa.Action.getSelect()?.nit,
            ambiente: 2, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            codigo_sucursal: this.codigo_sucursal,
        }, 1000 * 60).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {

        })
    }

    eliminarPuntoVenta(){
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getPuntosDeVentas",
            estado: "cargando",
            nit: Model.empresa.Action.getSelect()?.nit,
            ambiente: 2, // 1=produccion 2=prueba
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            codigo_sucursal: this.codigo_sucursal,
        }).then(e => {

            this.setState({ ...this.state })
        }).catch(e => {

        })
    }

    renderItem(data) {
        const { nombrePuntoVenta, codigoPuntoVenta, tipoPuntoVenta } = data;
        return <SView col={"xs-12"} card padding={8}>
            <SView flex style={{justifyContent:'flex-end'}} row onPress={(e)=>{
                console.log(e)
            }}>
                <SIcon name='Delete' width={25}/>
            </SView>
            <SView>
                <SText>{codigoPuntoVenta}</SText>
                <SText>{nombrePuntoVenta}</SText>
                <SText>{tipoPuntoVenta}</SText>
            </SView>
        </SView>
    }
    render() {
        return <SPage title={"Puntos de ventas"}>
            <SText>{"Codigo de sucursal"} {this.codigo_sucursal}</SText>
            <SText onPress={() => {
                SNavigation.navigate("/facturacion/puntos_de_ventas/registro", { codigo_sucursal: this.codigo_sucursal })
            }} underLine>{"Registrar nuevo punto de venta"}</SText>
            <SList data={this.state.data ?? []}
                render={this.renderItem.bind(this)}
            />
        </SPage>
    }
}
