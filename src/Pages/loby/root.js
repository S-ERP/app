import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SLoad, SPage, SThread, SView } from 'servisofts-component';
import UsuariosActivos from './Components/UsuariosActivos';
import Container from '../../Components/Container';
import MyPerfil from './Components/MyPerfil';
import Notas from './Components/Notas';
import MyBilletera from './Components/MyBilletera';
import Actividades from './Components/Actividades';
import PerfilEmpresa from './Components/PerfilEmpresa';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    content() {
        if (this.state.cargar) {
            new SThread(1000, "assda").start(() => {
                this.setState({ cargar: false })
            })

            return null;
        }
        return <SView col={"xs-12"} center>
            <SView col={"xs-12 sm-10 md-8 lg-6 xl-4 xxl-3"} center >

                <SHr h={16} />
                <UsuariosActivos />
                <SHr h={16} />
                <SView row col={"xs-12"}>
                    <SView col={"xs-6"}>
                        <MyPerfil />
                    </SView>
                    <SView col={"xs-6"}>
                        <MyBilletera />
                    </SView>
                </SView>
                <SHr h={16} />
                <Notas />
                <SHr h={16} />
                <Actividades />
            </SView>
        </SView>
    }
    render() {
        return <SPage title="Loby" hidden onRefresh={(e) => {
            this.setState({ cargar: true })
            return;
        }} >
            <SHr h={16} />
            <PerfilEmpresa />
            {this.content()}
        </SPage>
    }
}
