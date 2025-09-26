import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SImage } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';

const textStyle = { fontSize: 14, font: 'Roboto', paddingBottom: 4 };

const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
const formatDate = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : fallback;

export default class ComprobanteRollo extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }



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

            let cajero = {};
            if (compraVenta?.key_cajero) {
                try {
                    const usuarios = await MDL.usuario.getByKeys([compraVenta.key_cajero]);
                    cajero = Array.isArray(usuarios) ? usuarios[0] : usuarios[compraVenta.key_cajero] || {};
                } catch (error) {
                    console.error("Error al obtener datos del cajero:", error);
                }
            }

            const clientes = await MDL.crm.cliente.getAll();


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
                cajero,
                cliente: clientes.find(a => a?.key === compraVenta.key_cliente) || {},
                proveedor,
                moneda
            };


            // const dataQR = await ComprobanteRollo.getQR(key).catch(error => {
            //     console.error("Error al obtener QR:", error);
            //     return null;
            // });
            // console.log('QR ', dataQR?.data?.b64);

            SPDF.create(
                <SPDF.Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }}>
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ComprobanteRollo.HeaderRecibo(compraVentaData)}
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ComprobanteRollo.InfoVenta(compraVentaData)}
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ComprobanteRollo.proveedor(compraVentaData)}
                    {ComprobanteRollo.espacio()}
                    {ComprobanteRollo.detalle(compraVentaData)}
                    {ComprobanteRollo.espacioPunto()}
                    {ComprobanteRollo.subtotales(compraVentaData)}
                    {ComprobanteRollo.espacio()}
                    {ComprobanteRollo.TipoPago(compraVentaData)}
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                    {ComprobanteRollo.Cajero(compraVentaData.cajero)}
                    {ComprobanteRollo.espacio()}

                    <SPDF.View style={{ width: '100%', height: 70 }}></SPDF.View>.

                    {/* <SPDF.View style={{ width: '100%', height: dataQR ? 156 : 10 }}></SPDF.View> */}
                    {/* {ComprobanteRollo.FooterRecibo(dataQR?.data?.b64, data)} */}
                    <SPDF.View style={{ width: '100%', height: 10 }}></SPDF.View>
                </SPDF.Page>
            );
        } catch (error) {
            console.error("Error al generar el comprobante:", error);
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
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>COMPROBANTE NRO: </SPDF.Text>
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

    static proveedor(data) {
        const proveedor = data?.proveedor || {};
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
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>NIT/CI: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>
                            {validarDato(proveedor?.nit || proveedor?.ci, '0')}
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
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                </SPDF.View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item?.cantidad);
                    const precio = toNumber(item?.precio_unitario);
                    const descuentoItem = toNumber(item?.descuento || 0);
                    const subtotalItem = (cantidad * precio) - descuentoItem;
                    return (
                        <SPDF.View key={i} style={{ width: '100%', marginBottom: 4 }}>
                            <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>{item.descripcion}</SPDF.Text>
                            <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                                <SPDF.View style={{ width: '50%' }}>
                                    <SPDF.Text style={{ ...textStyle }}>
                                        cant {cantidad} x {formatCurrency(precio)}
                                        {descuentoItem > 0 ? ` (Desc. ${formatCurrency(descuentoItem)})` : ''}
                                    </SPDF.Text>
                                </SPDF.View>
                                <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                                    <SPDF.Text style={{ ...textStyle }}>{formatCurrency(subtotalItem)}</SPDF.Text>
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
                        <SPDF.Text style={{ ...textStyle }}>SUBTOTAL Bs.</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(subtotal > 0 ? subtotal : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>DESCUENTO Bs.</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(descuento > 0 ? descuento : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>TOTAL Bs.</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(total > 0 ? total : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>MONTO GIFT CARD Bs.</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '40%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(montoGiftCard > 0 ? montoGiftCard : 0)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4 }} />
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '60%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>MONTO A PAGAR Bs.</SPDF.Text>
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
                            IMPORTE BASE CRÉDITO FISCAL Bs.
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
                    Son: {SMath.numberToLetter(total, { p: '', s: '' }).toLowerCase()}00/100 Bolivianos
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
                <SPDF.View style={{ width: '100%', height: 8 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, width: '85%', textAlign: 'center' }}>
                    ESTA ORDEN DE COMPRA DOCUMENTA EL PEDIDO REALIZADO.
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle, width: '85%', textAlign: 'center' }}>
                    POR FAVOR PROCÉSELA SEGÚN LOS TÉRMINOS ACORDADOS.
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 6 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, fontSize: 14, width: '75%', textAlign: 'center' }}>
                    ESTE DOCUMENTO NO CONSTITUYE UN COMPROBANTE DE PAGO.
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
            <SView onPress={() => ComprobanteRollo.imprimir(this.props.data?.key)}>
                <SText>PDF ROLLO</SText>
            </SView>
        );
    }
}