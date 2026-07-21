import React, { Component } from 'react';
import { Platform } from 'react-native';
import { SHr, SIcon, SImage, SList, SLoad, SNavigation, SPage, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import Model from '../Model';
import { connect } from 'react-redux';
import Container from '../Components/Container';
import SSocket from 'servisofts-socket';
import BoxMenu from '../Components/Popups/BoxMenu';
import STextPlay from '../Components/STextPlay';

const Card = ({ label, value, backgroundColor, onPress, icon }) => {
    return <SView col={"xs-12"} padding={2}
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
                alignItems: "center",
                padding: 4,
            }}
            onPress={onPress}>
            <SView width={40} height={40} center padding={4}>
                <SIcon name={icon} fill={STheme.color.text} />
            </SView>
            <SView flex center>
                <SText fontSize={15} bold color={STheme.color.text}>{value}</SText>
                <SText center fontSize={10} style={{ maxWidth: 150 }} color={STheme.color.text}>{label}</SText>
            </SView>
        </SView>
        <SHr height={4} />
    </SView>
}

// create a component
class index extends Component {
    static HIDDEN = true;

    componentDidMount() {
        this.checkUsuario();
    }
    componentDidUpdate() {
        this.checkUsuario();
    }
    checkUsuario() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        if (!usuario) {
            SNavigation.replace("/login");
        }
    }

    getAcciones(usuario) {
        return <SView row center>
            <Card label={"Puedes construir tu propia empresa y personalizarla."} icon={'empresa'} value={"CREAR EMPRESA"} backgroundColor={STheme.color.success + "AA"} onPress={() => {
                SNavigation.navigate("/empresa/new")
            }} />
            <SView width={8} />
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
                order={[{
                    key: "fecha_ultima_visita",
                    order: "desc",
                    type: "date"
                }]}
                render={(a) => {
                    return <SView col={"xs-12"} card padding={8} row onPress={() => {
                        Model.empresa.Action.setEmpresa(a.empresa);
                        let time = Platform.select({ web: 400, native: 800 });
                        new SThread(time, "sadasd").start(() => {
                            SNavigation.goBack();
                        })
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
                        </SView>
                    </SView>
                }}
            />
        </SView >

    }
    render() {
        const usuario = Model.usuario.Action.getUsuarioLog();
        if (!usuario) {
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
                <STextPlay time={50} fontSize={18} bold center>{`Hola, ${usuario.Nombres} ${usuario.Apellidos} \n¿Qué deseas hacer? `}</STextPlay>
                <SHr height={15} />
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