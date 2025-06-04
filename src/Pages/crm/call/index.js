import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SNavigation, SPage, SText, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SMD from '../../../SMD';
import OrdenesConMismoNumero from '../Components/OrdenesConMismoNumero';

const CardContent = ({ children }) => {
    return <SView col={"xs-4"} padding={8} center>
        <SView col={"xs-12"} card padding={8}>
            {children}
        </SView>
    </SView>
}


export default class index extends Component {
    pk = SNavigation.getParam("key");
    state = {
        data: null,
    }
    componentDidMount() {
        MDL.crm.clienteProyecto.getFull(this.pk).then((e) => {
            this.setState({ data: e })
        })
    }

    render() {
        const { proyecto, state, fecha_on } = this.state.data || {};
        return <SPage title={"Call"}>
            <SView row col={"xs-12"} style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <CardContent>
                    <SText>{state}</SText>
                    <SHr />
                    <SText>{fecha_on}</SText>
                </CardContent>
                <CardContent>
                    <SMD padding={0} fontSize={12} space={0}>{proyecto?.guion}</SMD>
                </CardContent>
                <CardContent>
                    <OrdenesConMismoNumero key_cliente_proyecto={this.pk} />
                </CardContent>
            </SView>
        </SPage >
    }
}
