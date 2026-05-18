import React, { Component } from 'react';
import { SMath, SView, SText, SDate } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

const textStyle = { font: "Roboto", fontSize: 9 };
const tableBorderColor = "#B8B8B8";
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;

export default class ComprobanteCarta extends Component {
    static async imprimir(key) {
        try {


            const compraVenta = await MDL.compra_venta.getByKeyComraVenta(key);
            if (!compraVenta) {
                throw new Error(`compraVenta not found for ID: ${key}`);
            }

            const empresa = await MDL.empresa.getFull();
            if (!empresa?.key) {
                throw new Error('empresa data is missing or invalid');
            }

            const sucursal = empresa.sucursales?.find(a => a?.key === compraVenta?.key_sucursal) || {};

            let proveedor = {};
            if (compraVenta?.key_proveedor) {
                try {
                    proveedor = await MDL.inventario.proveedor.getByKey(compraVenta.key_proveedor) || {};
                } catch (error) {
                    console.error("Error al obtener datos del proveedor:", error);
                }
            }

            const moneda = empresa.monedas?.find(m => m.key === compraVenta.key_moneda) || {};

            const compraVentaData = {
                ...compraVenta,
                empresa,
                sucursal,
                proveedor,
                moneda
            };


            SPDF.create(
                <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}
                    footer={ComprobanteCarta.pagina()}

                >
                    <SPDF.View style={{ width: "100%" }}>
                        {ComprobanteCarta.HeaderRecibo(compraVentaData)}
                        {ComprobanteCarta.espacio()}
                        {ComprobanteCarta.proveedor(compraVentaData)}
                        {/* {ComprobanteCarta.espacio()} */}
                        {/* {ComprobanteCarta.detalle(compraVentaData)} */}
                    </SPDF.View>
                    {/* <SPDF.View style={{ width: "100%", paddingBottom: 4 }}>
                        <SPDF.View style={{ width: '100%', height: 10 }}></SPDF.View>
                        {ComprobanteCarta.firmas()}
                    </SPDF.View> */}
                </SPDF.Page>
            );
        } catch (error) {
            console.error("Error al generar el comprobante:", error);
        }
    }


    static espacio() {
        return <SPDF.View style={{ width: "100%", height: 12 }} />;
    }

    static HeaderRecibo(data) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 140, justifyContent: "space-between", alignItems: "flex-start", borderColor: "#B8B8B8", borderWidth: 1, }}>


                <SPDF.View style={{ width: "80%", height: "100%", alignItems: "flex-start" }}>
                    <SPDF.Image src={`${SSocket.api.empresa}empresa/${data?.empresa?.key}`} style={{ width: 72, height: 72 }} />
                    <SPDF.View style={{ width: "100%", }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 12, fontWeight: "bold" }}>{validarDato(data?.empresa?.razon_social, 'MI EMPRESA')}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>Sucursal: {validarDato(data?.sucursal?.descripcion, 'Mi Sucursal')}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>No. Punto de Venta {validarDato(data?.venta, '1')}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>{validarDato(data?.sucursal?.direccion, 'Av. Sur Nro. 0')}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>Teléfono: {validarDato(data?.sucursal?.telefono, 'Tel: (123) 00000000')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>

                <SPDF.View style={{ width: "20%", height: "100%", alignItems: "flex-end", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 11, fontWeight: "bold", textAlign: "right", width: "100%" }}>{"NIT"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 11, textAlign: "right", width: "100%" }}>{validarDato(data?.empresa?.nit, 'S/N')}</SPDF.Text>
                    <SPDF.View style={{ height: 8 }} />
                    <SPDF.Text style={{ ...textStyle, fontSize: 11, fontWeight: "bold", textAlign: "right", width: "100%" }}>{"ORDEN NRO."}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 11, textAlign: "right", width: "100%" }}>{validarDato(data?.numero_recibo, '001-001-000001')}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static proveedor(data) {
        const proveedor = data?.proveedor || {};
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: "100%", borderColor: "#B8B8B8", borderWidth: 1, }}>

                <SPDF.View style={{ width: "100%", height: 36, alignItems: "center", backgroundColor: "#e97272", borderColor: "#B8B8B8", borderWidth: 1 }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16 }}>{"ORDEN DE COMPRA"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>{"(COMPROBANTE DE PAGO COMPRADO)"}</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ width: "100%", height: 8 }} />

                <SPDF.View style={{ width: "100%", alignItems: "center", height: 50, flexDirection: "row", backgroundColor: "#8ae972", borderColor: "#B8B8B8", borderWidth: 1 }}>
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FECHA: "}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center", }}>
                                {new SDate(data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy")?.toUpperCase() || 'Sin fecha'}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"COD. PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.codigo, '0001')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FORMA DE PAGO:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(data?.tipo_pago?.toUpperCase(), 'S/D')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3 }} />
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 95, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"NIT:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.nit, '0')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 95, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.razon_social?.toUpperCase(), 'S/N')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 95, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"CONTACTO:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.telefono, '+591 00000000')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalle(data) {
        const detalles = data?.detalle || {};
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
            <SPDF.View style={{ width: "100%" }}>
                {ComprobanteCarta.detalleHeader()}
                {ComprobanteCarta.detalleBody(items)}
                {ComprobanteCarta.detalleFooter(data)}
            </SPDF.View>
        );
    }

    static detalleHeader() {
        return (
            <SPDF.View style={{ width: "100%", height: 24, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
                        {"CODIGO"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
                        {"CANT."}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
                        {"UNIDAD"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
                        {"DESCRIPCION"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
                        {"P. UNIT."}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
                        {"DESC."}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}>
                        {"SUBTOTAL"}
                    </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalleBody(items) {
        return (
            <SPDF.View style={{ width: "100%" }}>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    const descuentoItem = toNumber(item.descuento || 0);
                    const subtotalItem = (cantidad * precio) - descuentoItem;
                    const codigo = (item?.key ? String(item.key) : String(i + 1)).slice(0, 8);
                    return (
                        <SPDF.View key={i} style={{ width: "100%", minHeight: 20, flexDirection: "row" }}>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "center" }}>{codigo}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "center" }}>{cantidad.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "center" }}>{"UNIDAD"}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 3, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8 }}>{item.descripcion}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "right" }}>{precio.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "right" }}>{descuentoItem.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "right" }}>{subtotalItem.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}
            </SPDF.View>
        );
    }

    static detalleFooter(data) {
        return ComprobanteCarta.subtotales(data);
    }

    static subtotales(data) {
        const detalles = data?.detalle || {};
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const descuento = toNumber(data?.descuento);
        const montoGiftCard = toNumber(data?.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;
        const montoPagado = toNumber(data?.monto_pagado);
        const cambio = montoPagado - total;
        return (
            <SPDF.View style={{ width: "100%", height: 88, flexDirection: "row", }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "flex-end", padding: 6 }}>
                    <SPDF.View style={{ width: "100%" }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold" }}>
                            {"Son: "}{SMath.numberToLetter(total, { p: "", s: "" }).toLowerCase()}{"00/100 Bolivianos"}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        {ComprobanteCarta.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: formatCurrency(subtotal) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: formatCurrency(descuento) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "MONTO GIFT CARD Bs", monto: formatCurrency(montoGiftCard) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "TOTAL Bs", monto: formatCurrency(total) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: formatCurrency(total) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "MONTO PAGADO Bs", monto: formatCurrency(montoPagado) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "CAMBIO Bs", monto: formatCurrency(cambio >= 0 ? cambio : 0) })}
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static renderTotalesDetalle({ label, monto }) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 12, borderBottomWidth: 1, borderColor: tableBorderColor }}>
                <SPDF.View style={{ flex: 2, height: "100%", borderRightWidth: 1, borderColor: tableBorderColor, justifyContent: "center", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 6 }}>{label}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 6, textAlign: "right" }}>{monto}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }


    static firmas() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 70, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.3, borderWidth: 1, borderColor: tableBorderColor }} />
                    <SPDF.Text style={{ ...textStyle }}>AUTORIZADO</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.3, borderWidth: 1, borderColor: tableBorderColor }} />
                    <SPDF.Text style={{ ...textStyle }}>SOLICITANTE</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
            </SPDF.View>
        );
    }

    static pagina() {
        return (
            <SPDF.View style={{ width: "100%", height: 20, alignItems: "center", bottom: 0 }}>
                <SPDF.Text style={{ ...textStyle, fontSize: 7, }}>{"${current_page}/${cant_page}"}</SPDF.Text>
            </SPDF.View>
        );
    }

    render() {
        return (
            <SView onPress={() => ComprobanteCarta.imprimir(this.props.data?.key)}>
                <SText>PDF CARTA</SText>
            </SView>
        );
    }
}