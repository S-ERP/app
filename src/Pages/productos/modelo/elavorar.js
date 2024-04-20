import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SHr, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import SList from 'servisofts-component/Component/SList2';
import { Container } from '../../../Components';
import Ingrediente from './Components/Ingrediente';

export default class elavorar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk");
    }

    componentDidMount() {
        SSocket.sendPromise({
            service: "inventario",
            component: "modelo",
            type: "buscarIngredientes",
            key_modelo: this.pk,
            key_usuario: Model.usuario.Action.getKey(),
            key_sucursal: "afb2d199-5d41-4013-a730-81e19b2422dc",
        }).then(a => {
            // SNotification.send({
            //     title: "Exito",
            //     body: "Se creo con exito",
            //     color: STheme.color.success,
            //     time: 5000,
            // })
            this.setState({ data: a.data })
        }).catch(e => {
            SNotification.send({
                title: "Error",
                body: e?.error,
                color: STheme.color.danger,
                time: 5000,
            })
        })
    }

    renderItem = (itm) => {
        return <SView style={{ width: "100%", }} padding={8} card>
            <SText>{itm.modelo} X {itm.cantidad}</SText>
            <SText color={STheme.color.lightGray} fontSize={8}>{itm.key_almacen}</SText>
            {/* <SText>{JSON.stringify(itm, "\n", "\t")}</SText> */}
        </SView>
    }
    renderElementos() {
        if (!this.state.data) return <SLoad />
        return <SList data={this.state.data}
            render={this.renderItem.bind(this)} />
    }
    render() {
        return <SPage title={"Elaborar"}>
            <Container>
                <Ingrediente key_modelo={this.pk} />
                <SHr />
                <SText>DISPONIBLES</SText>
                <SHr />
                {this.renderElementos()}
                <SView width={100}>
                    <SInput ref={ref => this.cantidad = ref} label={"Cantidad"} defaultValue={1} />
                </SView>
                <SHr />
                <SText onPress={() => {
                    SSocket.sendPromise({
                        service: "inventario",
                        component: "modelo",
                        type: "procesar",
                        key_modelo: this.pk,
                        key_sucursal: "afb2d199-5d41-4013-a730-81e19b2422dc",
                        key_almacen: "b5c9064a-09be-4504-b110-5897dc485bbc",
                        key_empresa: Model.empresa.Action.getKey(),
                        key_usuario: Model.usuario.Action.getKey(),
                        cantidad: this.cantidad.getValue(),

                    }).then(e => {

                    }).catch(e => {

                    })
                }} card padding={8}>PROCESAR</SText>
            </Container>
        </SPage>
    }
}
