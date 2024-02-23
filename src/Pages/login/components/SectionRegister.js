
import React, { Component } from 'react';
import { SHr, SIcon, SNavigation, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';

export default class SectionRegister extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <SView col={"xs-12"} center row>

                
                <SHr height={20} />
                <SText fontSize={15} color={STheme.color.lightBlack}  font={"LondonMM"} onPress={() => { SNavigation.navigate('/login/recuperar'); }}>¿No tienes cuenta? </SText>
                <SText fontSize={15} color={STheme.color.text}  font={"LondonMM"} onPress={() => {
                            SNavigation.navigate("/registro")
                        }}
                        style={{textDecorationLine: 'underline'}}
                        >Regístrate</SText>

            </SView>
        );
    }
}
