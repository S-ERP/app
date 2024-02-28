//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHr, SIcon, SImage, SList, SLoad, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../Model';
import { connect } from 'react-redux';
import Container from '../Components/Container';
import SSocket from 'servisofts-socket';
import BoxMenu from '../Components/Popups/BoxMenu';

const Card = ({ label, value, backgroundColor, onPress, icon }) => {
    return <SView col={"xs-12 sm-6 md-6 lg-6 xl-6 xxl-6"} center padding={8}

    >
        <SView col={"xs-12"} height={70} row card center
            style={{
                borderRadius: 60,
                borderTopWidth: 1,
                borderTopColor: "#818286",
                borderBottomWidth: 5,
                borderBottomColor: "#818286",
                backgroundColor: STheme.color.white,
            }}
            onPress={onPress}>
            <SView col={"xs-3"} center>
                <SIcon name={icon} width={40} height={40} />
            </SView>
            <SView col={"xs-9"} center>
                <SText fontSize={17} bold color={STheme.color.black}>{value}</SText>

                <SText center fontSize={10} color={STheme.color.black}>{label}</SText>
                {/* <SHr height={15} /> */}
            </SView>
        </SView>
    </SView>
}

// create a component
class index extends Component {
    getAcciones(usuario) {
        return <SView row>
            {/* <SText padding={16} card onPress={() => {
                SNavigation.navigate("/empresa")
            }} center>Crear empresa</SText> */}
            <Card label={"Puedes construir tu propia empresa y personalizarla."} icon={"empresa"} value={"CREAR EMPRESA"} backgroundColor={STheme.color.success + "AA"} onPress={() => {
                SNavigation.navigate("/empresa")
            }} />
            <Card label={"Busca la empresa de tu preferencia para solicitar ser parte de ella."} icon={"empresaBuscar"} value={"BUSCAR EMPRESA"} backgroundColor={STheme.color.success + "AA"} onPress={() => {
                SNavigation.navigate("/empresa", {
                    onSelect: (empresa) => {
                        SPopup.confirm({
                            title: "¿Seguro que quiéres suscribirte a la empresa?",
                            message: "Se agregará un acceso directo de la empresa en la ventana de incio.",
                            onPress: () => {
                                if (!this.arr) return null;
                                console.log(this.arr)
                                let obj = Object.values(this.arr).find(a => a.key_empresa == empresa.key);
                                if (obj) {
                                    // SPopup.alert("Ya participas en esta empresa.")
                                    SPopup.alert("Ya eres parte de la empresa.")
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
            }} />
            <SView width={8} />
            {/* <SText padding={16} card onPress={() => {
                SNavigation.navigate("/empresa", {
                    onSelect: (empresa) => {
                        SPopup.confirm({
                            title: "¿Seguro que quiéres suscribirte a la empresa?",
                            message: "Se agregará un acceso directo de la empresa en la ventana de incio.",
                            onPress: () => {
                                if (!this.arr) return null;
                                console.log(this.arr)
                                let obj = Object.values(this.arr).find(a => a.key_empresa == empresa.key);
                                if (obj) {
                                    // SPopup.alert("Ya participas en esta empresa.")
                                    SPopup.alert("Ya eres parte de la empresa.")
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
            }} center>Buscar empresa</SText> */}
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
                <SHr height={10} />
                <SView col={"xs-12"} flex height style={{ alignItems: "flex-end" }}
                    onPress={() => {
                        SPopup.open({ key: "menuLat", content: <BoxMenu datas={this.props?.data} /> });
                    }}
                >
                    <SView width={45} height={45} center backgroundColor={STheme.color.secondary} style={{ borderRadius: 30, zIndex:9 }}>
                        <SIcon name="configurar" fill={STheme.color.primary} width={30} height={30} />
                    </SView>
                    <SView width={45} height={45} style={{position:"absolute", bottom:-8, right:-2.5}}>
                        <SIcon name="bgBoton" width={45} height={45} />
                    </SView>
                </SView>
                <SView width={150} height={150} style={{ padding: 4 }}>
                    <SView flex height card style={{ borderRadius: 100 }}>
                        <SImage src={SSocket.api.root + "usuario/" + Model.usuario.Action.getKey()} />
                    </SView>
                </SView>
                <SText fontSize={20} bold>Hola, {usuario.Nombres} {usuario.Apellidos}</SText>
                <SText fontSize={14}>{usuario.Correo}</SText>
                <SHr height={15} />
                <SIcon name="pregunta1" width={240} height={100} />
                <SHr height={15} />
                {/* <SText fontSize={14}>C.I.: {usuario.CI}</SText> */}
                {/* <SHr h={16} /> */}
                {this.getAcciones(usuario)}
                <SHr h={16} />
                {this.renderEmpresa(usuario)}
                <SHr height={30} />
            </Container>
        </SPage >
    }
}

//make this component available to the app
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);