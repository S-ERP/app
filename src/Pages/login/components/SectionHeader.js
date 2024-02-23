
import React, { Component } from 'react';
import { SHr, SIcon, SNavigation, SText, STheme, SView } from 'servisofts-component';
import PButtom2 from '../../../Components/PButtom2';
export default class SectionHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SView col={"xs-12"} center >
                <SView col={"xs-12"} height={100} >
                    <SIcon name={"logowhite"} fill={STheme.color.text} />
                </SView>
                <SHr height={20} />
                <SView col={"xs-12"} height={40} row center>
                    <SText fontSize={20} color={STheme.color.lightBlack} >Iniciar Sesión</SText>
                    {/* <SView col={"xs-6"} height card>
                        <PButtom2 outline={true} onPress={() => {
                            SNavigation.navigate("/registro")
                        }}>Registro</PButtom2>
                    </SView> */}

                </SView>
            </SView>
        );
    }
}
