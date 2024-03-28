import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SForm, SHr, SIcon, SInput, SLoad, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

type emitirType = {
    nit: SInput,
    razon_social: SInput
}
const ambiente = 2;
export default class emitir extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cliNit: "454561021",
            cliRazonSocial: "SERVISOFTS SRL",
            codigoSucursal: "0",
            codigoPuntoVenta: "0",
            monto: "100.00",
            codigoTipoDocumentoIdentidad: 1,
            codigoMetodoPago: 1,
            codigoMoneda: 1,
            codigoDocumentoSector: 1,
            descuento: 0,
            leyenda: 1,
        };
    }

    ref: emitirType = {}
    componentDidMount() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "siat",
            type: "getAll",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            this.setState({ siat: Object.values(e.data)[0] ?? {} })
        }).catch(e => {
            console.error(e);
        })
    }
    send(data) {
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "emitir",
            estado: "cargando",
            ambiente: ambiente, // 1=produccion 2=prueba
            // nit: Model.empresa.Action.getSelect()?.nit,
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            data: data
        }, 1000 * 60).then(e => {
            SNotification.send({
                title: "Factura",
                body: "Exito",
                color: STheme.color.success,
                time: 5000
            })
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            SNotification.send({
                title: "Factura",
                body: "Error",
                color: STheme.color.error,
                time: 5000
            })
            console.error(e);
        })
    }
    render() {
        if (!this.state.siat) return <SLoad />
        let parametricas = this.state.siat.parametricas_test;
        if (ambiente == 1) {
            parametricas = this.state.siat.parametricas;
        }

        return <SPage title={"Facturacion - Emitir"}>
            <Container>
                <SHr />
                <SText fontSize={16}>{ambiente == 1 ? "PRODUCCION" : "PRUEBA"}</SText>
                <SForm
                    ref={ref => this.maestro = ref}
                    row
                    style={{
                        justifyContent: "space-between"
                    }}
                    inputProps={{
                        placeholderTextColor: "#666"
                    }}
                    inputs={{
                        codigoTipoDocumentoIdentidad: {
                            label: "Tipo de documento", defaultValue: this.state.codigoTipoDocumentoIdentidad,
                            type: "select", options: parametricas.tipoDocumentoIdentidad.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        cliNit: { label: "NIT Cliente", defaultValue: this.state.cliNit },
                        cliRazonSocial: { label: "Razon Social Cliente", defaultValue: this.state.cliRazonSocial },
                        codigoSucursal: { label: "Codigo sucursal", defaultValue: this.state.codigoSucursal, col: "xs-5.5" },
                        codigoPuntoVenta: { label: "Codigo punto de venta", defaultValue: this.state.codigoPuntoVenta, col: "xs-5.5" },
                        codigoDocumentoSector: {
                            col: "xs-12",
                            label: "tiposDocSector", defaultValue: this.state.codigoDocumentoSector,
                            type: "select", options: parametricas.tiposDocSector.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        codigoMetodoPago: {
                            col: "xs-5.5",
                            label: "Metodo de pago", defaultValue: this.state.codigoMetodoPago,
                            type: "select", options: parametricas.metodosPago.filter(a => !(a.descripcion.indexOf("\\") > -1)).map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        codigoMoneda: {
                            col: "xs-5.5",
                            label: "Moneda", defaultValue: this.state.codigoMoneda,
                            type: "select", options: parametricas.tipoMoneda.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        monto: { label: "Monto (TEMPORAL)", type: "money", defaultValue: this.state.monto, col: "xs-5.5" },
                        descuento: { label: "Descuento", type: "money", defaultValue: this.state.descuento, col: "xs-5.5" },
                        leyenda: {
                            col: "xs-12",
                            label: "Leyenda", defaultValue: this.state.leyenda,
                            type: "select", options: parametricas.leyendasFactura.map((a, i) => { return { key: i, content: a.descripcionLeyenda } })
                        },
                    }}
                    // onSubmitName={"EMITIR"}
                    onSubmit={e => {
                        e.leyenda = parametricas.leyendasFactura[e.leyenda]?.descripcionLeyenda ?? ""
                        let detalle = this.detalle.getValue();
                        e.detalle = detalle;
                        this.send(e)
                    }}
                />
                <SHr h={50} />
                <Detalle ref={ref => this.detalle = ref} parametricas={parametricas} />
                <SHr h={50} />
                <SButtom type='danger' onPress={() => {
                    this.maestro.submit();

                }}>SUBIR</SButtom>
                <SHr h={50} />
            </Container>



        </SPage>
    }
}



class Detalle extends Component<{ parametricas: any }> {
    state = {}
    getValue() {
        return Object.values(this.state);
    }
    item(key) {
        if (!this.state[key]) this.state[key] = {
            precioUnitario: 0,
            cantidad: 1,
            unidadMedida: 64,
            descuento:0,
        }
        const styleView = {
            padding: 4
        }
        return <SView col={"xs-12"} card padding={8}>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput onChangeText={e => {
                        console.log(e);
                        const pro = this.props.parametricas.productosServicios.find(a => a.codigoProducto == e);
                        if (pro) {
                            this.state[key]["codigoProductoSin"] = pro.codigoProducto;
                            this.state[key]["descripcion"] = pro.descripcionProducto
                        }

                    }} label={"Codigo de producto"} type='select' options={this.props.parametricas.productosServicios.map(a => { return { key: a.codigoProducto, content: a.codigoProducto + " - " + a.descripcionProducto } })} />
                </SView>
                {/* <SView flex style={styleView}>
                    <SInput label={"Descripcion"} />
                </SView> */}
            </SView>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput label={"Unidad de medida"} type='select'
                        defaultValue={62}
                        options={this.props.parametricas.unidadMedida.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })}
                        onChangeText={e => {
                            this.state[key]["unidadMedida"] = e;
                            this.setState({ ...this.state })
                        }} />
                </SView>
                <SView flex style={styleView}>
                    <SInput label={"cantidad"} defaultValue={1} onChangeText={e => {
                        this.state[key]["cantidad"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
            </SView>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput label={"precio unitario"} type='money' onChangeText={e => {
                        this.state[key]["precioUnitario"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
                <SView flex style={styleView}>
                    <SInput label={"descuento"} type='money' onChangeText={e => {
                        this.state[key]["descuento"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
            </SView>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput label={"Sub total"} type='money' value={((this.state[key]["cantidad"] * this.state[key]["precioUnitario"]) - this.state[key]["descuento"]).toFixed(2)} />
                </SView>
            </SView>
        </SView>
    }
    render() {
        return <SView col={"xs-12"}>
            <SText>Detalle</SText>
            {this.item(0)}
        </SView>
    }
}