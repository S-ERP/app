import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SDate, SHr, SImage, SPopup, SText, STheme, SView } from 'servisofts-component';
import InputSelector from '../../../../Components/Selectores/InputSelector';
import MDL from '../../../../MDL';
import SSocket from 'servisofts-socket';
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
        try {
            const resp = await SSocket.sendPromise({
                service: "inventario",
                component: "suscripcion",
                type: "getByKeyCompraVentaDetalle",
                key_compra_venta_detalle: this.props.data.key,
                estado: "cargando",
            });

            let cliente = {};
            if (resp?.data?.key_cliente) {
                try {
                    cliente = await MDL.crm.cliente.getByKey(resp.data.key_cliente) || {};
                } catch (error) {
                    console.error("Error al obtener datos del cliente:", error);
                }
            }

            const clientes = await MDL.crm.cliente.getAll();

            const _update_data = {
                ...resp.data,
                suscripciones: resp.data.suscripciones.map(subs => ({
                    ...subs,
                    cliente: clientes.find(a => a?.key === "83d10974-3f38-443a-8c74-2a60b49dfe15") || {}
                }))
            };

            this.setState({ data: _update_data });

        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    }



    render() {

        const _item = this.props.data;
        console.log("%c" + JSON.stringify(_item, null, 2), "color: #0eb3ffff; font-weight: bold;");

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
                height: 400,
                // height: 500,
                maxHeight: "100%",
                // backgroundColor: "red",
                backgroundColor: STheme.color.background + "F0",
                borderWidth: 1,
                borderColor: STheme.color.card,
                borderRadius: 8,

            }} withoutFeedback>
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    <SView row style={{ justifyContent: "space-between", alignItems: "center" }}>
                        {/* ACCIONES */}
                        <SView width={140} height={40} center border="cyan" style={{ borderRadius: 4, }} >
                            {/* <SView col={"xs-12"} backgroundColor='red' > */}
                            <SelectorCliente onSelect={(cliente) => { this.setState({ selectedCliente: cliente }); }} />
                            {/* </SView> */}
                        </SView>
                        <SView width={220} center     >
                            <FechasBetween onChange={(fecha_inicio, fecha_fin) => { this.setState({ fecha_inicio: fecha_inicio, fecha_fin: fecha_fin }); }} />
                        </SView>
                        <SView width={80} height={40} center backgroundColor={STheme.color.card} style={{ borderRadius: 4, }} >
                            <SView col={"xs-12"} height center card onPress={() => {
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
                            }} >

                                <SText >{"ENVIAR"}</SText> </SView>
                        </SView>
                    </SView>
                    <SHr height={24} />

   
                    {/* {this.state.data.suscripciones?.map((suscripcion) => {
                        return <SText padding={4}>{JSON.stringify(suscripcion)}</SText>
                    })} */}


                    {this.state.data.suscripciones?.map((suscripcion) => {
                        return <>
                            <SView col={"xs-12"} row style={{ justifyContent: "space-between", padding: 8, borderRadius: 8 }} border={STheme.color.card}   >
                                <SView col={"xs-12"} row center  >
                                    <SView width={40} height={40} style={{ padding: 4 }}>
                                        <SView flex height card style={{ overflow: 'hidden', }}>
                                            <SImage src={SSocket.api.inventario + "modelo/.128_" + this.state.data.key_modelo} />
                                        </SView>
                                    </SView>
                                    <SView flex>
                                        <SText fontSize={12} color={STheme.color.text}>{_item.nombre} </SText>
                                        <SText bold fontSize={13}>{_item.precio} {_item.moneda.observacion} </SText>
                                    </SView>
                                    <SView width={8} />
                                    <SView width={40} height={40} style={{ padding: 4 }}>
                                        <SView flex height card style={{ overflow: 'hidden', }}>
                                            <SImage src={`${SSocket.api.root}usuario/${suscripcion.key_cliente}`} enablePreview style={{ resizeMode: "cover", }} />
                                        </SView>
                                    </SView>
                                    <SView flex>
                                        <SText fontSize={12} color={STheme.color.text}>Cliente</SText>
                                        <SText bold fontSize={13}>{suscripcion.cliente.nombres}</SText>
                                    </SView>
                                </SView>
                                <SHr height={8} />
                                <SText>Sucrpcion Activa </SText>
                                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}   >
                                    <SView flex border="#56bb78" backgroundColor='#e1f0e6' style={{ padding: 10, borderRadius: 8, borderWidth: 1 }}>
                                        <SText color="#56bb78" bold style={{ paddingBottom: 2, fontSize: 10 }}>FECHA INICIO</SText>
                                        <SText color={STheme.color.primary} bold fontSize={13}>{new SDate(suscripcion.fecha_inicio).toString("dd MON yyyy")}</SText>
                                    </SView>
                                    <SView width={20} />
                                    <SView flex border="#df1313" backgroundColor='#dfc0c0' style={{ padding: 10, borderRadius: 8, borderWidth: 1 }}>
                                        <SText color="#df1313" bold style={{ paddingBottom: 2, fontSize: 10 }}>FECHA FIN</SText>
                                        <SText color={STheme.color.primary} bold fontSize={13}>{new SDate(suscripcion.fecha_fin).toString("dd MON yyyy")}</SText>
                                    </SView>
                                </SView>
                            </SView>
                            <SHr height={16} />
                        </>
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
        width: "100%",
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