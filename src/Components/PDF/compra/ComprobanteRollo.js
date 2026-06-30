import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SNotification, STheme } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';

const textStyle = { fontSize: 14, font: 'Roboto', paddingBottom: 4 };

const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val = 0, simbolo = 'Bs') => {
    const [integer, decimal] = toNumber(val).toFixed(2).split('.');
    const intStr = parseInt(integer, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intStr},${decimal} ${simbolo}`;
};

const calcTotales = (data) => {
    const items = Object.values(data?.detalle || {});
    let subtotal = 0;
    for (const item of items) {
        subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
    }
    const descuento = toNumber(data?.descuento);
    const montoGiftCard = toNumber(data?.monto_gift_card);
    const total = subtotal - descuento - montoGiftCard;
    const pagado = toNumber(data?.monto_pagado);
    const cambio = pagado - total;
    return { subtotal, descuento, montoGiftCard, total, pagado, cambio };
};

export default class ComprobanteRollo extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static async imprimir(key) {
        const notificationKey = `pdf_comprobante_rollo_${key}`;
        try {
            SNotification.send({
                key: notificationKey,
                title: "Generando comprobante...",
                type: "loading",
            });

            const data = await MDL.compra_venta.getByKeyComraVenta(key);
            if (!data) { console.error("ComprobanteRollo: no data para key:", key); return; }

            const empresa = await MDL.empresa.getFull();
            if (!empresa?.key) throw new Error('empresa data is missing or invalid');

            const sucursal = empresa.sucursales?.find(a => a?.key === data?.key_sucursal) || {};

            let cajero = {};
            if (data?.key_cajero) {
                try {
                    const usuarios = await MDL.usuario.getByKeys([data.key_cajero]);
                    cajero = Array.isArray(usuarios) ? usuarios[0] : usuarios[data.key_cajero] || {};
                } catch (error) {
                    console.error("ComprobanteRollo: error cajero:", error);
                }
            }

            let proveedor = {};
            if (data?.key_proveedor) {
                try {
                    proveedor = await MDL.inventario.proveedor.getByKey(data.key_proveedor) || {};
                } catch (error) {
                    console.error("ComprobanteRollo: error proveedor:", error);
                }
            }

            const moneda = empresa.monedas?.find(m => m.key === data.key_moneda) || {};

            const compraData = {
                ...data,
                empresa,
                sucursal,
                cajero,
                proveedor,
                moneda
            };

            console.log("ComprobanteRollo: compraData:", compraData);

            let qr = null;
            try {
                const qrResponse = await ComprobanteRollo.getQR(key);
                qr = qrResponse?.data?.b64;
            } catch (error) {
                console.error("ComprobanteRollo: error QR:", error);
            }

            SPDF.create(
                <SPDF.Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }}>
                    <SPDF.View style={{ width: '100%', height: 4 }} />
                    {ComprobanteRollo.HeaderRecibo(compraData)}
                    <SPDF.View style={{ width: '100%', height: 4 }} />
                    {ComprobanteRollo.InfoCompra(compraData)}
                    <SPDF.View style={{ width: '100%', height: 4 }} />
                    {ComprobanteRollo.proveedor(compraData.proveedor)}
                    {ComprobanteRollo.espacio()}
                    {ComprobanteRollo.detalle(compraData)}
                    {ComprobanteRollo.espacioPunto()}
                    {ComprobanteRollo.subtotales(compraData)}
                    {ComprobanteRollo.espacio()}
                    {ComprobanteRollo.TipoPago(compraData)}
                    <SPDF.View style={{ width: '100%', height: 4 }} />
                    {ComprobanteRollo.Cajero(compraData.cajero)}
                    {ComprobanteRollo.espacio()}
                    {ComprobanteRollo.FooterRecibo(qr, compraData)}
                </SPDF.Page>
            ).catch(e => { console.error("ComprobanteRollo: SPDF.create error:", e); });

            SNotification.send({
                key: notificationKey,
                title: "Comprobante generado",
                body: "El PDF se generó correctamente.",
                color: STheme.color.success,
            });
        } catch (error) {
            console.error("ComprobanteRollo: error general:", error);
            SNotification.send({
                key: notificationKey,
                title: "Error al generar comprobante",
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
        const content = `https://darmotos.servisofts.com/compra/profile?pk=${encodeURIComponent(key)}`;
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
        return (
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ width: '100%', height: 4 }} />
                <SPDF.Text style={{ width: '100%', fontSize: 14, fontWeight: 'bold' }}>
                    {'- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 4 }} />
            </SPDF.View>
        );
    }

    static espacioPunto() {
        return (
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ width: '100%', height: 4 }} />
                <SPDF.Text style={{ width: '100%', fontSize: 14 }}>
                    {'.....................................................................................................................'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 4 }} />
            </SPDF.View>
        );
    }

    static HeaderRecibo(data) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: 'bold', fontSize: 16 }}>
                    {validarDato(data.empresa?.razon_social, 'EMPRESA')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle }}>
                    SUCURSAL: {validarDato(data.sucursal?.descripcion, 'Central')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle, alignItems: 'center' }}>
                    NRO. PUNTO DE COMPRA {validarDato(data?.compra, '1')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle }}>
                    {validarDato(data.sucursal?.direccion, 'Av. Sur Nro. 0')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle }}>
                    TELÉFONO: {validarDato(data.sucursal?.telefono, 'S/N')}
                </SPDF.Text>
            </SPDF.View>
        );
    }

    static InfoCompra(data) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>COMPROBANTE NRO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{validarDato(data?.numero_comprobante, '#001')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>FECHA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>
                            {new SDate(data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy")?.toUpperCase() || 'Sin fecha'}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>HORA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>
                            {data?.fecha_on
                                ? new Date(data.fecha_on).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : 'Sin hora'}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static proveedor(proveedor) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>PROVEEDOR: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>
                            {validarDato(proveedor?.razon_social?.toUpperCase(), 'S/N')}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>NIT: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>
                            {validarDato(proveedor?.nit, '0')}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>COD. PROVEEDOR: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>{validarDato(proveedor?.codigo, '#000')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static Cajero(cajero) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>RESPONSABLE: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{validarDato(cajero?.Nombres?.toUpperCase(), 'S/N')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CAJA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>#01</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static TipoPago(data) {
        const detalles = data?.detalle || {};
        if (!Object.keys(detalles).length) return null;

        const simbolo = data?.moneda?.observacion || 'Bs';
        const { pagado, cambio } = calcTotales(data);
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>FORMA DE PAGO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{validarDato(data?.tipo_pago != null ? String(data.tipo_pago).toUpperCase() : null, 'S/D')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>MONTO PAGADO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(pagado > 0 ? pagado : 0, simbolo)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CAMBIO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(cambio >= 0 ? cambio : 0, simbolo)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalle(data) {
        const detalles = data?.detalle || {};
        const simbolo = data?.moneda?.observacion || 'Bs';
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
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>DETALLE</SPDF.Text>
                    <SPDF.View style={{ width: '100%', height: 4 }} />
                </SPDF.View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item?.cantidad);
                    const precio = toNumber(item?.precio_unitario);
                    return (
                        <SPDF.View key={i} style={{ width: '100%', marginBottom: 4 }}>
                            <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>{item.descripcion}</SPDF.Text>
                            <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                                <SPDF.View style={{ width: '50%' }}>
                                    <SPDF.Text style={{ ...textStyle }}>cant {cantidad} x {formatCurrency(precio, simbolo)}</SPDF.Text>
                                </SPDF.View>
                                <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                                    <SPDF.Text style={{ ...textStyle }}>{formatCurrency(cantidad * precio, simbolo)}</SPDF.Text>
                                </SPDF.View>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}
            </SPDF.View>
        );
    }

    static subtotales(data) {
        const simbolo = data?.moneda?.observacion || 'Bs';
        const nombre_plural = data?.moneda?.nombre_plural || 'Bolivianos';
        const { subtotal, descuento, montoGiftCard, total } = calcTotales(data);
        return (
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{`SUBTOTAL ${simbolo}. `}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(subtotal > 0 ? subtotal : 0, simbolo)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{`DESCUENTO ${simbolo}. `}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(descuento > 0 ? descuento : 0, simbolo)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{`TOTAL ${simbolo}. `}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(total > 0 ? total : 0, simbolo)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{`MONTO GIFT CARD ${simbolo}. `}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(montoGiftCard > 0 ? montoGiftCard : 0, simbolo)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>{`MONTO A PAGAR ${simbolo}. `}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>
                            {formatCurrency(total > 0 ? total : 0, simbolo)}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 13, fontWeight: 'bold' }}>
                            {`IMPORTE BASE CRÉDITO FISCAL ${simbolo}. `}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>
                            {formatCurrency(total > 0 ? total : 0, simbolo)}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', height: 40 }} />
                <SPDF.Text style={{ ...textStyle, paddingLeft: 8 }}>
                    {'Son: '}{(SMath.numberToLetter(total > 0 ? total : 0, { p: '', s: '' }) || '').toLowerCase()}{`00/100 ${nombre_plural}`}
                </SPDF.Text>
            </SPDF.View>
        );
    }

    static FooterRecibo(qr, data) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                {qr ? (
                    <SPDF.Image src={`data:image/png;base64,${qr}`} style={{ width: 70, height: 70 }} />
                ) : (
                    <SPDF.Text style={{ ...textStyle, fontSize: 12, color: 'red' }}>QR no disponible</SPDF.Text>
                )}
                <SPDF.View style={{ width: '100%', height: 8 }} />
                <SPDF.Text style={{ ...textStyle, width: '85%', textAlign: 'center' }}>
                    {'¡Gracias por su preferencia!'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 6 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: 14, width: '75%', textAlign: 'center' }}>
                    {'Guarde este comprobante para sus registros.'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 4 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: 14, textAlign: 'center', width: '70%' }}>
                    Visítenos en www.{validarDato(data?.empresa?.razon_social, 'EMPRESA')}.com
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 10 }} />
            </SPDF.View>
        );
    }

    render() {
        return (
            <SView onPress={() => ComprobanteRollo.imprimir(this.props.data?.key)}>
                <SText>PDF COMPRA ROLLO</SText>
            </SView>
        );
    }
}
