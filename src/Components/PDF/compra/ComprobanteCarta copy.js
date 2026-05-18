import React, { Component } from 'react';
import { SMath, SView, SText, SDate } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

const textStyle = { font: "Roboto", fontSize: 9 };
const tableBorderColor = "#B8B8B8";
const PAGE_HEIGHT = 792;
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
                <SPDF.Page style={{ width: 612, height: PAGE_HEIGHT, margin: 10, padding: 6 }}
                    footer={ComprobanteCarta.pagina()}

                >
                    <SPDF.View style={{ width: "100%" }}>
                        {ComprobanteCarta.HeaderRecibo(compraVentaData)}
                        {ComprobanteCarta.espacio()}
                        {ComprobanteCarta.proveedor(compraVentaData)}
                        {ComprobanteCarta.espacio()}
                        {ComprobanteCarta.detalle(compraVentaData)}
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", paddingTop: 0, paddingBottom: 0 }}>
                        {ComprobanteCarta.firmas()}
                    </SPDF.View>
                </SPDF.Page>
            );
        } catch (error) {
            console.error("Error al generar el comprobante:", error);
        }
    }


    static espacio() {
        return <SPDF.View style={{ width: "100%", height: 6 }} />;
    }

    static HeaderRecibo(data) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 96, alignItems: "center" }}>
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.Image src={`${SSocket.api.empresa}empresa/${data?.empresa?.key}`} style={{ width: 100, height: 50 }} />
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{validarDato(data?.empresa?.razon_social, 'MI EMPRESA')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Sucursal: {validarDato(data?.sucursal?.descripcion, 'Mi Sucursal')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>No. Punto de Venta {validarDato(data?.venta, '1')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>{validarDato(data?.sucursal?.direccion, 'Av. Sur Nro. 0')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Teléfono: {validarDato(data?.sucursal?.telefono, 'Tel: (123) 00000000')}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 2 }} />
                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{validarDato(data?.empresa?.nit, 'S/N')}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"ORDEN NRO."}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{validarDato(data?.numero_recibo, '001-001-000001')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static proveedor(data) {
        const proveedor = data?.proveedor || {};
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 68 }}>
                <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16 }}>{"ORDEN DE COMPRA"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>{"(COMPROBANTE DE PAGO COMPRA)"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", height: 6 }} />
                <SPDF.View style={{ width: "100%", alignItems: "center", flexDirection: "row" }}>
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FECHA: "}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {new SDate(data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy")?.toUpperCase() || 'Sin fecha'}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 2 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"COD. PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.codigo, '0001')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 2 }} />
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
                        <SPDF.View style={{ height: 2 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 95, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.razon_social?.toUpperCase(), 'S/N')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 2 }} />
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
        const compact = items.length > 20;

        return (
            <SPDF.View style={{ width: "100%" }}>
                {ComprobanteCarta.detalleHeader(compact)}
                {ComprobanteCarta.detalleBody(items, compact)}
                {ComprobanteCarta.detalleFooter(data, compact)}
            </SPDF.View>
        );
    }

    static detalleHeader(compact = false) {
        const headerHeight = compact ? 16 : 20;
        const headerFontSize = compact ? 7 : 8;
        return (
            <SPDF.View style={{ width: "100%", height: headerHeight, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: headerFontSize, fontWeight: "bold", textAlign: "center" }}>
                        {"CODIGO"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: headerFontSize, fontWeight: "bold", textAlign: "center" }}>
                        {"CANT."}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: headerFontSize, fontWeight: "bold", textAlign: "center" }}>
                        {"UNIDAD"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: headerFontSize, fontWeight: "bold", textAlign: "center" }}>
                        {"DESCRIPCION"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: headerFontSize, fontWeight: "bold", textAlign: "center" }}>
                        {"P. UNIT."}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: headerFontSize, fontWeight: "bold", textAlign: "center" }}>
                        {"DESC."}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: "#555555", height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: headerFontSize, fontWeight: "bold", textAlign: "center" }}>
                        {"SUBTOTAL"}
                    </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalleBody(items, compact = false) {
        const rowHeight = compact ? 13 : 17;
        const rowFontSize = compact ? 7 : 8;
        const rowPadding = compact ? 2 : 4;
        return (
            <SPDF.View style={{ width: "100%" }}>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    const descuentoItem = toNumber(item.descuento || 0);
                    const subtotalItem = (cantidad * precio) - descuentoItem;
                    const codigo = (item?.key ? String(item.key) : String(i + 1)).slice(0, 8);
                    return (
                        <SPDF.View key={i} style={{ width: "100%", minHeight: rowHeight, flexDirection: "row" }}>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: rowPadding }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: rowFontSize, textAlign: "center" }}>{codigo}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: rowPadding }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: rowFontSize, textAlign: "center" }}>{cantidad.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: rowPadding }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: rowFontSize, textAlign: "center" }}>{"UNIDAD"}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 3, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: rowPadding }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: rowFontSize }}>{item.descripcion}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: rowPadding }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: rowFontSize, textAlign: "right" }}>{precio.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: rowPadding }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: rowFontSize, textAlign: "right" }}>{descuentoItem.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, borderColor: tableBorderColor, minHeight: "100%", justifyContent: "center", padding: rowPadding }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: rowFontSize, textAlign: "right" }}>{subtotalItem.toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}
            </SPDF.View>
        );
    }

    static detalleFooter(data, compact = false) {
        return ComprobanteCarta.subtotales(data, compact);
    }

    static subtotales(data, compact = false) {
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
        const totalesRowHeight = compact ? 9 : 12;
        const totalesFontSize = compact ? 5 : 6;
        const subtotalesHeight = compact ? 58 : 66;
        return (
            <SPDF.View style={{ width: "100%", minHeight: subtotalesHeight, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "flex-end", padding: 6 }}>
                    <SPDF.View style={{ width: "100%" }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: compact ? 7 : 8, fontWeight: "bold" }}>
                            {"Son: "}{SMath.numberToLetter(total, { p: "", s: "" }).toLowerCase()}{"00/100 Bolivianos"}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        {ComprobanteCarta.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: formatCurrency(subtotal), rowHeight: totalesRowHeight, fontSize: totalesFontSize })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: formatCurrency(descuento), rowHeight: totalesRowHeight, fontSize: totalesFontSize })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "MONTO GIFT CARD Bs", monto: formatCurrency(montoGiftCard), rowHeight: totalesRowHeight, fontSize: totalesFontSize })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "TOTAL Bs", monto: formatCurrency(total), rowHeight: totalesRowHeight, fontSize: totalesFontSize })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: formatCurrency(total), rowHeight: totalesRowHeight, fontSize: totalesFontSize })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "MONTO PAGADO Bs", monto: formatCurrency(montoPagado), rowHeight: totalesRowHeight, fontSize: totalesFontSize })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "CAMBIO Bs", monto: formatCurrency(cambio >= 0 ? cambio : 0), rowHeight: totalesRowHeight, fontSize: totalesFontSize })}
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static renderTotalesDetalle({ label, monto, rowHeight = 12, fontSize = 6 }) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: rowHeight, borderBottomWidth: 1, borderColor: tableBorderColor }}>
                <SPDF.View style={{ flex: 2, height: "100%", borderRightWidth: 1, borderColor: tableBorderColor, justifyContent: "center", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize }}>{label}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize, textAlign: "right" }}>{monto}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }


    static firmas() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 20, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.3, borderWidth: 1, borderColor: tableBorderColor }} />
                    <SPDF.Text style={{ ...textStyle, fontSize: 7 }}>AUTORIZADO</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.3, borderWidth: 1, borderColor: tableBorderColor }} />
                    <SPDF.Text style={{ ...textStyle, fontSize: 7 }}>SOLICITANTE</SPDF.Text>
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