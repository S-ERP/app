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
const formatDate = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : fallback;

export default class ReciboRollo extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static async imprimir(key) {
        const notificationKey = `pdf_rollo_${key}`;
        try {
            SNotification.send({
                key: notificationKey,
                title: "Generando recibo...",
                type: "loading",
            });

            const data = await MDL.compra_venta.getByKeyComraVenta(key);
            if (!data) {
                console.error("No se encontraron datos para la venta con key:", key);
                return;
            }

            const empresa = await MDL.empresa.getFull();
            if (!empresa?.key) {
                throw new Error('empresa data is missing or invalid');
            }
            const sucursal = empresa.sucursales?.find(a => a?.key === data?.key_sucursal) || {};

            let cajero = {};
            if (data?.key_cajero) {
                try {
                    const usuarios = await MDL.usuario.getByKeys([data.key_cajero]);
                    cajero = Array.isArray(usuarios) ? usuarios[0] : usuarios[data.key_cajero] || {};
                } catch (error) {
                    console.error("Error al obtener datos del cajero:", error);
                }
            }

            const clientes = await MDL.crm.cliente.getAll();

            let proveedor = {};
            if (data?.key_proveedor) {
                try {
                    proveedor = await MDL.inventario.proveedor.getByKey(data.key_proveedor) || {};
                } catch (error) {
                    console.error("Error al obtener datos del proveedor:", error);
                }
            }

            const moneda = empresa.monedas?.find(m => m.key === data.key_moneda) || {};

            const compraVentaData = {
                ...data,
                empresa,
                sucursal,
                cajero,
                cliente: clientes.find(a => a?.key === data.key_cliente) || {},
                proveedor,
                moneda
            };

            let qr = null;
            try {
                const qrResponse = await ReciboRollo.getQR(key);
                qr = qrResponse?.data?.b64;
            } catch (error) {
                console.error("Error al obtener QR:", error);
            }

            SPDF.create(
                <SPDF.Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }}>
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ReciboRollo.HeaderRecibo(compraVentaData)}
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ReciboRollo.InfoVenta(compraVentaData)}
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ReciboRollo.cliente(compraVentaData.cliente)}
                    {ReciboRollo.espacio()}
                    {ReciboRollo.detalle(compraVentaData)}
                    {ReciboRollo.espacioPunto()}
                    {ReciboRollo.subtotales(compraVentaData)}
                    {ReciboRollo.espacio()}
                    {ReciboRollo.TipoPago(compraVentaData)}
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ReciboRollo.Cajero(compraVentaData.cajero)}
                    {ReciboRollo.espacio()}
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {qr
                        ? <SPDF.View style={{ width: '100%', height: 156 }}></SPDF.View>
                        : <SPDF.View style={{ width: '100%', height: 10 }}></SPDF.View>
                    }
                    {ReciboRollo.FooterRecibO(qr, compraVentaData)}
                </SPDF.Page>
            );

            SNotification.send({
                key: notificationKey,
                title: "Recibo generado",
                body: "El PDF se generó correctamente.",
                color: STheme.color.success,
            });
        } catch (error) {
            console.error("Error al generar el recibo:", error);
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
        return (
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                <SPDF.Text style={{ width: '100%', fontSize: 14, fontWeight: 'bold' }}>
                    {'- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
            </SPDF.View>
        );
    }

    static espacioPunto() {
        return (
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                <SPDF.Text style={{ width: '100%', fontSize: 14 }}>
                    {'.....................................................................................................................'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
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
                    NRO. PUNTO DE VENTA {validarDato(data?.venta, '1')}
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

    static InfoVenta(data) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>RECIBO NRO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{validarDato(data?.numero_recibo, '#999')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>FECHA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatDate(data?.fecha_on)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>HORA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>
                            {data?.fecha_on
                                ? new Date(data?.fecha_on).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                : 'Sin hora'}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static cliente(cliente) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CLIENTE: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>
                            {validarDato(cliente?.nombres?.toUpperCase(), 'S/N')}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>NIT/CI: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>
                            {validarDato(cliente?.nit || cliente?.ci, '0')}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>COD. CLIENTE: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>{validarDato(cliente?.codigo, '#000')}</SPDF.Text>
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
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CAJERO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{validarDato(cajero?.Nombres, 'S/N')}</SPDF.Text>
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
        const detalles = data?.detalle;
        if (!detalles) return null;
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const descuento = toNumber(data?.descuento);
        const montoGiftCard = toNumber(data?.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;
        const pagado = toNumber(data?.monto_pagado);
        const cambio = pagado - total;
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>FORMA DE PAGO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{validarDato(data?.tipo_pago?.toUpperCase(), 'S/D')}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>MONTO PAGADO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(pagado > 0 ? pagado : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CAMBIO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(cambio >= 0 ? cambio : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalle(data) {
        const detalles = data?.detalle;
        const items = Object.values(detalles).length ? Object.values(detalles) : [
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
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                </SPDF.View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item?.cantidad);
                    const precio = toNumber(item?.precio_unitario);
                    return (
                        <SPDF.View key={i} style={{ width: '100%', marginBottom: 4 }}>
                            <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>{item.descripcion}</SPDF.Text>
                            <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                                <SPDF.View style={{ width: '50%' }}>
                                    <SPDF.Text style={{ ...textStyle }}>cant {cantidad} x {formatCurrency(precio)}</SPDF.Text>
                                </SPDF.View>
                                <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                                    <SPDF.Text style={{ ...textStyle }}>{formatCurrency(cantidad * precio)}</SPDF.Text>
                                </SPDF.View>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}
            </SPDF.View>
        );
    }

    static subtotales(data) {
        const detalles = data?.detalle;
        if (!detalles) return null;
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const descuento = toNumber(data?.descuento);
        const montoGiftCard = toNumber(data?.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;
        return (
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{'SUBTOTAL Bs. '}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(subtotal > 0 ? subtotal : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{'DESCUENTO Bs. '}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(descuento > 0 ? descuento : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{'TOTAL Bs. '}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(total > 0 ? total : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{'MONTO GIFT CARD Bs. '}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(montoGiftCard > 0 ? montoGiftCard : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>{'MONTO A PAGAR Bs. '}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>
                            {formatCurrency(total > 0 ? total : 0)}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 13, fontWeight: 'bold' }}>
                            {'IMPORTE BASE CRÉDITO FISCAL Bs. '}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>
                            {formatCurrency(total > 0 ? total : 0)}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', height: 40 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, paddingLeft: 8 }}>
                    {'Son: '}{SMath.numberToLetter(total, { p: '', s: '' }).toLowerCase()}{'00/100 Bolivianos'}
                </SPDF.Text>
            </SPDF.View>
        );
    }

    static FooterRecibO(qr, data) {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                {qr ? (
                    <SPDF.Image src={`data:image/png;base64,${qr}`} style={{ width: 70, height: 70 }} />
                ) : (
                    <SPDF.Text style={{ ...textStyle, fontSize: 12, color: 'red' }}>QR no disponible</SPDF.Text>
                )}
                <SPDF.View style={{ width: '100%', height: 8 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, width: '85%', textAlign: 'center' }}>
                    {'¡Gracias por su compra!'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 6 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, fontSize: 14, width: '75%', textAlign: 'center' }}>
                    {'Guarde este recibo para devoluciones.'}
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, fontSize: 14, textAlign: 'center', width: '70%' }}>
                    Visítenos en www.{validarDato(data?.empresa?.razon_social, 'EMPRESA')}.com
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 10 }}></SPDF.View>
            </SPDF.View>
        );
    }

    render() {
        return (
            <SView onPress={() => ReciboRollo.imprimir(this.props.data?.key)}>
                <SText>PDF ROLLO</SText>
            </SView>
        );
    }
}
