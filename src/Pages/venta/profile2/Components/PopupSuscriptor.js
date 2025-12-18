import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SInput, SPopup, SText, STheme, SView } from 'servisofts-component';
import InputSelector from '../../../../Components/Selectores/InputSelector';
import MDL from '../../../../MDL';
import SSocket from 'servisofts-socket';
import { C } from 'jssip';
import FechasBetween from '../../../../Components/FechasBetween';

export default class PopupSuscriptor extends Component {
    static open(props) {
        SPopup.open({
            key: "popup-suscriptor",
            type: "1",
            content: <PopupSuscriptor {...props} />
        })
    }
    static close() {
        SPopup.close("popup-suscriptor");
    }
    constructor(props) {
        super(props);
        this.state = {
            data: {}
        };
    }
    componentDidMount() {
        this.loadData();
    }

    async loadData() {

        const resp = await SSocket.sendPromise({
            service: "inventario",
            component: "suscripcion",
            type: "getByKeyCompraVentaDetalle",
            key_compra_venta_detalle: this.props.data.key,
            estado: "cargando",
        })
        this.setState({ data: resp.data })
    }

    render() {
        return <SView style={{
            width: "100%",
            height: "100%",
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <SView style={{
                width: "100%",
                maxWidth: 500,
                height: 500,
                maxHeight: "100%",
                backgroundColor: STheme.color.background + "F0",
                borderWidth: 1,
                borderColor: STheme.color.card,
                borderRadius: 8,

            }} withoutFeedback>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {/* <SText center>{"Suscripciones"}</SText>
                    <SText bold>{"data"}</SText>
                    <SText>{JSON.stringify(this.props)}</SText>
                    <SText bold>{"producto"}</SText>
                    <SText>{JSON.stringify(this.state.data)}</SText>
                    <SText bold>{"cliente"}</SText>
                    <SText>{JSON.stringify(this.state.selectedCliente)}</SText>
                    <SHr /> */}
                    {/* <InfoItem data={this.props.data} /> */}
                    <SView row>
                        <SelectorCliente onSelect={(cliente) => {
                            this.setState({ selectedCliente: cliente });
                        }} />
                        <SView width={300}>
                            <FechasBetween onChange={(fecha_inicio, fecha_fin) => {
                                console.log(fecha_inicio, fecha_fin)
                                this.setState({ fecha_inicio: fecha_inicio, fecha_fin: fecha_fin });
                            }} />
                        </SView>
                    </SView>
                    <SHr />
                    <SView onPress={() => {
                        SSocket.sendPromise({
                            service: "inventario",
                            component: "suscripcion",
                            type: "registro",
                            data: {
                                key_producto: this.state.data.key,
                                key_cliente: this.state.selectedCliente.value,
                                fecha_inicio: this.state.fecha_inicio,
                                fecha_fin: this.state.fecha_fin,
                            },
                            key_usuario: MDL.usuario.session.key,
                        }).then((resp) => {
                            this.loadData();
                        }).catch((e) => {
                            console.error(e);
                        })
                    }} padding={8} card>
                        <SText>{"ENVIAR"}</SText>
                    </SView>
                    {this.state.data.suscripciones?.map((suscripcion) => {
                        return <SText padding={4}>{JSON.stringify(suscripcion)}</SText>
                    })}
                </ScrollView>
            </SView>
        </SView>
    }
}

const SelectorCliente = (props) => {
    const [state, setState] = React.useState({
        clientes: [],
    });

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const clientes = await MDL.crm.cliente.getAll();
        setState({ ...state, clientes });
    }
    return <SView style={{
        width: 200,
        height: 40,
        backgroundColor: STheme.color.card
    }}>
        <InputSelector
            options={state.clientes.map(cliente => ({
                label: cliente.nombres ?? "-", value: cliente.key, customComponent: (e) => {
                    return <>
                        <SText fontSize={12} color={STheme.color.card}>{cliente.correo}</SText>
                        <SText fontSize={12} color={STheme.color.card}>{cliente.telefono}</SText>
                    </>
                }
            }))}
            onSelect={props.onSelect}


        />
    </SView>
}


const InfoItem = (props) => {
    const data = props.data;
    return <SView col={"xs-12"} row center>
        <SView flex>
            <SText>{data.nombre}</SText>
        </SView>
        <SView>
            <SText>{data.cantidad}</SText>
        </SView>
    </SView>
}