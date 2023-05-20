import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Linking } from 'react-native'
import { SButtom, SHr, SIcon, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from "servisofts-socket"
import Model from '../Model';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getIconProfile() {
        return <SView col={"xs-12"} height>
            <SView col={"xs-12"} height style={{
                padding: 8
            }} >
                <SIcon name={"profile2"} fill={STheme.color.card} />
            </SView>
            <SImage
                src={SSocket.api.root + "usuario/" + Model.usuario.Action.getKey()}
                style={{ position: "absolute", resizeMode: "cover", borderWidth: 2, borderRadius: 12, borderColor: STheme.color.card, overflow: 'hidden', }}
            />
        </SView>
    }

    render() {
        if (!Model.usuario.Action.getUsuarioLog()) {
            SNavigation.replace("/login");
            return null;
        }
        return (
            <SPage title={''} onRefresh={(end) => {
                Model.usuarioPage.Action.CLEAR();
                end()

            }}>
                <SHr height={8} />
                <SView col={"xs-12"} center
                >
                    <SText fontSize={18} center>{"Bienvenido al sistema comercial "}</SText>
                    <SHr />
                    <SView width={200}>
                        <SIcon name={"logoCompleto"} fill={STheme.color.secondary} />
                    </SView>
                </SView>
                <SHr height={32} />

                <MenuPages path={"/"} permiso={"page"}>
                    <MenuButtom label={"Migrador2"} url={"/bots/amortizaciones"} icon={<SIcon name={"Box"}  fill='#f098a7'/>} />
                    <MenuButtom label={"Mi perfil"} url={"/profile"} icon={this.getIconProfile()} />
                    {/* <MenuButtom label={"Test"} url={"/test"} /> */}
                </MenuPages>
                <SHr height={100} />
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);