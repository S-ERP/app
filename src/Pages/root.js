//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHr, SImage, SList, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../Model';
import { connect } from 'react-redux';
import Container from '../Components/Container';
import SSocket from 'servisofts-socket';

// create a component
class index extends Component {
    getAcciones(usuario) {
        return <SView row>
            <SText padding={16} card onPress={() => {
                SNavigation.navigate("/empresa/new")
            }} center>Crear empresa</SText>
            <SView width={8} />
            <SText padding={16} card onPress={() => {
                SNavigation.navigate("/empresa", {
                    onSelect: (empresa) => {
                        SPopup.confirm({
                            title: "Seguro que quieres suscribirte a la empresa?",
                            message: "Se agregara un acceso directo de la empresa en la venta de incio.",
                            onPress: () => {
                                if (!this.arr) return null;
                                console.log(this.arr)
                                let obj = Object.values(this.arr).find(a => a.key_empresa == empresa.key);
                                if (obj) {
                                    SPopup.alert("Ya participas en esta empresa.")
                                    return;

                                }
                                Model.empresa_usuario.Action.registro({
                                    data: {
                                        key_usuario: usuario.key,
                                        key_empresa: empresa.key,
                                        alias: `${usuario.Nombres} ${usuario.Apellidos}`,
                                        empresa: empresa
                                    }
                                })
                            }
                        })
                    }
                })
            }} center>Buscar empresa</SText>
        </SView>
    }
    renderEmpresa = (usuario) => {
        this.arr = Model.empresa_usuario.Action.getAllByKeyUsuario(usuario.key);
        if (!this.arr) return <SLoad />

        return <SView col={"xs-12"} center>
            <SList
                buscador
                data={this.arr}
                render={(a) => {
                    return <SView col={"xs-12"} card padding={8} row onPress={() => {
                        Model.empresa.Action.setEmpresa(a.empresa);
                        SNavigation.navigate("/menu")
                        // SNavigation.navigate("/empresa/profile", { pk: a.key_empresa })
                    }}>
                        <SView width={40} height={40} card>
                            <SImage src={Model.empresa._get_image_download_path(SSocket.api, a?.empresa?.key)} />
                        </SView>
                        <SView width={8} />
                        <SView flex>
                            <SText bold fontSize={16}>{a?.empresa?.razon_social}</SText>
                            <SText color={STheme.color.gray}>{a?.empresa?.nit}</SText>
                            <SHr />
                            <SText >Tu alias: {a?.alias}</SText>
                        </SView>
                    </SView>
                }}
            />
        </SView>

    }
    render() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        if (!usuario) {
            SNavigation.replace("/login");
            return null;
        }
        return <SPage>
            <Container>
                <SText fontSize={20} bold>{usuario.Nombres} {usuario.Apellidos}</SText>
                <SText fontSize={14}>{usuario.Correo}</SText>
                {/* <SText fontSize={14}>C.I.: {usuario.CI}</SText> */}
                <SHr h={16} />
                {this.getAcciones(usuario)}
                <SHr h={16} />
                {this.renderEmpresa(usuario)}
            </Container>
        </SPage>
    }
}

//make this component available to the app
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);