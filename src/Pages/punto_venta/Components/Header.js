import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <SView col={"xs-12"} row center height={60} backgroundColor={STheme.color.background} style={{ borderBottomWidth: 1, borderColor: STheme.color.card, }}  >


                <SView col={"xs-0.5"} style={{ paddingBottom: 4 }} center height
                    onPress={() => {
                        if (this.props.onBack) {
                            var prevent_default = this.props.onBack();
                            if (prevent_default) {
                                return;
                            }
                        }
                        SNavigation.goBack();
                    }}
                >   <SIconApp height={24} name={"Arrow"} fill={STheme.color.text} />
                </SView>


                <SView col={"xs-2"}  ><SText fontSize={24} bold color={STheme.color.text} style={{ letterSpacing: -0.5 }}>Servisofts</SText> </SView>

                <SView flex />

                <SView col={"xs-4"} row center style={{ justifyContent: "flex-end" }}  >
                    <SView style={{ marginRight: 26 }}> <SIconApp name="Wifi" width={20} height={20} fill={"#6B7280"} /> </SView>
                    <SView style={{ marginRight: 16 }} row center>
                        <SView center backgroundColor={"blue"} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} ><SText fontSize={12} bold color={"white"}> AS </SText> </SView>
                        <SText fontSize={14} color={STheme.color.text}> Alvaro Siles </SText>
                    </SView>
                    <SView style={{ marginRight: 16, top: 6 }} row center > <SIconApp name="Menu2"   width={24} height={24} stroke={STheme.color.text} fill={STheme.color.text} /> </SView>
                </SView>
            </SView>
        );
    }
}

export default Header;
