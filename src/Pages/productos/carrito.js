import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { SHr, SImage, SList, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { Container } from '../../Components';
import Sucursal from '../../Components/empresa/sucursal';

export default class carrito extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {

    }
    loadData(key_sucursal) {
        SSocket.sendPromise({
            service: "inventario",
            component: "modelo",
            type: "getCarrito",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
            key_sucursal: key_sucursal
        }).then(e => {
            this.setState({ data: e.data })
            console.log(e);
        }).catch(e => {
            console.log(e);
        })
    }
    item(data) {
        return <SView col={"xs-12"} padding={8} card onPress={() => {
            SNavigation.navigate("/productos/modelo/profile", { pk: data.modelo.key })
        }} row>
            <SView width={40} height={40}>
                <SImage src={Model.modelo._get_image_download_path(SSocket.api, data.modelo.key)} />
            </SView>
            <SView width={8} />
            <SView flex>
                <SText bold fontSize={16}>{data?.tipo_producto?.descripcion}</SText>
                <SText color={STheme.color.gray}>{data?.modelo?.descripcion}</SText>
                <SText>Precio   : {data.modelo.precio_venta}</SText>
                <SText>Catnidad : {data.cantidad}</SText>
            </SView>
        </SView>
    }
    render() {
        return <SPage title={"Carrito"}>
            <Container>
                <Sucursal.Select onChange={(e) => {
                    console.log(e);
                    this.loadData(e.key)
                }} />
                <SHr />
                <SList data={this.state.data} render={this.item.bind(this)} />
            </Container>
        </SPage>
    }
}
