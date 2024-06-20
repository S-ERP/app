import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SMath, SPage, STable, STable2, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

export default class mispagos extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        SSocket.sendPromise({
            component: "solicitud_qr",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey()
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
                    fontSize: 14,
                }}
                header={[
                    { key: "index", label: "#", width: 30 },
                    {
                        key: "fecha_pago-1", label: "E", width: 20, component: (e) => {
                            if (!!e) {
                                return <SView backgroundColor={STheme.color.success} width={16} height={16}></SView>
                            } else {
                                return <SView backgroundColor={STheme.color.warning} width={16} height={16}></SView>
                            }
                        }
                    },
                    { key: "fecha_on", width: 120, order: "desc", render: e => !e ? "" : new SDate(e, 'yyyy-MM-ddThh:mm:ss').toString("yyyy-MM-dd hh:mm") },
                    { key: "monto", width: 80, cellStyle: { textAlign: "right" }, render: a => !a ? "" : SMath.formatMoney(a) },
                    { key: "nit", width: 100 },
                    { key: "razon_social", width: 100 },
                    { key: "fecha_vencimiento", width: 120, cellStyle: { textAlign: "center" }, render: e => !e ? "" : new SDate(e, 'yyyy-MM-ddThh:mm:ss').toString("yyyy-MM-dd hh:mm") },
                    { key: "fecha_pago", width: 120, render: e => !e ? "" : new SDate(e, 'yyyy-MM-ddThh:mm:ss').toString("yyyy-MM-dd hh:mm") },
                    { key: "qrid", width: 150 },
                    { key: "key", width: 30 },
                    { key: "key_empresa", width: 30 },
                    { key: "key_usuario", width: 30 },
                ]}
            />
        </SPage>
    }
}
