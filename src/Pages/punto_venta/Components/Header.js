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
            <SView
                col={"xs-12"}
                row
                center
                height={60}
                backgroundColor={STheme.color.background}
                style={{
                    borderBottomWidth: 1,
                    // borderBottomColor: STheme.color.card,
                    // borderTopColor: STheme.color.card,


                    borderColor: STheme.color.card,

                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
            >
                {/* Logo */}
                <SView col={"xs-2"} center>
                    <SText fontSize={24} bold color={STheme.color.text} style={{ letterSpacing: -0.5 }}>
                        servisofts
                    </SText>
                </SView>

                <SView flex />

                {/* Search */}
                <SView col={"xs-4"} center>
                    <SView
                        row
                        center
                        // backgroundColor={"red"}
                        style={{
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: STheme.color.card,
                            paddingHorizontal: 12,
                        }}
                    >
                        <SInput
                            placeholder="Search product"
                            style={{
                                flex: 1,
                                fontSize: 14,
                                backgroundColor: "transparent"
                                // color: STheme.color.text
                            }}
                            value={this.props.value}
                            onChangeText={this.props.onChangeText}
                        />
                        <SIconApp name="Search" width={16} height={16} fill={"#6B7280"} />
                    </SView>
                </SView>

                {/* User Info */}
                <SView col={"xs-3"} row center style={{ justifyContent: "flex-end" }}>
                    <SView
                        center
                        backgroundColor={"blue"}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            marginRight: 8,
                        }}
                    >
                        <SText fontSize={12} bold color={"white"}> AS
                        </SText>
                    </SView>
                    <SText fontSize={14} color={STheme.color.text}>
                        Alvaro Siles
                    </SText>
                    <SView style={{ marginLeft: 16 }}>
                        <SIconApp name="wifi" width={20} height={20} fill={"#6B7280"} />
                    </SView>
                </SView>
            </SView>
        );
    }
}

export default Header;
