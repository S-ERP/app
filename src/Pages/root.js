//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SHr, SIcon, SImage, SList, SLoad, SNavigation, SPage, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import Model from '../Model';
import { connect } from 'react-redux';
import Container from '../Components/Container';
import SSocket from 'servisofts-socket';
import BoxMenu from '../Components/Popups/BoxMenu';
import STextPlay from '../Components/STextPlay';

const Card = ({ label, value, backgroundColor, onPress, icon }) => {
    return <SView col={"xs-12 sm-6 md-6 lg-6 xl-6 xxl-6"} padding={2}
    >
        <SView col={"xs-12"} height={75} row card center
            style={{
                borderRadius: 8,
                borderTopWidth: 1,
                borderTopColor: STheme.color.text,
                borderLeftWidth: 1,
                borderLeftColor: STheme.color.text,
                borderRightWidth: 1,
                borderRightColor: STheme.color.text,
                borderBottomWidth: 5,
                borderBottomColor: STheme.color.text,
                backgroundColor: STheme.color.card,
            }}
            onPress={onPress}>
            <SHr height={10} />
            <SView col={"xs-3"} center>
                <SIcon name={icon} width={40} height={40} fill={STheme.color.text} />
            </SView>
            <SView col={"xs-9"} center>
                <SText fontSize={17} bold color={STheme.color.text}>{value}</SText>
                <SText center fontSize={10} color={STheme.color.text}>{label}</SText>
            </SView>
            <SHr height={15} />
        </SView>
        <SHr height={4} />
    </SView>
}

// create a component
class index extends Component {
    getAcciones(usuario) {
        return <SView row>
            {/* <SText padding={16} card onPress={() => {
                SNavigation.navigate("/empresa/new")
            }} center>Crear empresa</SText>
            <SView width={8} /> */}
            {/* <SText padding={16} card onPress={() => {
                SNavigation.navigate("/empresa")
            }} center>Crear empresa</SText> */}
            <Card label={"Puedes construir tu propia empresa y personalizarla."} icon={'empresa'} value={"CREAR EMPRESA"} backgroundColor={STheme.color.success + "AA"} onPress={() => {
                SNavigation.navigate("/empresa/new")
            }} />
            <Card label={"Busca la empresa de tu preferencia para solicitar ser parte de ella."} icon={'empresaBuscar'} value={"BUSCAR EMPRESA"} backgroundColor={STheme.color.success + "AA"} onPress={() => {
                SNavigation.navigate("/empresa", {
                    onSelect: (empresa) => {
                        SPopup.confirm({
                            title: "¿Seguro que quieres suscribirte a la empresa?",
                            message: "Se agregará un acceso directo de la empresa en la ventana de inicio.",
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
                            title: "¿Seguro que quieres suscribirte a la empresa?",
                            message: "Se agregará un acceso directo de la empresa en la ventana de inicio.",
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

        return <SView col={"xs-12"} center >
            <SHr height={10} />
            <SView col={"xs-12"}>
                <SText fontSize={17} bold >Selecciona la empresa de tu preferencia.</SText>
            </SView>
            <SHr height={15} />
            <SList
                buscador
                data={this.arr}
                render={(a) => {
                    return <SView col={"xs-12"} card padding={8} row onPress={() => {
                        Model.empresa.Action.setEmpresa(a.empresa);
                        let time = Platform.select({ web: 400, native: 800 });
                        new SThread(time, "sadasd").start(() => {
                            SNavigation.goBack();
                            // SNavigation.
                        })

                        // SNavigation.navigate("/empresa/profile", { pk: a.key_empresa })
                    }}>
                        <SView width={40} height={40} card>
                            <SImage src={Model.empresa._get_image_download_path(SSocket.api, a?.empresa?.key)} style={{
                                resizeMode: "cover"
                            }} />
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
        </SView >

    }
    render() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        if (!usuario) {
            SNavigation.replace("/login");
            return null;
        }
        return <SPage>
            <Container >
                <SHr height={10} />
                <SView style={{ alignItems: "flex-end", position: "absolute", top: 2, right: 2, }}
                    onPress={() => {
                        SPopup.open({ key: "menuLat", content: <BoxMenu datas={this.props?.data} /> });
                    }}
                >
                    <SView width={45} height={45} center backgroundColor={STheme.color.card} style={{ borderRadius: 30, zIndex: 9, }}>
                        <SIcon name="configurar" fill={STheme.color.text} width={25} height={25} />
                    </SView>
                </SView>
                <SView width={150} height={150} style={{ padding: 4 }}>
                    <SView flex height card style={{ borderRadius: 100, overflow: "hidden" }}>
                        <SImage src={SSocket.api.root + "usuario/" + Model.usuario.Action.getKey()} style={{
                            resizeMode: "cover"
                        }} />
                    </SView>
                </SView>
                <SHr />
                {/* <SText fontSize={20} bold>Hola, {usuario.Nombres} {usuario.Apellidos}</SText> */}
                <STextPlay time={50} fontSize={18} bold center>{`Hola, ${usuario.Nombres} ${usuario.Apellidos} \n¿Qué deseas hacer? `}</STextPlay>
                {/* <SText fontSize={14}>{usuario.Correo}</SText> */}
                <SHr height={15} />
                {/* <SView width={240} height={100} >
                    <SIcon name="pregunta1" width={240} height={100} fill={STheme.color.card}/>
                    <SView style={{
                        position: "absolute",
                        width: "100%",
                        height: "90%",
                        top: 0,
                        right: 0,
                    }} center>
                        <STextPlay fontSize={18} bold>{"¿Qué deseas hacer?"}</STextPlay>
                    </SView>
                </SView> */}
                {/* <SHr height={15} /> */}
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