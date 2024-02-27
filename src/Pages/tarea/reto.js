//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHr, SImage, SList, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import { connect } from 'react-redux';
import Container from '../../Components/Container';
import SSocket from 'servisofts-socket';

// create a component
class index extends Component {

    state = {}
    componentDidMount() {
        SSocket.sendPromise({
            component: "tarea_usuario",
            type: "getAll",
            key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
            key_empresa: Model.empresa.Action.getSelect()?.key,
        }).then(a => {
            this.setState({ data: a.data })
        })
    }
    render() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        const tareas = Model.tarea.Action.getAll();
        if (!tareas || !this.state.data) return <SLoad />
        // const tarea = Model.
        return <SPage>
            <Container>
                <SText fontSize={20} bold>{usuario.Nombres} {usuario.Apellidos}</SText>
                <SText fontSize={20} bold>TAREAS </SText>
                <SList data={tareas}
                    render={(tarea) => {
                        const tarea_usuario = Object.values(this.state.data).filter(a => a.key_tarea == tarea.key);
                        return <SView col={"xs-12"} padding={8} card onPress={() => {
                            if (tarea.url) {
                                const envs = {
                                    key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
                                    key_empresa: Model.empresa.Action.getSelect()?.key,
                                }
                                SNavigation.navigate(tarea.url, { key_empresa: envs.key_empresa });
                            }
                        }}>
                            <SText fontSize={16}>{tarea.descripcion}</SText>
                            <SText color={STheme.color.lightGray}>{tarea.observacion}</SText>
                            <SText fontSize={12} color={STheme.color.lightGray}>{tarea.url}</SText>
                            <SText col={"xs-12"} style={{ alignItems: "end" }} color={tarea_usuario.length > 0 ? STheme.color.success : STheme.color.warning}>{tarea_usuario.length > 0 ? `Realizado ${tarea_usuario.length} veces` : "Sin realizar"}</SText>
                        </SView>
                    }} />
            </Container>
        </SPage>
    }
}

//make this component available to the app
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);