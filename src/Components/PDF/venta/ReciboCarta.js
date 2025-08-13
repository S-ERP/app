import React, { Component } from 'react';
import { Text } from 'react-native';
import { SLoad, SView } from 'servisofts-component';
import { Page, View, Text as SPDFText, create } from 'servisofts-rn-spdf';
import Model from '../../../Model';
import PropTypes from 'prop-types';

// Centralized styles
const STYLES = {
    page: { width: 464, margin: 24, padding: 0 },
    text: { fontSize: 12, fontFamily: 'Roboto', color: '#000' }, // Monoespaciada para recibos térmicos
    bold: { fontWeight: 'bold' },
    center: { textAlign: 'center' },
    spacer: { height: 6 },
    row: { width: '100%', flexDirection: 'row', marginVertical: 2 },
    column: { width: '50%', alignItems: 'flex-end' },
    separator: { width: '100%', fontSize: 12, fontFamily: 'Roboto', textAlign: 'center' },
};

// Utilities
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
const formatDate = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : fallback;
const formatTime = (dateStr, fallback = 'Sin hora') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
        : fallback;

class ReciboCarta extends Component {
    // Separador de guiones
    Espacio() {
        <View style={{ width: "100%" }}>
            <View style={{ width: "100%", height: 4 }} />
            <SPDFText style={{ width: "100%", fontSize: 14, fontWeight: "bold" }}>
                {"----------------------------------------"}
            </SPDFText>
            <View style={{ width: "100%", height: 4 }} />
        </View>
        // <View style={STYLES.spacer}>
        //     <SPDFText style={STYLES.separator}>{"----------------------------------------"}</SPDFText>
        // </View>
    }

    // Separador de puntos
    EspacioPunto() {
        <View style={STYLES.spacer}>
            <SPDFText style={STYLES.separator}>{"........................................"}</SPDFText>
        </View>
    }


    // Encabezado del recibo
    HeaderRecibo = () => {
        const { data } = this.props;
        const fields = [
            `PINTURAS EL COLOR S.A.`,
            `Sucursal: ${validarDato(data.sucursal, 'Centro Comercial XYZ')}`,
            `Av. Principal 123, Ciudad, País`,
            `Tel: (123) 456-7890`,
            `RIF: J-12345678-9`,
            `FACTURA N° ${validarDato(data.numero_factura, '0001256')}`,
            `CÓD. AUTORIZACIÓN: ${validarDato(data.codigo_autorizacion, 'Sin código')}`,
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {fields.map((text, i) => (
                    <SPDFText key={i} style={{ ...STYLES.text, ...(i < 2 ? STYLES.bold : {}), ...STYLES.center }}>
                        {text}
                    </SPDFText>
                ))}
            </View>
        );
    };

