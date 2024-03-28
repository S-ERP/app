import React, { Component } from 'react';
import { View, Text, Linking } from 'react-native';
import { SDate, SIcon, SPage, STable, STable2, SText, STheme, SView } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

export default class libro_ventas extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "getAll",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }

    render() {
        return <SPage title={"Facturacion - libro ventas"} disableScroll>
            <STable2 data={this.state?.data ?? {}}
                rowHeight={30}
                cellStyle={{
                    fontSize: 12,
                    padding: 4,
                    overflow: 'hidden',
                }}

                header={[
                    { key: "index", width: 30, label: "#" },
                    // { key: "key_empresa", width: 200, label: "Empresa" },
                    {
                        key: "-verensiat", width: 50, label: "SIAT",
                        render: a => `https://pilotosiat.impuestos.gob.bo/consulta/QR?nit=${a.data.nit}&cuf=${a.data.cuf}&numero=${a.data.numeroFactura}&t=1`,
                        component: a => <SText color={STheme.color.link} underLine onPress={() => Linking.openURL(a)}>{"SIAT"}</SText>

                    },
                    {
                        key: "data/estado-a", label: "EC", width: 50, component: (e) => {
                            if (e == "enviada") {
                                return <SView backgroundColor={STheme.color.success} width={40} height={20}></SView>
                            } else if (e == "procesando") {
                                return <SView backgroundColor={STheme.color.gray} width={40} height={20}></SView>
                            } else if (e == "emitida") {
                                return <SView backgroundColor={STheme.color.warning} width={40} height={20}></SView>
                            } else if (e == "anulada") {
                                return <SView backgroundColor={STheme.color.danger} width={40} height={20}></SView>
                            }
                        }
                    },
                    // { key: "data/estado", width: 70, label: "Estado" },
                    { key: "data/fechaHora", width: 120, label: "Fecha", order: "asc", type: "date", render:a=>new SDate(a,"yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm:ss") },
                    { key: "data/numeroFactura", width: 60, label: "Numero" },
                    { key: "data/cliNit", width: 80, label: "NIT/CI CLIENTE" },
                    { key: "data/cliRazonSocial", width: 150, label: "NOMBRE O RAZON SOCIAL" },
                    { key: "data/codigoControl", width: 120, label: "Codigo de control" },
                    { key: "data/cuf", width: 270, label: "CUF" },

                ]}
            />
        </SPage>
    }
}
