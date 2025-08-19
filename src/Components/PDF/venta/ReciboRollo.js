import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SMath, SView, SText, SDate, SImage } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import Model from '../../../Model';
import MDL from '../../../MDL';
const textStyle = { fontSize: 14, font: 'Roboto', paddingBottom: 4 };
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
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
        const data = await MDL.compra_venta.getByKeyComraVenta(key);
        console.log('miralo ', data);
        SPDF.create(
            <SPDF.Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }}>
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                {ReciboRollo.HeaderRecibo(data)}
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                {ReciboRollo.InfoVenta(data)}
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                {ReciboRollo.cliente(data)}
                {ReciboRollo.espacio()}
                {ReciboRollo.detalle(data)}
                {ReciboRollo.espacioPunto()}
                {ReciboRollo.subtotales(data)}
                {ReciboRollo.espacio()}
                {ReciboRollo.TipoPago(data)}
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                {ReciboRollo.Cajero()}
                {ReciboRollo.espacio()}
                <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                {ReciboRollo.FooterRecibO()}
            </SPDF.Page>
        );
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
        const empresa = MDL.empresa.select;
        const sucursal = Model.sucursal.Action.getByKey({ key: data?.key_sucursal });
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: 'bold', fontSize: 16 }}>
                    {validarDato(empresa?.razon_social, 'EMPRESA')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle }}>
                    SUCURSAL: {validarDato(sucursal?.descripcion, 'Central')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle, alignItems: 'center' }}>
                    NRO. PUNTO DE VENTA {validarDato(data?.venta, '1')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle }}>
                    {validarDato(sucursal?.direccion, 'Av. Sur Nro. 0')}
                </SPDF.Text>
                <SPDF.Text style={{ ...textStyle }}>
                    TELÉFONO: {validarDato(sucursal?.telefono, 'S/N')}
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
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{'99997'}</SPDF.Text>
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
    static cliente(data) {
        const cliente = data?.cliente || {};
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CLIENTE: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>
                            {validarDato((cliente?.razon_social.toUpperCase()), 'S/N')}
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
                        <SPDF.Text style={{ ...textStyle, width: '70%' }}>123456</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }
   
    static Cajero() {
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CAJERO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>MARIA SOSSA</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>CAJA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle }}>01</SPDF.Text>
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
        let pagado = 200; // Este valor debería venir de los datos reales
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        let cambio = subtotal - pagado;
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                <SPDF.View style={{ width: '100%', flexDirection: 'row' }}>
                    <SPDF.View style={{ width: '50%', alignItems: 'end' }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>FORMA DE PAGO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: '50%' }}>
                        <SPDF.Text style={{ ...textStyle, width: '100%' }}>{(data?.tipo_pago.toUpperCase())}</SPDF.Text>
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
                        <SPDF.Text style={{ ...textStyle }}>{formatCurrency(cambio > 0 ? cambio : 0)}</SPDF.Text>
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
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        return (
            <SPDF.View style={{ width: '100%' }}>
                <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: 'bold' }}>DETALLE</SPDF.Text>
                    <SPDF.View style={{ width: '100%', height: 4 }}></SPDF.View>
                </SPDF.View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
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
    static FooterRecibO() {
        const empresa = MDL.empresa.select;
        return (
            <SPDF.View style={{ width: '100%', alignItems: 'center' }}>
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
                    Visítenos en www.{validarDato(empresa?.razon_social, 'EMPRESA')}.com
                </SPDF.Text>
                <SPDF.View style={{ width: '100%', height: 10 }}></SPDF.View>
            </SPDF.View>
        );
    }
    render() {
        return (
            <SView onPress={() => ReciboRollo.imprimir(this.props.data?.key)}>
                <Text>PDF ROLLO</Text>
            </SView>
        );
    }
}