    // Información del cliente
    Cliente = () => {
        const { data } = this.props;
        const cliente = data.cliente || {};
        const fields = [
            { label: 'Nombre:', value: cliente.razon_social || cliente.nombres || 'Juan Pérez' },
            { label: 'Cédula/NIT:', value: cliente.nit || 'V-12345678' },
            { label: 'Fecha:', value: formatDate(data.fecha_emision, '13/08/2025') },
            { label: 'Hora:', value: formatTime(data.fecha_on, '01:19 AM') }, // Actualizado con la hora actual
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 6 }}>
                    CLIENTE
                </SPDFText>
                {fields.map(({ label, value }, i) => (
                    <View key={i} style={STYLES.row}>
                        <View style={STYLES.column}>
                            <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>{label}</SPDFText>
                        </View>
                        <View style={{ width: '50%' }}>
                            <SPDFText style={STYLES.text}>{validarDato(value)}</SPDFText>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    // Detalles de la venta (bote de pintura)
    DetalleVenta = () => {
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
            ]; // Fallback con bote de pintura
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 6 }}>
                    DETALLE
                </SPDFText>
                <View style={STYLES.row}>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '50%' }}>DESCRIPCIÓN</SPDFText>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '15%' }}>CANT</SPDFText>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '20%' }}>PRECIO</SPDFText>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '15%' }}>TOTAL</SPDFText>
                </View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    return (
                        <View key={item.key || i} style={{ width: '100%', marginBottom: 4 }}>
                            <SPDFText style={STYLES.text}>{validarDato(item.descripcion)}</SPDFText>
                            <View style={STYLES.row}>
                                <SPDFText style={{ ...STYLES.text, width: '50%' }} />
                                <SPDFText style={{ ...STYLES.text, width: '15%' }}>{cantidad.toFixed(2)}</SPDFText>
                                <SPDFText style={{ ...STYLES.text, width: '20%' }}>{formatCurrency(precio)}</SPDFText>
                                <SPDFText style={{ ...STYLES.text, width: '15%' }}>{formatCurrency(cantidad * precio)}</SPDFText>
                            </View>
                        </View>
                    );
                })}
                <View style={STYLES.row}>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '85%' }}>SUBTOTAL</SPDFText>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '15%' }}>{formatCurrency(subtotal)}</SPDFText>
                </View>
            </View>
        );
    };

    // Totales
    InfoSubtotal = () => {
        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key }) || {};
        const items = Object.values(detalles).length
            ? Object.values(detalles)
            : [{ cantidad: 1, precio_unitario: 25.0 }];
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const iva = subtotal * 0.16; // IVA 16% como en el ejemplo
        const total = subtotal + iva;
        const fields = [
            { label: 'SUBTOTAL Bs.', value: subtotal },
            { label: 'IVA (16%) Bs.', value: iva },
            { label: 'TOTAL A PAGAR Bs.', value: total, bold: true },
            { label: 'MONTO PAGADO Bs.', value: data.monto_pagado || total + 1 },
            { label: 'CAMBIO Bs.', value: (data.monto_pagado || total + 1) - total },
        ];
        return (
            <View style={{ width: '100%' }}>
                {fields.map(({ label, value, bold }, i) => (
                    <View key={i} style={STYLES.row}>
                        <SPDFText style={{ ...STYLES.text, ...(bold ? STYLES.bold : {}), width: '85%' }}>{label}</SPDFText>
                        <SPDFText style={{ ...STYLES.text, ...(bold ? STYLES.bold : {}), width: '15%' }}>
                            {formatCurrency(value)}
                        </SPDFText>
                    </View>
                ))}
            </View>
        );
    };

    // Footer
    Footer = () => (
        <View style={{ width: '100%', alignItems: 'center' }}>
            <SPDFText style={{ ...STYLES.text, ...STYLES.center, marginTop: 10 }}>
                ¡Gracias por su compra!
            </SPDFText>
            <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                Guarde este recibo para devoluciones.
            </SPDFText>
            <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                Visítenos en www.pinturaselcolor.com
            </SPDFText>
            <View style={STYLES.spacer} />
            <SPDFText style={{ ...STYLES.text, fontSize: 10, width: '90%', textAlign: 'center' }}>
                ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY.
            </SPDFText>
            <SPDFText style={{ ...STYLES.text, fontSize: 10, width: '80%', textAlign: 'center' }}>
                Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de productos.
            </SPDFText>
        </View>
    );

    // Generar el PDF
    handlePress = () => {
        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key });
        if (!detalles && !data) {
            console.error('No se encontraron datos para generar el recibo');
            return;
        }
        create(
            <Page style={STYLES.page}>
                {this.HeaderRecibo()}
                <this.Espacio />
                {this.Cliente()}
                <this.EspacioPunto />
                {this.DetalleVenta()}
                <this.EspacioPunto />
                {this.InfoSubtotal()}
                <this.Espacio />
                {this.Footer()}
            </Page>
        );
    };

    render() {
        return (
            <SView onPress={this.handlePress.bind(this)}>
                <Text>Exportar Recibo PDF</Text>
            </SView>
        );
    }
}

ReciboCarta.propTypes = {
    data: PropTypes.shape({
        key: PropTypes.string.isRequired,
        numero_factura: PropTypes.string,
        codigo_autorizacion: PropTypes.string,
        sucursal: PropTypes.string,
        cliente: PropTypes.object,
        fecha_emision: PropTypes.string,
        fecha_on: PropTypes.string,
        monto_pagado: PropTypes.number,
    }).isRequired,
};

export default ReciboCarta;