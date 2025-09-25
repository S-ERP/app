import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SNavigation, SPage, STable, STable2, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        return <SPage title={"Solicitudes QR"} disableScroll>
            <Container>
                <SHr h={32} />
                <SText bold underLine onPress={() => SNavigation.navigate("/solicitud_qr/mispagos")}>{"MIS PAGOS"}</SText>
                <SHr h={32} />
                <SText bold underLine onPress={() => SNavigation.navigate("/solicitud_qr/reporte")}>{"TODOS LOS PAGOS"}</SText>
                <SHr h={32} />
                <SText bold underLine onPress={() => SNavigation.navigate("/solicitud_qr/table")}>{"TODOS LOS PAGOS NUEVA TABLA"}</SText>
            </Container>
        </SPage>
    }
}
