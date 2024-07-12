import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SNavigation, SPage, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class puntos_de_ventas extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.codigo_sucursal = SNavigation.getParam("codigo_sucursal");
    }

    componentDidMount() {

    }

    render() {
        return <SPage title={"Puntos de ventas"}>
            <Container>
                <SText>{"Codigo de sucursal"} {this.codigo_sucursal}</SText>
                <SForm
                    inputs={{
                        "nombre": { type: "text", label: "Nombre" },
                        "descripcion": { type: "text", label: "Descripcion" },
                    }}
                    onSubmit={(a) => {
                        SSocket.sendPromise({
                            service: "facturacion",
                            component: "siat",
                            type: "registroPuntoDeVenta",
                            estado: "cargando",
                            nit: Model.empresa.Action.getSelect()?.nit,
                            ambiente: 2, // 1=produccion 2=prueba
                            key_empresa: Model.empresa.Action.getKey(),
                            key_usuario: Model.usuario.Action.getKey(),
                            codigo_sucursal: this.codigo_sucursal,
                            ...a
                        }, 1000 * 60).then(e => {
                            console.log(e);
                            SNavigation.goBack();
                        }).catch(e => {
                            console.error(e);
                        })
                    }}
                    onSubmitName={"Subir"}
                />
            </Container>
        </SPage>
    }
}
