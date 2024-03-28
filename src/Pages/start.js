import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native'
import { SButtom, SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from "servisofts-socket"
import Model from '../Model';
import Components from '../Components';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        // if (!Model.usuario.Action.getUsuarioLog()) {
        //     console.log("ggggggg")

        //     SNavigation.replace("/login");
        //     return null;
        // }
        return (
            <SPage title={''} center onRefresh={(end) => {
                Model.usuarioPage.Action.CLEAR();
                end()

            }}>
                <SHr height={10} />
                <SView width={150} height={150} style={{ padding: 4 }}>
                    <SView flex height card style={{ borderRadius: 100 }}>
                        <SImage src={SSocket.api.root + "usuario/" + Model.usuario.Action.getKey()} />
                    </SView>
                </SView>
                <SHr height={15} />
                <SText  >Hola, José Carlos</SText>
                <SHr height={15} />

                <SIcon name="pregunta1" width={240} height={100} />

                <SHr height={15} />
                <SView row center height={90}
                    style={{
                        borderRadius: 60,
                        borderTopWidth: 1,
                        borderTopColor: "#818286",
                        borderBottomWidth: 5,
                        borderBottomColor: "#818286",
                        backgroundColor: STheme.color.white,
                    }} col={"xs-11"}>
                    <SView col={"xs-3"}>
                        <SIcon name="empresa" width={50} height/>
                    </SView>
                    <SView col={"xs-6"} center >
                        <SText style={{color:"000000", fontSize:18}} bold  >CREAR EMPRESA</SText>
                        <SHr></SHr>
                        <SText style={{color:"000000", fontSize:15}} center >Puedes construir tu propia empresa y personalizarla.</SText>
                    </SView>

                </SView>
                <SHr height={15} />
                <SHr height={15} />
                <SView row center height={90}
                    style={{
                        borderRadius: 60,
                        borderTopWidth: 1,
                        borderTopColor: "#818286",
                        borderBottomWidth: 5,
                        borderBottomColor: "#818286",
                        backgroundColor: STheme.color.white,
                    }} col={"xs-11"}>
                    <SView col={"xs-3"}>
                        <SIcon name="empresaBuscar" width={50} height/>
                    </SView>
                    <SView col={"xs-6"} center >
                        <SText style={{color:"000000", fontSize:18}} bold >BUSCAR EMPRESA</SText>
                        <SHr></SHr>
                        <SText style={{color:"000000", fontSize:15}} center>Busca la empresa de tu preferencia para solicitar ser parte de ella.</SText>
                    </SView>

                </SView>

            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);