import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
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
            cargar: true
        };
    }

    content() {
        if (!!this.state.cargar) {
            new SThread(500, "adasdasd", true).start(() => {
                this.setState({ cargar: false })
            })

            return <SLoad />;
        }
        return <SView col={"xs-12"} center>
            <SView col={"xs-12 sm-10 md-9 lg-7 xl-6 xxl-5"} center >
                <SHr h={16} />
                <SView row col={"xs-12"}>
                    <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.reset("/")}>Cambiar de empresa</SText>
                    <SView width={8} />
                    <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/menu")}>Administrar la empresa</SText>
                    <SView width={8} />
                    {/* <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/tarea/reto")}>Retos</SText> */}
                    {/* <SView width={8} /> */}
                    {/* <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/usuario")}>Usuarios</SText> */}
                    {/* <SView width={8} /> */}
                </SView>
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
