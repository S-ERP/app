import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import UsuariosActivos from './Components/UsuariosActivos';
import Container from '../../Components/Container';
import MyPerfil from './Components/MyPerfil';
import Notas from './Components/Notas';
import MyBilletera from './Components/MyBilletera';
import Actividades from './Components/Actividades';
import PerfilEmpresa from './Components/PerfilEmpresa';
import PHr from '../../Components/PHr';
import Model from '../../Model';
import Chat from './Components/Chat';
import Publicaciones from './Components/Publicaciones';

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
                if (!Model.usuario.Action.getKey()) {
                    SNavigation.replace("/login")
                    return;
                }
                if (!Model.empresa.Action.getKey()) {
                    SNavigation.replace("/root")
                    return;
                }
                this.setState({ cargar: false })
            })

            return <SLoad />;
        }
        return <SView col={"xs-12"} center>
            <SView col={"xs-12 sm-10 md-9 lg-7 xl-6 xxl-5"} center >
                <SHr h={16} />
                <ScrollView horizontal>
                    <SView row col={"xs-12"}>
                        <SText padding={8} card border={STheme.color.danger} onPress={() => SNavigation.navigate("/root")}>Salir</SText>
                        <SView width={8} />
                        <SText padding={8} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/menu")}>Menu</SText>
                        <SView width={8} />
                        {/* <SText padding={8} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/test")}>Test</SText> */}
                        {/* <SView width={8} /> */}
                        <Chat label={"Chat"} />
                        {/* <SText padding={8} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/home3")}>Home3</SText>
                    <SView width={8} /> */}
                        {/* <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/usuario")}>Usuarios</SText> */}
                        {/* <SView width={8} /> */}
                    </SView>
                </ScrollView>
                <PHr />
                <UsuariosActivos />
                <PHr />
                <SView row col={"xs-12"}>
                    <SView col={"xs-6"}>
                        <MyPerfil />
                    </SView>
                    <SView col={"xs-6"}>
                        <MyBilletera />
                    </SView>
                </SView>
                <PHr />
                <Notas />
                <PHr />
                <Actividades />
                <PHr />
                <Publicaciones />
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
            <SHr h={100} />
        </SPage>
    }
}
