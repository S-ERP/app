import React, { Component } from 'react';
import { SHr, SIcon, SText, STheme, SView } from 'servisofts-component';
import Svg from 'servisofts-component/img/Svg';
import DomainLogo from '../../../Components/Domain/DomainLogo';

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SView col={"xs-12"} center backgroundColor={STheme.color.secondary}>
                <SHr height={15} />
                <SView col={"xs-11"} height={80} center>
                    {/* <SIcon name={"Logo"} fill={STheme.color.primary} /> */}
                    <DomainLogo />
                </SView>
                <SHr height={16} />
                <SView center col={"xs-10"}>
                    <SText center fontSize={16} color={STheme.color.primary}>{this.props?.title}</SText>
                </SView>
                <SHr height={20} />
                <SView col={"xs-12"} center
                    style={{
                        // position: "absolute",
                        bottom: -2,
                        backgroundColor: STheme.color.primary,
                        height: 30,
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,

                    }}>

                </SView>
            </SView>
        );
    }
}
