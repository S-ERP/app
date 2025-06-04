import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SMD from '../../../SMD';
import OrdenesConMismoNumero from '../Components/OrdenesConMismoNumero';
import HorarioDeCliente from '../Components/HorarioDeCliente';
import PopupRazon from '../Components/PopupRazon';
import Model from '../../../Model';
import MenuAcciones from './MenuAcciones';
import ContadorTiempoRestante from './ContadorTiempoRestante';

const CardContent = ({ children }) => {
    return <SView col={"xs-4"} padding={8} center>
        <SView col={"xs-12"} card padding={8}>
            {children}
        </SView>
    </SView>
}


export default class index extends Component {
    pk = SNavigation.getParam("key");
    state = {
        data: null,
    }
    componentDidMount() {
        MDL.crm.clienteProyecto.getFull(this.pk).then((e) => {
            this.setState({ data: e })
            if (e.state == "en_proceso") {
                // verificar si soy yo el que esta llamando
            } else {
                MDL.crm.clienteProyecto.editar({
                    key: this.pk,
                    state: "en_proceso",
                    key_usuario_atiende: Model.usuario.Action.getKey()
                });
            }

        })

    }


    render() {
        const { proyecto, state, fecha_on, fecha_edit } = this.state.data || {};
        return <SPage title={"Call"}>
            <SView col={"xs-12"} center>
                <SHr h={25} />
                <MenuAcciones key_cliente_proyecto={this.pk} />
                {!this.state?.data?.fecha_edit ? null : <>
                    <SHr h={25}/>
                    <ContadorTiempoRestante key_cliente_proyecto={this.pk} fecha_start={fecha_edit ?? fecha_on} />
                </>}
                <SHr h={25} />
                <SView row col={"xs-12"} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <CardContent>
                        <HorarioDeCliente key_cliente_proyecto={this.pk} clienteProyecto={this.state?.data} ></HorarioDeCliente>
                    </CardContent>
                    <CardContent>
                        <SMD padding={0} fontSize={11} space={0}>{proyecto?.guion}</SMD>
                    </CardContent>
                    <CardContent>
                        <OrdenesConMismoNumero key_cliente_proyecto={this.pk} />
                    </CardContent>
                </SView>
            </SView>
        </SPage >
    }
}
