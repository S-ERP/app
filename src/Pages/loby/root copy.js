import React, { Component } from 'react';
import { ScrollView, Platform } from 'react-native';
import { SHr, SIcon, SLoad, SNavigation, SPage, SText, STheme, SThread, SView } from 'servisofts-component';
import UsuariosActivos from './Components/UsuariosActivos';
import MyPerfil from './Components/MyPerfil';
import Notas from './Components/Notas';
import MyBilletera from './Components/MyBilletera';
import Actividades from './Components/Actividades';
import PerfilEmpresa from './Components/PerfilEmpresa';
import PHr from '../../Components/PHr';
import Model from '../../Model';
import Publicaciones from './Components/Publicaciones';
import { ScrollView as ScrollViewGesture } from 'react-native-gesture-handler';
import MenuOpciones from './Components/MenuOpciones';
import MenuPaginas from './Components/MenuPaginas';

export default class root extends Component {
    state = {
        cargar: true
    };

    

    renderMunuItem({ onPress, label, icon, color }) {
        return <SView width={(label.length * 8) + 45} card padding={8} onPress={onPress} center row>
            <SView width={18} height={18} center>
                <SIcon name={icon} width={18} height={18} fill={color ?? STheme.color.text} />
            </SView>
            {(label.length > 0) ? <SView width={5} /> : null}
            <SText>{label}</SText>
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
                {/* <SButtom type={"outline"}  onPress={() => { SNavigation.navigate("/restaurante") }} >Restaurante</SButtom> */}
                <MenuOpciones />
                <PHr />
                <UsuariosActivos />
                <PHr />
                <MenuPaginas key={Model.empresa.Action.getKey()} />
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
        const Scroll = Platform.select({
            web: ScrollView,
            native: ScrollViewGesture
        })
        return <SPage title="Loby" hidden disableScroll onRefresh={() => {
            this.setState({ cargar: true })
            Model.publicacion.Action.CLEAR();
        }} >
            <Scroll>
                <SHr h={16} />
                <PerfilEmpresa />
                {this.content()}
                <SHr h={100} />
            </Scroll>
            <SView style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 1000,
                backgroundColor: "black",
                borderRadius: 50,
                padding: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                minWidth: 80,
            }} center>
                <SText bold size={13} color="#FFF">v1.0.19</SText>
            </SView>
        </SPage>
    }
}
