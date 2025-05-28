import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SInput, SPage, SText } from 'servisofts-component';
import { Container } from '../../Components';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import MDL from '../../MDL';
import SelectTipoAnulacion from './Components/SelectTipoAnulacion';

export default class anular_cuf extends Component {
    ref;
    constructor(props) {
        super(props);
        this.state = {
            parametricas: {}
        };
    }

    componentDidMount() {
        MDL.factura.getParametrica({ ambiente: MDL.factura.ambiente, parametrica: "motivoAnulacion" }).then((res) => {
            this.state.parametricas.motivoAnulacion = res;
            this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })

    }
    handleVerificar() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "verificarCuf",
            cuf: this.ref.getValue(),
            key_empresa: Model.empresa.Action.getKey(),
            ambiente: 1,
            nit: Model.empresa.Action.getSelect()?.nit
        })
    }
    handleAnular() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "anularCuf",
            cuf: this.ref.getValue(),
            key_empresa: Model.empresa.Action.getKey(),
            ambiente: 1,
            nit: Model.empresa.Action.getSelect()?.nit,
            codigo_motivo: this.motivoAnulacion.getValue()
        })
    }

    render() {
        return <SPage>
            <Container>
                <SInput ref={ref => this.ref = ref} type='textArea' label={"CUF"} placeholder={"CUF"} />
                <SHr />
                <SText onPress={this.handleVerificar.bind(this)} padding={8} card>{"Verificar CUF"}</SText>
                <SHr />
                {!this.state.parametricas ? null : <SelectTipoAnulacion ref={ref => this.motivoAnulacion = ref} parametricas={this.state.parametricas} />}
                <SHr />
                <SText onPress={this.handleAnular.bind(this)} padding={8} card>{"Anular por CUF"}</SText>
            </Container>
        </SPage>
    }
}
