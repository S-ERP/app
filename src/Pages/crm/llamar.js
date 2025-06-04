import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
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
            key_usuario: Model.usuario.Action.getKey(),
        }).then(e => {
            const first = e.data;
            if (!first) return;
            SNavigation.replace("/crm/call", { key: first.key })
            console.log("Siguiente Lead:", e);
        }).catch(error => {
            this.setState({ error: "No hay leads disponibles" });
            console.error("Error al obtener el siguiente lead:", error);
        });
    }
    render() {
        return <SPage title={"Llamar"} center>
            {this.state.error ? <SView center>
                <SText color={STheme.color.danger} fontSize={18}>{this.state.error}</SText>
                <SHr h={16} />
                <SView onPress={() => SNavigation.replace("/crm/llamar")} style={{ padding: 8, backgroundColor: STheme.color.primary, borderRadius: 4 }}>
                    <SText color={STheme.color.text}>Volver a intentar</SText>
                </SView>
            </SView>
                : <SView center>
                    <SLoad />
                    <SHr h={64} />
                    <SText fontSize={22}>{"Buscando un lead para llamar..."}</SText>
                </SView>}
        </SPage>
    }
}
