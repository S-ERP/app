import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage, STable, STable2, SText } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        SSocket.sendPromise({
            component: "solicitud_qr",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey()
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {
            console.log(e);
        })
    }
    render() {
        return <SPage title={"Solicitudes QR"} disableScroll>
            <STable2
                data={this.state?.data ?? {}}
                rowHeight={20}
                limit={50}
                cellStyle={{
                    padding: 2,
                }}
                header={[
                    { key: "index", label: "#", width: 30 },
                    { key: "qrid", width: 150 },
                    { key: "monto", width: 80, cellStyle: { textAlign: "center" } },
                    { key: "nit", width: 100 },
                    { key: "razon_social", width: 100 },
                    { key: "fecha_vencimiento", width: 140, cellStyle: { textAlign: "center" } },
                    { key: "fecha_pago", width: 180 },
                    { key: "key", width: 180 },
                    { key: "key_empresa", width: 180 },
                    { key: "key_usuario", width: 180 },
                ]}
            />
        </SPage>
    }
}
