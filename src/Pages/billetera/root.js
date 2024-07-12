import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SInput, SLoad, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';

import Container from '../../Components/Container';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import UsuariosNota from './Components/UsuariosNota';
import ChangeColor from './Components/ChangeColor';
import PButtom3 from '../../Components/PButtom3';


export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk", SUuid())
    }

    content() {
        return (
            <SView col={"xs-12"} >
                <SView card width={80} height={50} center
                onPress={() => {
                    SNavigation.navigate("/billetera/cargar")
                }}
                >
                    <SText >Cargar</SText>
                </SView>
            </SView>
        )
    }


    render() {
        return <SPage title="Mi Billera"  >
            <Container>
                {this.content()}
            </Container>
        </SPage>
    }
}
