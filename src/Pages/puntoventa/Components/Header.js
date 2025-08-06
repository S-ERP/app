import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SInput, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import Model from '../../../Model';
import FotoUsuario from './Foto/FotoUsuario';
export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let usuario = Model.usuario.Action.getUsuarioLog();
        let empresa = Model.empresa.Action.getSelect();
        return (
            <SView col={"xs-12"} row center height={60} backgroundColor={STheme.color.background} style={{ borderBottomWidth: 1, borderColor: STheme.color.card, }}  >
                <SView col={"xs-1 md-0.5"} style={{ paddingBottom: 4 }} center height
                    onPress={() => {
                        if (this.props.onBack) {
                            var prevent_default = this.props.onBack();
                            if (prevent_default) {
                                return;
                            }
                        }
                        SNavigation.goBack();
                    }}
                >   <SIconApp height={20} name={"Arrow"} fill={STheme.color.text} />
                </SView>
                <SView col={"xs-4 md-2"} row border="transparent" >
                    <SText fontSize={18} bold color={STheme.color.text} style={{ letterSpacing: -0.5, textTransform: "uppercase" }}> {empresa.razon_social}</SText>
                </SView>
                <SView flex />
                <SView col={"xs-7 md-5 lg-3"} height row center border="transparent" style={{ justifyContent: "flex-end" }}  >
                    <SView col={"xs-0 md-1 "} backgroundColor='transparent'> <SIconApp name="Wifi" width={20} height={20} fill={"#19b121ff"} /> </SView>
                    <SView flex />
                    <SView col={"xs-10 md-8"} row center backgroundColor='transparent'>
                        <SView center backgroundColor={"transparent"} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, overflow: "hidden", }} >
                            <FotoUsuario data={usuario} />
                        </SView>
                        <SText fontSize={14} color={STheme.color.text}> {usuario.Nombres + " " + usuario.Apellidos}</SText>
                    </SView>
                    <SView flex />
                    <SView col={"xs-1.5 md-1"} height style={{ paddingTop: 15 }} row center  > <SIconApp name="Menu2" width={28} stroke={STheme.color.text} fill={STheme.color.text} /> </SView>
                    <SView flex />
                </SView>
            </SView>
        );
    }
}