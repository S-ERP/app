import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SLoad, SNavigation, SPage, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

export default class llamar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        SSocket.sendPromise({
            service: "crm",
            component: "cliente_proyecto",
            type: "get_siguiente",
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            const first = e.data[0];
            if(!first) return;
            SNavigation.replace("/crm/plantilla", { key: first.key })
            console.log("Siguiente Lead:", e);
        }).catch(error => {
            console.error("Error al obtener el siguiente lead:", error);
        });
    }
    render() {
        return <SPage title={"Llamar"} center>
            <SLoad />
            <SHr h={64} />
            <SText fontSize={22}>{"Buscando un lead para llamar..."}</SText>
        </SPage>
    }
}
