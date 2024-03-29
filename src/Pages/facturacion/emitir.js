import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SForm, SHr, SIcon, SInput, SLoad, SNotification, SPage, SStorage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';
import PDF from './pdf';

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
            monto: 0,
            codigoTipoDocumentoIdentidad: 1,
            codigoMetodoPago: 1,
            codigoMoneda: 1,
            codigoDocumentoSector: 1,
            descuento: 0,
            leyenda: 1,
            municipio: "Santa Cruz",
            telefono: "+591 75395848",
        };
    }

    ref: emitirType = {}
    componentDidMount() {
        SStorage.getItem("factura_history", a => {
            if (a) {
                this.setState({ ...JSON.parse(a) })
            }
        })
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
    save(data) {
        SStorage.setItem("factura_history", JSON.stringify(data))
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
            PDF.handlePress(e)
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

        console.log(this.state.detalle)
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
                        municipio: { label: "Municipio", defaultValue: this.state.municipio, col: "xs-5.5" },
                        telefono: { label: "Telefono", type: "phone", defaultValue: this.state.telefono, col: "xs-5.5" },
                        codigoDocumentoSector: {
                            col: "xs-12",
                            label: "tiposDocSector", defaultValue: this.state.codigoDocumentoSector,
                            type: "select", options: parametricas.tiposDocSector.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        codigoSucursal: { label: "Codigo sucursal", defaultValue: this.state.codigoSucursal, col: "xs-5.5" },
                        codigoPuntoVenta: { label: "Codigo punto de venta", defaultValue: this.state.codigoPuntoVenta, col: "xs-5.5" },
                        codigoTipoDocumentoIdentidad: {
                            col: "xs-5.5",
                            label: "Tipo de documento", defaultValue: this.state.codigoTipoDocumentoIdentidad,
                            type: "select", options: parametricas.tipoDocumentoIdentidad.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        cliNit: { col: "xs-5.5", label: "NIT Cliente", defaultValue: this.state.cliNit },
                        cliRazonSocial: { label: "Razon Social Cliente", defaultValue: this.state.cliRazonSocial },

                        codigoMoneda: {
                            col: "xs-7",
                            label: "Moneda", defaultValue: this.state.codigoMoneda,
                            type: "select", options: parametricas.tipoMoneda.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        codigoMetodoPago: {
                            col: "xs-5.5",
                            label: "Metodo de pago", defaultValue: this.state.codigoMetodoPago,
                            type: "select", options: parametricas.metodosPago.filter(a => !(a.descripcion.indexOf("\\") > -1)).map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        numeroTarjeta: {
                            col: "xs-5.5",
                            label: "Numero de tarjeta", defaultValue: this.state.numeroTarjeta,
                        },
                        montoGiftCard: {
                            col: "xs-5.5",
                            label: "Monto Gift Card", type: "money", defaultValue: this.state.montoGiftCard,
                        },

                        // monto: { label: "Monto (TEMPORAL)", type: "money", value: this.state.monto, col: "xs-5.5" },
                        descuento: { label: "Descuento", type: "money", defaultValue: this.state.descuento, col: "xs-5.5" },
                        leyenda: {
                            col: "xs-12",
                            label: "Leyenda", defaultValue: 1,
                            type: "select", options: parametricas.leyendasFactura.map((a, i) => { return { key: i, content: a.descripcionLeyenda } })
                        },
                    }}
                    // onSubmitName={"EMITIR"}
                    onSubmit={e => {
                        e.leyenda = parametricas.leyendasFactura[e.leyenda]?.descripcionLeyenda ?? ""
                        let detalle = this.detalle.getValue();
                        let monto = 0;
                        detalle.map(a => {
                            monto += (a.cantidad * a.precioUnitario) - (a.descuento ?? 0)
                        })
                        e.detalle = detalle;
                        e.monto = monto;
                        this.save(e);

                        if (this.onlysave) {
                            this.onlysave = false;
                            return;
                        }

                        this.send(e)
                    }}
                />
                <SHr h={20} />
                <Detalle ref={ref => this.detalle = ref} detalle={this.state.detalle} parametricas={parametricas} />
                <SHr h={50} />
                <SView row>


                    <SButtom type='outline' onPress={() => {
                        this.onlysave = true;
                        this.maestro.submit();
                    }}>GUARDAR</SButtom>
                    <SView width={16} />
                    <SButtom type='outline' onPress={() => {
                        this.onlysave = true;
                        this.detalle.clear()
                        this.state = {
                            cliNit: "454561021",
                            cliRazonSocial: "SERVISOFTS SRL",
                            codigoSucursal: "0",
                            codigoPuntoVenta: "0",
                            monto: 0,
                            codigoTipoDocumentoIdentidad: 1,
                            codigoMetodoPago: 1,
                            codigoMoneda: 1,
                            codigoDocumentoSector: 1,
                            descuento: 0,
                            leyenda: 1,
                            detalle: []
                        }
                        this.save(this.state)

                        this.setState({ ...this.state })
                    }}>CLEAR</SButtom>
                    <SView width={16} />
                    <SButtom type='danger' onPress={() => {
                        this.maestro.submit();

                    }}>ENVIAR</SButtom>
                </SView>
                <SHr h={50} />
            </Container>



        </SPage>
    }
}



class Detalle extends Component<{ parametricas: any }> {
    state = {
        detalle: this.props.detalle ?? []
    }
    getValue() {
        return this.state.detalle
    }
    clear() {
        this.setState({ detalle: [] })
    }
    item(key) {
        if (!this.state.detalle[key]) this.state.detalle[key] = {
            precioUnitario: 0,
            cantidad: 1,
            unidadMedida: 62,
            unidadMedidaDesc: "OTRO",
            descuento: 0,
        }
        const styleView = {
            padding: 4
        }

        return <SView col={"xs-12"} card padding={8}>
            <SText>Producto #{key + 1}</SText>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput onChangeText={e => {
                        console.log(e);
                        const pro = this.props.parametricas.productosServicios.find(a => a.codigoProducto == e);
                        if (pro) {
                            this.state.detalle[key]["codigoProductoSin"] = pro.codigoProducto;
                            this.state.detalle[key]["descripcion"] = pro.descripcionProducto
                        }

                    }}
                        defaultValue={this.state.detalle[key]["codigoProductoSin"]}
                        label={"Codigo de producto"} type='select' options={this.props.parametricas.productosServicios.map(a => { return { key: a.codigoProducto, content: a.codigoProducto + " - " + a.descripcionProducto } })} />
                </SView>
                {/* <SView flex style={styleView}>
                    <SInput label={"Descripcion"} />
                </SView> */}
            </SView>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput label={"Unidad de medida"} type='select'
                        defaultValue={this.state.detalle[key]["unidadMedida"]}
                        options={this.props.parametricas.unidadMedida.map(a => { return { key: a.codigoClasificador, content: a.descripcion } })}
                        onChangeText={e => {
                            this.state.detalle[key]["unidadMedida"] = e;
                            this.state.detalle[key]["unidadMedidaDesc"] = this.props.parametricas.unidadMedida.find(a => a.codigoClasificador == e).descripcion
                            this.setState({ ...this.state })
                        }} />
                </SView>
                <SView flex style={styleView}>
                    <SInput label={"cantidad"} defaultValue={this.state.detalle[key]["cantidad"]} onChangeText={e => {
                        this.state.detalle[key]["cantidad"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
            </SView>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput label={"precio unitario"} defaultValue={this.state.detalle[key]["precioUnitario"]} type='money' onChangeText={e => {
                        this.state.detalle[key]["precioUnitario"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
                <SView flex style={styleView}>
                    <SInput label={"descuento"} defaultValue={this.state.detalle[key]["descuento"]} type='money' onChangeText={e => {
                        this.state.detalle[key]["descuento"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
            </SView>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput label={"Sub total"} type='money' value={((this.state.detalle[key]["cantidad"] * this.state.detalle[key]["precioUnitario"]) - this.state.detalle[key]["descuento"]).toFixed(2)} />
                </SView>
            </SView>
        </SView>
    }
    render() {

        return <SView col={"xs-12"}>
            <SView row center col={"xs-12"}>
                <SText bold fontSize={18}>Productos</SText>
                <SView width={8} />
                <SText onPress={() => {
                    this.state.detalle.push({
                        precioUnitario: 0,
                        cantidad: 1,
                        unidadMedida: 62,
                        unidadMedidaDesc: "OTRO",
                        descuento: 0,
                    })
                    this.setState({ ...this.state })
                }} card padding={8}> + </SText>
                <SView flex />
            </SView>
            <SHr />
            {/* {!this.state.detalle[0] ? this.item(0) : null} */}
            {this.state.detalle.map((a, i) => this.item(i))}
        </SView>
    }
}