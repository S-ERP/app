import React, { Component } from 'react';
import { SHr, SIcon, SText, STheme, SView } from 'servisofts-component';
import Svg from 'servisofts-component/img/Svg';

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SView col={"xs-12"} center backgroundColor={STheme.color.secondary}>
                <SHr height={30} />
                <SView col={"xs-11"} height={120} center>
                    <SIcon name={"Logo"} fill={STheme.color.primary} />
                </SView>
                <SHr height={16} />
                <SView center col={"xs-10"}>
                    <SText center fontSize={18} color={STheme.color.primary}>{this.props?.title}</SText>
                </SView>
                <SHr height={20} />
                <SView col={"xs-12"} center
                style={{
                    // position: "absolute",
                    bottom: -2,
                    backgroundColor: STheme.color.primary,
                    height:30,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,

                }}>

                </SView>
            </SView>
        );
    }
}
