import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SInput, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import SSocket from 'servisofts-socket';
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
                    <SText fontSize={24} bold color={STheme.color.text} style={{ letterSpacing: -0.5, textTransform: "uppercase" }}> {empresa.razon_social}</SText></SView>

                <SView flex />

                <SView col={"xs-7 md-4"} row center border="transparent"  style={{ justifyContent: "flex-end" }}  >
                    <SView style={{ marginRight: 26 }}> <SIconApp name="Wifi" width={20} height={20} fill={"#19b121ff"} /> </SView>
                    <SView style={{ marginRight: 16 }} row center>
                        <SView center backgroundColor={"transparent"} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8, overflow: "hidden", }} >
                            <FotoUsuario data={usuario} />
                        </SView>
                        <SText fontSize={14} color={STheme.color.text}> {usuario.Nombres + " " + usuario.Apellidos}</SText>
                    </SView>
                    <SView style={{ marginRight: 16, top: 6 }} row center > <SIconApp name="Menu2" width={24} height={24} stroke={STheme.color.text} fill={STheme.color.text} /> </SView>
                </SView>
            </SView>
        );
    }
}