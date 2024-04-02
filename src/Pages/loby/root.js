import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SIcon, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
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
import InvitarUsuario from '../../Components/empresa/InvitarUsuario';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cargar: true
        };
    }

    renderMunuItem({ onPress, label, icon, color }) {
        return <SView width={(label.length * 12) + 36} card padding={8} onPress={onPress} center row>
            <SView width={20} height={20}>
                <SIcon name={icon} fill={color ?? STheme.color.text} />
            </SView>
            <SView width={8} />
            <SText >{label}</SText>
        </SView>
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
                <ScrollView horizontal style={{
                    width: "100%"
                }}>
                    <>
                        {this.renderMunuItem({ label: "Menú", icon: "Menu", onPress: () => SNavigation.navigate("/menu") })}
                        <SView width={8} />

                        <Chat label={"Chat"}  >
                            {this.renderMunuItem({ label: "Chat", color: STheme.color.success, icon: "Comment", })}
                        </Chat>
                        <SView width={8} />

                        {this.renderMunuItem({ label: "Ajustes", icon: "Ajustes", onPress: () => SNavigation.navigate("/ajustes") })}
                        <SView width={8} />
                        <InvitarUsuario />
                        {/* {this.renderMunuItem({ label: "Invitar", icon: "Usuarios", color: STheme.color.danger, onPress: () => SNavigation.navigate("/root") })} */}
                        <SView width={8} />
                        {this.renderMunuItem({ label: "Salir", icon: "Arrow", color: STheme.color.danger, onPress: () => SNavigation.navigate("/root") })}
                        <SView width={8} />
                    </>
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
            </SView >
        </SView >
    }
    render() {
        return <SPage title="Loby" hidden onRefresh={(e) => {
            this.setState({ cargar: true })
            Model.publicacion.Action.CLEAR();
            return;
        }} >
            <SHr h={16} />
            <PerfilEmpresa />
            {this.content()}
            <SHr h={100} />
        </SPage>
    }
}
