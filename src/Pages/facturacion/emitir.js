import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SForm, SHr, SIcon, SInput, SLoad, SNotification, SPage, SStorage, SSwitch, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';
import PDF from './pdf';
import MDL from '../../MDL';

type emitirType = {
    nit: SInput,
    razon_social: SInput
}
// const ambiente = 1;
export default class emitir extends Component {
    constructor(props) {
        super(props);
        this.state = {
            codigoActividad: 0,
            ambiente: 1,
            numeroDocumento: "454561021",
            nombreRazonSocial: "SERVISOFTS SRL",
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
            correo: "servisofts.srl@gmail.com",
            complemento: ""
        };
    }

    ref: emitirType = {}
    componentDidMount() {
        SStorage.getItem("factura_history", a => {
            if (a) {
                this.setState({ ...JSON.parse(a) })
            }
        })
        MDL.factura.getSiat().then((siat) => {
            this.setState({ siat: siat })
        })

    }
    save(data) {
        SStorage.setItem("factura_history", JSON.stringify(data))
    }
    send(data) {


        // console.log(data);
        // return;
        SNotification.send({
            key: "facturacion_emitir",
            title: "Facturación",
            body: "Generando factura",
            color: STheme.color.warning,
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "emitir",
            estado: "cargando",
            enviar_siat: this.inpt_enviar_siat.getValue(),  // true = enviar a siat | false = solo guardar en la base de datos
            ambiente: this.state.ambiente, // 1=produccion 2=prueba
            // nit: Model.empresa.Action.getSelect()?.nit,
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            data: data
        }, 1000 * 60).then(e => {
            SNotification.send({
                key: "facturacion_emitir",
                title: "Facturación",
                body: "Factura generada con éxito.",
                color: STheme.color.success,
                time: 5000
            })
            //PDF.handlePress(e)
            this.setState({ loading: false })
            console.log(e);
        }).catch(e => {
            SNotification.send({
                key: "facturacion_emitir",
                title: "Factura",
                body: e?.error,
                color: STheme.color.error,
                time: 5000
            })
            //console.error(e);
        })
    }
    render() {
        // if (!this.state.siat) return <SLoad />
        let parametricas = this.state?.siat?.parametricas_test;
        if (this.state.ambiente == 1) {
            parametricas = this.state?.siat?.parametricas;
        }

        return <SPage title={"Facturación - Emitir"}>
            <Container loading={!this.state.siat}>
                <SHr h={20} />
                <SText col={"xs-12"} bold fontSize={16} color={STheme.color.primary}>EMITIR FACTURA</SText>
                <SHr h={5} />
                <SView col={"xs-12"} center style={{
                    height: 1,
                    backgroundColor: STheme.color.secondary,
                }} />
                <SHr h={5} />
                <SText fontSize={16} onPress={() => {
                    this.setState({ ambiente: this.state.ambiente == 1 ? 2 : 1 })
                }}>{this.state.ambiente == 1 ? "PRODUCCION" : "PRUEBA"}</SText>
                <SInput label={"Actividad economica"} type={"select"} center
                    options={(parametricas?.actividadEconomica ?? []).map((a, i) => { return { key: a.codigoCaeb, content: a.descripcion } })}
                    onChangeText={(e) => {
                        this.setState({ codigoActividad: e })
                    }}
                />
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
                        telefono: { label: "Teléfono", type: "phone", defaultValue: this.state.telefono, col: "xs-5.5" },
                        correo: { label: "Correo", type: "email", defaultValue: this.state.correo, col: "xs-7.5" },
                        codigoDocumentoSector: {
                            col: "xs-12",
                            label: "tiposDocSector", defaultValue: this.state.codigoDocumentoSector,
                            type: "select", options: (parametricas?.tiposDocSector ?? []).map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        codigoSucursal: { label: "Código sucursal", defaultValue: this.state.codigoSucursal, col: "xs-5.5" },
                        codigoPuntoVenta: { label: "Código punto de venta", defaultValue: this.state.codigoPuntoVenta, col: "xs-5.5" },
                        codigoTipoDocumentoIdentidad: {
                            col: "xs-5.5",
                            label: "Tipo de documento", defaultValue: this.state.codigoTipoDocumentoIdentidad,
                            type: "select", options: (parametricas?.tipoDocumentoIdentidad ?? []).map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        numeroDocumento: { col: "xs-5.5", label: "NIT Cliente", defaultValue: this.state.numeroDocumento },
                        nombreRazonSocial: { label: "Razón Social Cliente", defaultValue: this.state.nombreRazonSocial },

                        codigoMoneda: {
                            col: "xs-7",
                            label: "Moneda", defaultValue: this.state.codigoMoneda,
                            type: "select", options: (parametricas?.tipoMoneda ?? []).map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        codigoMetodoPago: {
                            col: "xs-5.5",
                            label: "Método de pago", defaultValue: this.state.codigoMetodoPago,
                            type: "select", options: (parametricas?.metodosPago ?? []).filter(a => !(a.descripcion.indexOf("\\") > -1)).map(a => { return { key: a.codigoClasificador, content: a.descripcion } })
                        },
                        numeroTarjeta: {
                            col: "xs-5.5",
                            label: "Número de tarjeta", defaultValue: this.state.numeroTarjeta,
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
                            type: "select", options: (parametricas?.leyendasFactura ?? []).map((a, i) => { return { key: i, content: a.descripcionLeyenda } })
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
                <Detalle ref={ref => this.detalle = ref} codigoActividad={this.state.codigoActividad} detalle={this.state.detalle} parametricas={parametricas} />
                <SHr h={50} />
                <SInput ref={ref => this.inpt_enviar_siat = ref} type='checkBox' label={"¿Enviar al SIAT ahora?"} defaultValue={true} />
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
                            numeroDocumento: "454561021",
                            nombreRazonSocial: "SERVISOFTS SRL",
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
                    }}>LIMPIAR</SButtom>
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



class Detalle extends Component<{ parametricas: any, codigoActividad: any }> {
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
                        console.log(this.props.parametricas);
                        const pro = (this.props.parametricas?.productosServicios ?? []).find(a => a.codigoProducto == e);
                        if (pro) {
                            this.state.detalle[key]["codigoProductoSin"] = pro.codigoProducto;
                            const desc = this.input_desc.getValue();
                            this.input_desc.setValue(pro.descripcionProducto);
                            this.state.detalle[key]["descripcion"] = desc ?? pro.descripcionProducto
                            this.state.detalle[key]["codigoActividad"] = pro.codigoActividad
                        }

                    }}
                        defaultValue={this.state.detalle[key]["codigoProductoSin"]}
                        label={"Código de producto"} type='select' options={(this.props.parametricas?.productosServicios ?? []).filter(p => p.codigoActividad == this.props.codigoActividad).map(a => { return { key: a.codigoProducto, content: a.codigoProducto + " - " + a.descripcionProducto } })} />
                    <SInput ref={ref => this.input_desc = ref} type='text' label={"Descripcion"} placeholder={"Descripcion del producto"} onChangeText={(e) => {
                        this.state.detalle[key]["descripcion"] = e
                    }} />
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
                            this.state.detalle[key]["unidadMedidaDesc"] = (this.props?.parametricas?.unidadMedida ?? []).find(a => a.codigoClasificador == e).descripcion
                            this.setState({ ...this.state })
                        }} />
                </SView>
                <SView flex style={styleView}>
                    <SInput label={"Cantidad"} defaultValue={this.state.detalle[key]["cantidad"]} onChangeText={e => {
                        this.state.detalle[key]["cantidad"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
            </SView>
            <SView col={"xs-12"} row >
                <SView flex style={styleView}>
                    <SInput label={"Precio unitario"} defaultValue={this.state.detalle[key]["precioUnitario"]} type='money' onChangeText={e => {
                        this.state.detalle[key]["precioUnitario"] = e;
                        this.setState({ ...this.state })
                    }} />
                </SView>
                <SView flex style={styleView}>
                    <SInput label={"Descuento"} defaultValue={this.state.detalle[key]["descuento"]} type='money' onChangeText={e => {
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