import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <SView col={"xs-12"} row center height={60} backgroundColor={STheme.color.background} style={{ borderBottomWidth: 1, borderColor: STheme.color.card, }}  >
                <SView col={"xs-2"} center><SText fontSize={24} bold color={STheme.color.text} style={{ letterSpacing: -0.5 }}>servisofts</SText> </SView>

                <SView flex />

                <SView col={"xs-3"} row center style={{ justifyContent: "flex-end" }}>
                    <SView style={{ marginLeft: 26 }}> <SIconApp name="Wifi" width={20} height={20} fill={"#6B7280"} /> </SView>
                    <SView center backgroundColor={"blue"} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} ><SText fontSize={12} bold color={"white"}> AS </SText> </SView>
                    <SText fontSize={14} color={STheme.color.text}> Alvaro Siles </SText>
                    <SView style={{ marginLeft: 16 }}>  </SView>
                </SView>
            </SView>
        );
    }
}

export default Header;
