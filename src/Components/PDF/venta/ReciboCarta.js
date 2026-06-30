import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SNotification, STheme } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

const textStyle = {
    font: "Roboto",
    fontSize: 9,
};

const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const safeSimbolo = (simbolo) => (simbolo === '₲' ? 'Gs' : simbolo);
const formatCurrency = (val = 0, moneda = 'Bs') => {
    const [integer, decimal] = toNumber(val).toFixed(2).split('.');
    const intStr = parseInt(integer, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${moneda} ${intStr},${decimal}`;
};

export default class ReciboCarta extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static async imprimir(key) {
        const notificationKey = `pdf_carta_${key}`;
        try {
            SNotification.send({
                key: notificationKey,
                title: "Generando recibo...",
                type: "loading",
            });

            const data = await MDL.compra_venta.getByKeyComraVenta(key);
            if (!data) {
                console.error("ReciboCarta: no data para key:", key);
                SNotification.send({
                    key: notificationKey,
                    title: "Error al generar recibo",
                    body: "No se encontraron datos para esta venta.",
                    color: STheme.color.danger,
                    time: 5000,
                });
                return;
            }

            const empresa = await MDL.empresa.getFull();
            if (!empresa?.key) throw new Error('empresa data is missing or invalid');

            let tipoPago = [];
            try {
                tipoPago = await MDL.compra_venta.getTipoPago(key);
            } catch (error) {
                console.error("ReciboCarta: error tipoPago:", error);
            }

            const sucursal = empresa.sucursales?.find(a => a?.key === data?.key_sucursal) || {};

            let cajero = {};
            if (data?.key_cajero) {
                try {
                    const usuarios = await MDL.usuario.getByKeys([data.key_cajero]);
                    cajero = Array.isArray(usuarios) ? usuarios[0] : usuarios[data.key_cajero] || {};
                } catch (error) {
                    console.error("ReciboCarta: error cajero:", error);
                }
            }

            let clientes = [];
            try {
                clientes = await MDL.crm.cliente.getAll();
            } catch (error) {
                console.error("ReciboCarta: error clientes:", error);
            }

            const moneda = empresa.monedas?.find(m => m.key === data.key_moneda) || {};

            const compraVentaData = {
                ...data,
                empresa,
                sucursal,
                cajero,
                cliente: (Array.isArray(clientes) ? clientes : Object.values(clientes || {})).find(a => a?.key === data.key_cliente) || {},
                moneda,
                tipo_pago_: tipoPago || {},
            };

            SPDF.create(
                <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}
                    footer={ReciboCarta.pagina()}
                >
                    {ReciboCarta.HeaderRecibo(compraVentaData)}
                    {ReciboCarta.espacio()}
                    {ReciboCarta.cliente(compraVentaData)}
                    {ReciboCarta.espacio()}
                    {ReciboCarta.detalle(compraVentaData)}
                    {ReciboCarta.espacio()}
                    {ReciboCarta.Cajero(compraVentaData.cajero, compraVentaData)}
                </SPDF.Page>
            ).catch(e => {
                console.error("ReciboCarta: SPDF.create error:", e);
            });

            SNotification.send({
                key: notificationKey,
                title: "Recibo generado",
                body: "El PDF se generó correctamente.",
                color: STheme.color.success,
            });
        } catch (error) {
            console.error("ReciboCarta: error general:", error);
            SNotification.send({
                key: notificationKey,
                title: "Error al generar recibo",
                body: error?.message || "Ocurrió un error inesperado.",
                color: STheme.color.danger,
                time: 5000,
            });
        }
    }

    static getQR(key) {
        if (!key) {
            return Promise.reject(new Error("Key inválida para generar QR"));
        }
        const content = `https://darmotos.servisofts.com/venta/profile?pk=${encodeURIComponent(key)}`;
        return SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "image_src": "https://darmotos.servisofts.com/logo512.png",
                "framework": "Rounded",
                "header": "Circle",
                "body": "Dot",
                "content": content,
                "type_color": "solid",
            }
        });
    }

    static espacio() {
        return <SPDF.View style={{ width: "100%", height: 16 }} />;
    }

    static HeaderRecibo(data) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 110, alignItems: "center" }}>
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    {SSocket.api?.empresa && data?.empresa?.key
                        ? <SPDF.Image src={`${SSocket.api.empresa}empresa/${data.empresa.key}`} style={{ width: 100, height: 50 }} />
                        : <SPDF.View style={{ width: 100, height: 50 }} />
                    }
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{validarDato(data?.empresa?.razon_social, 'EMPRESA')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Sucursal: {validarDato(data?.sucursal?.descripcion, 'Sin sucursal')}</SPDF.Text>
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
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"RECIBO N"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{validarDato(data?.numero_recibo, '812')}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"CÓD. AUTORIZACIÓN"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90, alignItems: "center" }}>
                            {validarDato(data?.codigo_autorizacion, '212E5B3D5BB840450741FE54CD25A18FFD7F23D2012D8BDDAEA002F74')}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static cliente(data) {
        const cliente = data?.cliente || {};
        const _empresa = data?.empresa || {};
        const _telefono = _empresa?.codigo_pais + " 000-000-000";
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 80 }}>
                <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16 }}>{"RECIBO DE VENTA"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 10, alignItems: "center" }}>{"(COMPROBANTE DE PAGO)"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", height: 12 }} />
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
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"COD. CLIENTE:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(cliente?.codigo, '0001')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FORMA DE PAGO:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(data?.tipo_pago != null ? String(data.tipo_pago).toUpperCase() : null, 'S/D')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>

                    <SPDF.View style={{ flex: 3 }} />

                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"NIT/CI:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(cliente?.nit || cliente?.ci, '0')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"CLIENTE:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(cliente?.razon_social?.toUpperCase(), 'S/N')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"TELEFONO:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(cliente?.telefono, _telefono)}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3 }} />

                </SPDF.View>
            </SPDF.View>
        );
    }

    static Cajero(cajero, data) {
        const tipoPagos = Array.isArray(data?.tipo_pago) ? data.tipo_pago : [];

        const th = (flex, label) => (
            <SPDF.View style={{ flex, height: "100%", justifyContent: "center", padding: 4, borderWidth: 1, backgroundColor: "#D0D0D0" }}>
                <SPDF.Text style={{ ...textStyle, fontSize: 8, fontWeight: "bold", }}>{label}</SPDF.Text>
            </SPDF.View>
        );
        //<SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{toNumber(tp?.tipo_cambio).toFixed(3)}</SPDF.Text>

        return (
            <SPDF.View style={{ width: "100%" }}>
                {tipoPagos.length > 0 && (
                    <SPDF.View style={{ width: "100%", marginBottom: 10 }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 10 }}>
                            {"DETALLE FORMAS DE PAGOS"}
                        </SPDF.Text>
                        <SPDF.View style={{ height: 10 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", height: 24 }}>
                            {th(1, "#")}
                            {th(1, "TIPO")}
                            {th(3, "DETALLE")}
                            {th(1, "MONEDA")}
                            {th(1, "T. CAMBIO")}
                            {th(1, "MONTO")}
                        </SPDF.View>
                        {tipoPagos.map((tp, i) => {
                            const mon = (data?.empresa?.monedas || []).find(m => m.key === tp?.key_moneda);
                            const sim = safeSimbolo(mon?.observacion || data?.moneda?.observacion) || 'Gs';
                            return (
                                <SPDF.View key={i} style={{ width: "100%", flexDirection: "row", height: 20 }}>
                                    <SPDF.View style={{ flex: 1, height: "100%", justifyContent: "center", padding: 4, borderWidth: 1 }}>
                                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{i + 1}</SPDF.Text>
                                    </SPDF.View>
                                    <SPDF.View style={{ flex: 1, height: "100%", justifyContent: "center", padding: 4, borderWidth: 1 }}>
                                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{String(tp?.tipo || '').toUpperCase()}</SPDF.Text>
                                    </SPDF.View>
                                    <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", padding: 4, borderWidth: 1 }}>
                                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{String(tp?.tipo_pago || '').toUpperCase()}</SPDF.Text>
                                    </SPDF.View>
                                    <SPDF.View style={{ flex: 1, height: "100%", justifyContent: "center", padding: 4, borderWidth: 1 }}>
                                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{sim}</SPDF.Text>
                                    </SPDF.View>
                                    <SPDF.View style={{ flex: 1, height: "100%", justifyContent: "center", padding: 4, borderWidth: 1 }}>
                                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{toNumber(tp?.tipo_cambio)}</SPDF.Text>
                                    </SPDF.View>
                                    <SPDF.View style={{ flex: 1, height: "100%", justifyContent: "center", padding: 4, borderWidth: 1 }}>
                                        <SPDF.Text style={{ ...textStyle, fontSize: 7 }}>{formatCurrency(toNumber(tp?.monto), sim)}</SPDF.Text>


                                    </SPDF.View>
                                </SPDF.View>
                            );
                        })}
                    </SPDF.View>
                )}

                <SPDF.View style={{ width: "100%", flexDirection: "row", height: 20 }}>
                    <SPDF.Text style={{ ...textStyle, flex: 1, fontWeight: "bold" }}>
                        {"Cajero: "}{validarDato(cajero?.Nombres?.toUpperCase(), 'S/N')}
                    </SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>
                        {"Caja: 01"}
                    </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }


    static detalle(data) {
        const detalles = data?.detalle || {};
        const simbolo = safeSimbolo(data?.moneda?.observacion) || 'Bs';
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
                <SPDF.View style={{ width: "100%", height: 44, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"CÓDIGO PRODUCTO / SERVICIO"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"CANTIDAD"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"UNIDAD DE MEDIDA"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"DESCRIPCION"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"PRECIO UNITARIO"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"DESCUENTO"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"SUBTOTAL"}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    const descuentoItem = toNumber(item.descuento || 0);
                    return (
                        <SPDF.View key={i} style={{ width: "100%", height: 44, flexDirection: "row" }}>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{item.key || (i + 1)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8, alignItems: "center" }}>{parseFloat(cantidad).toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{"unidad"}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 8 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{(item.descripcion || '').toUpperCase()}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{formatCurrency(precio, simbolo)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{formatCurrency(descuentoItem, simbolo)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{formatCurrency((cantidad * precio) - descuentoItem, simbolo)}</SPDF.Text>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}
                {ReciboCarta.subtotales(data)}
            </SPDF.View>
        );
    }

    static subtotales(data) {
        const detalles = data?.detalle || {};
        const moneda = data?.moneda || {};

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

        const simbolo = safeSimbolo(moneda?.observacion) || 'Bs';
        const nombre_plural = moneda?.nombre_plural || 'Bolivianos';

        return (
            <SPDF.View style={{ width: "100%", height: 120, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold" }}>
                            {"Son: "}{(SMath.numberToLetter(total > 0 ? total : 0, { p: "", s: "" }) || "").toLowerCase()}{"00/100 "}{nombre_plural}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        {ReciboCarta.renderTotalesDetalle({ label: `SUBTOTAL `, monto: formatCurrency(subtotal, simbolo) })}
                        {ReciboCarta.renderTotalesDetalle({ label: `DESCUENTO `, monto: formatCurrency(descuento, simbolo) })}
                        {ReciboCarta.renderTotalesDetalle({ label: `TOTAL `, monto: formatCurrency(total, simbolo) })}
                        {ReciboCarta.renderTotalesDetalle({ label: `PAGADO `, monto: formatCurrency(montoPagado, simbolo) })}
                        {ReciboCarta.renderTotalesDetalle({ label: `CAMBIO  `, monto: formatCurrency(cambio >= 0 ? cambio : 0, simbolo) })}
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );

    }

    static renderTotalesDetalle({ label, monto }) {


        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 18 }}>
                <SPDF.View style={{ flex: 1, height: "100%", padding: 3, borderWidth: 1 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 7 }}>{label}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, height: "100%", padding: 3, borderWidth: 1, justifyContent: "flex-end", alignItems: "flex-end" }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8, textAlign: "right", width: "100%" }}>{monto}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static pagina() {
        return (
            <SPDF.View style={{ width: "100%", height: 20, alignItems: "center", bottom: 0 }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>1/1</SPDF.Text>
            </SPDF.View>
        );
    }

    render() {
        return (
            <SView onPress={() => ReciboCarta.imprimir(this.props.data?.key)}>
                <SText>PDF CARTA</SText>
            </SView>
        );
    }
}