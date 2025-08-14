import React, { Component } from 'react';
import { SView, SText, SLoad, SDate, SMath, SImage } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import Model from '../../../Model';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
const fontSize = 9; // Reducido para ajustarse al formato carta
const textStyle = {
    font: "Roboto",
    fontSize: 9,
};
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
const formatDate = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : fallback;
const formatDateTime = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleString('es-BO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        })
        : fallback;
export default class ReciboCarta extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    espacio() {
        return <SPDF.View style={{ width: "100%", height: 8 }} />;
    }
    HeaderRecibo() {
        const { data } = this.props;
        const empresa = MDL.empresa.select;
        const sucursal = Model.sucursal.Action.getByKey({ key: data.key_sucursal }) || {};
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 110, alignItems: "center" }}>

                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 50, borderWidth: 1 }} >
                        <SImage src={SSocket.api.empresa + "empresa/" + empresa.key} />
                    </SPDF.View>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{validarDato(empresa.razon_social, 'EMPRESA')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Sucursal: {validarDato(sucursal.descripcion, 'Sin sucursal')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>No. Punto de Venta {validarDato(data.venta, '1')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>{validarDato(sucursal.direccion, 'Av. Sur Nro. 0')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Teléfono: {validarDato(sucursal.telefono, 'Tel: (123) 00000000')}</SPDF.Text>
                </SPDF.View>


                <SPDF.View style={{ flex: 2 }} />


                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{empresa.nit}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"RECIBO N"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{"812"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"CÓD. AUTORIZACIÓN"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90, alignItems: "center", width: 90 }}>{"212E5B3D5BB840450741FE54CD25A18FFD7F23D2012D8BDDAEA002F74"}</SPDF.Text>
                    </SPDF.View>

                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"FECHA"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{formatDate(data.fecha_on)}</SPDF.Text>
                    </SPDF.View>

                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"HORA"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{data.fecha_on ? new Date(data.fecha_on).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Sin hora'}</SPDF.Text>
                    </SPDF.View>

                </SPDF.View>


            </SPDF.View>
        );
    }
    cliente() {
        const { data } = this.props;
        const cliente = data.cliente || {};
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 80 }}>

                <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16, }}>{"RECIBO DE VENTA"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, }}>{"(Comprobante de Pago Recibido)"}</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ width: "100%", height: 12 }} />

                <SPDF.View style={{ width: "100%", alignItems: "center", flexDirection: "row" }}>
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, justifyContent: "center", fontWeight: "bold" }}>{"Fecha: "}</SPDF.Text>
                            { }
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{new SDate(data.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy HH").toUpperCase()}</SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }}></SPDF.View>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"Nombre/Razon Social:"}</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{cliente.razon_social}</SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"NIT/CI/CEX:"}</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{cliente.nit}</SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }}></SPDF.View>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"Cod. Cliente:"}</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{" 0 "}</SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                </SPDF.View>

            </SPDF.View>
        );
    }

    detalle() {
        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key }) || {};
        const items = Object.values(detalles).length
            ? Object.values(detalles)
            : [
                {
                    key: 'PINT-001',
                    descripcion: 'Bote de Pintura Acrílica, Blanco Mate, 5 Litros',
                    cantidad: 1,
                    precio_unitario: 25.0,
                },
            ];
        return (
            <SPDF.View style={{ width: "100%", }}>
                {/* <SPDF.View style={{ width: "100%", height: 16, }}></SPDF.View> */}
                <SPDF.View style={{ width: "100%", height: 44, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"CÓDIGO PRODUCTO / SERVICIO"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"CANTIDAD"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"UNIDAD DE MEDIDA"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"DESCRIPCION"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"PRECIO UNITARIO"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"DESCUENTO"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"SUBTOTAL"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>

                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    return (
                        <SPDF.View style={{ width: "100%", height: 44, flexDirection: "row" }}>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center", }}>{i + 1}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.View style={{ flex: 1 }} />
                                <SPDF.Text style={{ ...textStyle, fontSize: 8, alignItems: "center", }}>{parseFloat(cantidad).toFixed(2)}  </SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center", }}>{"unidad"}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 8 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center", }}>{item.descripcion}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.View style={{ flex: 1 }} />
                                <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{(parseFloat(precio) ?? 0).toFixed(2)}  </SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.View style={{ flex: 1 }} />
                                <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{(parseFloat(0) ?? 0).toFixed(2)}  </SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.View style={{ flex: 1 }} />
                                <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{(((parseFloat(cantidad) ?? 0) * (parseFloat(precio) ?? 0)) - (parseFloat(0) ?? 0)).toFixed(2)}  </SPDF.Text>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}


                {this.subtotales()}
            </SPDF.View>
        );
    }


    subtotales() {
        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key }) || {};
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const descuento = toNumber(data.descuento);
        const montoGiftCard = toNumber(data.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;
        const proveedor = data.proveedor || {};
        const montoPagado = 200; // Valor fijo del código original
        return (
            <SPDF.View style={{ width: "100%", height: 98, flexDirection: "row", }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>


                        {/* <SPDF.View style={{ width: "100%", }}>
                            <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>FORMA DE PAGO: {validarDato(data?.tipo_pago)}</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>MONTO PAGADO: {formatCurrency(montoPagado)}</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>CAMBIO: {formatCurrency(montoPagado - subtotal)}</SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: "100%", height: 4, }}></SPDF.View>
                        <SPDF.View style={{ width: "100%", }}>
                            <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>CAJERO: María Gómez</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>CAJA: 01</SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: "100%", height: 4, }}></SPDF.View>
                        <SPDF.View style={{ width: "100%", }}>
                            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>PROVEEDOR</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Razón Social: {validarDato(proveedor?.razon_social || proveedor?.nombres)}</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>NIT: {validarDato(proveedor?.nit || proveedor?.ci)}</SPDF.Text>
                        </SPDF.View> */}

                        <SPDF.View style={{ width: "100%", height: 81 }}></SPDF.View>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold" }}>{"Son: "}{SMath.numberToLetter(total, { p: "", s: "" }).toLowerCase()}{"00/100 Bolivianos"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%", }}>
                        {this.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: formatCurrency(subtotal) })}
                        {this.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: formatCurrency(descuento) })}
                        {this.renderTotalesDetalle({ label: "TOTAL Bs", monto: formatCurrency(total) })}
                        {this.renderTotalesDetalle({ label: "MONTO GIFT CARD Bs", monto: formatCurrency(montoGiftCard) })}
                        {this.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: formatCurrency(total) })}
                        {this.renderTotalesDetalle({ label: "IMPORTE BASE CRÉDITO FISCAL Bs", monto: formatCurrency(total) })}
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    _detSubtotales(data, montoPagado, proveedor) {
        return <SPDF.View style={{ width: "100%", }}>
            <SPDF.View style={{ width: "100%", }}>
                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>FORMA DE PAGO: {validarDato(data?.tipo_pago)}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>MONTO PAGADO: {formatCurrency(montoPagado)}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>CAMBIO: {formatCurrency(montoPagado - subtotal)}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 4, }}></SPDF.View>
            <SPDF.View style={{ width: "100%", }}>
                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>CAJERO: María Gómez</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>CAJA: 01</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 4, }}></SPDF.View>
            <SPDF.View style={{ width: "100%", }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>PROVEEDOR</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Razón Social: {validarDato(proveedor?.razon_social || proveedor?.nombres)}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>NIT: {validarDato(proveedor?.nit || proveedor?.ci)}</SPDF.Text>
            </SPDF.View>
        </SPDF.View>
    }

    renderTotalesDetalle({ label, monto }) {
        return <SPDF.View style={{ width: "100%", flexDirection: "row", height: 16, }}>

            <SPDF.View style={{ flex: 2, height: "100%", alignItems: "center", borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: 7, alignItems: "center", }}>{label}</SPDF.Text>
            </SPDF.View>

            <SPDF.View style={{ flex: 1, height: "100%", borderWidth: 1, alignItems: "center", flexDirection: "row" }}>
                {/* <SPDF.View style={{ flex: 1 }} /> */}
                <SPDF.Text style={{ ...textStyle, fontSize: 7, alignItems: "center", }}>{monto}</SPDF.Text>
            </SPDF.View>
        </SPDF.View>
    }
    TipoPago() {
        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key }) || {};
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const montoPagado = 200; // Valor fijo del código original
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 40, alignItems: "center" }}>
                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>FORMA DE PAGO: {validarDato(data.tipo_pago)}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>MONTO PAGADO: {formatCurrency(montoPagado)}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>CAMBIO: {formatCurrency(montoPagado - subtotal)}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }
    FooterRecibo() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center",   }}>

                <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                    <SPDF.View style={{ flex: 1, height: 50 }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{"ESTE RECIBO CONFIRMA EL PAGO RECIBIDO. EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY"}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{"Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de servicios"}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{"\"Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de registro en línea\""}</SPDF.Text>
                    </SPDF.View>

                    {/* <SPDF.View style={{ width: 16 }} /> */}

                    <SPDF.View style={{ width: 70, height: 70, borderWidth: 1, justifyContent: "center", alignItems: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{"QR"}</SPDF.Text>
                    </SPDF.View>

                </SPDF.View>


                <SPDF.View style={{ width: "100%", alignItems: "center", height: 50, borderWidth:1 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>¡Gracias por su compra!</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Guarde este recibo para devoluciones.</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Visítenos en www.pinturaselcolor.com</SPDF.Text>
                </SPDF.View>

            </SPDF.View>
        );
    }
    pagina() {
        return (<SPDF.View style={{ width: "100%", height: 20, alignItems: "center", bottom: 0,  }}>
            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>1/1</SPDF.Text>
        </SPDF.View>
        );
    }
    handlePress = () => {
        SPDF.create(
            <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}>
                <SPDF.View style={{ width: "100%" }}>
                    {this.HeaderRecibo()}
                    {this.espacio()}
                    {this.cliente()}
                    {this.espacio()}
                    {this.detalle()}
                    {this.espacio()}
                    {this.FooterRecibo()}
                    {this.espacio()}
                    {this.pagina()}
                </SPDF.View>
            </SPDF.Page>
        );
    }
    render() {
        return (
            <SView onPress={this.handlePress.bind(this)}>
                <SLoad type="window" hidden={!this.state.loading} />
                <SText>PDF CARTA</SText>
            </SView>
        );
    }
}