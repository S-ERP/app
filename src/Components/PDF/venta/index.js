import React, { Component } from 'react';
import { Text } from 'react-native';
import { SLoad, SView } from 'servisofts-component';
import { Page, View, Text as SPDFText, create } from 'servisofts-rn-spdf';
import Model from '../../../Model';
import PropTypes from 'prop-types';

// Centralized styles
const STYLES = {
    page: { width: 464, margin: 24, padding: 0 },
    text: { fontSize: 14, font: 'Roboto', color: '#000' },
    bold: { fontWeight: 'bold' },
    center: { textAlign: 'center' },
    spacer: { height: 8 },

    row: { width: '100%', flexDirection: 'row', marginVertical: 2 },
    column: { width: '50%', alignItems: 'flex-end' },
};

// Utilities
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
const formatDate = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : fallback;

class index extends Component {
    // Separador genérico


    // Encabezado del recibo
    HeaderRecibo = () => {
        const { data } = this.props;
        const fields = [
            `FACTURA ${validarDato(data.numero_factura)}`,
            'CON DERECHO A CRÉDITO FISCAL',
            'COMERCIAL TORRICO',
            'CASA MATRIZ',
            `No. Punto de Venta ${validarDato(data.punto_venta, '0')}`,
            'c/ Diego de Bazan s/n, comercial minorista, artesanos',
            'Tel. +591 70838928',
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

    // Cuerpo del recibo
    BodyRecibo = () => {
        const { data } = this.props;
        const fields = [
            { label: 'NIT', value: validarDato(data.nit_empresa, '818134019') },
            { label: 'FACTURA N°', value: validarDato(data.numero_factura) },
            { label: 'CÓD. AUTORIZACIÓN', value: validarDato(data.codigo_autorizacion), wide: true },
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {fields.map(({ label, value, wide }, i) => (
                    <SPDFText key={i} style={{ ...STYLES.text, ...(label ? STYLES.bold : {}), ...STYLES.center, ...(wide ? { width: '90%' } : {}) }}>
                        {label || value}
                    </SPDFText>
                ))}
            </View>
        );
    };




    // Información de la sucursal
    Sucursal() {
        const sucursal = Model.sucursal.Action.getByKey({ key: this.props.data.key_sucursal });
        if (!sucursal) return <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center }}>Sin información de sucursal {this.props.data.key_sucursal} </SPDFText>;
        const fields = [
            { label: 'Descripción:', value: sucursal.descripcion },
            { label: 'Dirección:', value: sucursal.direccion },
            { label: 'Teléfono:', value: sucursal.telefono },
            { label: 'Correo:', value: sucursal.correo },
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>SUCURSAL</SPDFText>
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

    // Información del cliente
    Cliente = () => {
        const { data } = this.props;
        const cliente = data.cliente || {};
        const fields = [
            { label: 'Nombre/Razón Social:', value: cliente.razon_social || cliente.nombres },
            { label: 'NIT/CI/CEX:', value: cliente.nit },
            { label: 'Cód. Cliente:', value: cliente.codigo_cliente },
            { label: 'Fecha de Emisión:', value: data.fecha_emision },
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>CLIENTE</SPDFText>
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

    // Detalles de la venta
    DetalleVenta = () => {
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: this.props.data.key });
        if (!detalles) return <SLoad />;
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>DETALLE</SPDFText>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    return (
                        <View key={item.key || i} style={{ width: '100%', marginBottom: 4 }}>
                            <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>{validarDato(item.descripcion)}</SPDFText>
                            <View style={STYLES.row}>
                                <View style={{ width: '60%', alignItems: 'flex-end' }}>
                                    <SPDFText style={STYLES.text}>{`cant ${cantidad.toFixed(2)} x ${formatCurrency(precio)}`}</SPDFText>
                                </View>
                                <View style={{ width: '40%', alignItems: 'flex-end' }}>
                                    <SPDFText style={STYLES.text}>{formatCurrency(cantidad * precio)}</SPDFText>
                                </View>
                            </View>
                        </View>
                    );
                })}
                <View style={STYLES.spacer} />
                <View style={STYLES.row}>
                    <View style={{ width: '60%', alignItems: 'flex-end' }}>
                        <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>SUBTOTAL Bs.</SPDFText>
                    </View>
                    <View style={{ width: '40%', alignItems: 'flex-end' }}>
                        <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>{formatCurrency(subtotal)}</SPDFText>
                    </View>
                </View>
            </View>
        );
    };

    // Información de totales
    InfoSubtotal = () => {
        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key });
        if (!detalles) return null;
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const descuento = toNumber(data.descuento);
        const montoGiftCard = toNumber(data.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;
        const fields = [
            { label: 'SUBTOTAL Bs.', value: subtotal },
            { label: 'DESCUENTO Bs.', value: descuento },
            { label: 'TOTAL Bs.', value: total },
            { label: 'MONTO GIFT CARD Bs.', value: montoGiftCard },
            { label: 'MONTO A PAGAR Bs.', value: total > 0 ? total : 0, bold: true },
            { label: 'IMPORTE BASE CRÉDITO FISCAL Bs.', value: total > 0 ? total : 0, bold: true },
        ];
        return (
            <View style={{ width: '100%' }}>
                {fields.map(({ label, value, bold }, i) => (
                    <View key={i} style={STYLES.row}>
                        <View style={{ width: '60%', alignItems: 'flex-end' }}>
                            <SPDFText style={{ ...STYLES.text, ...(bold ? STYLES.bold : {}) }}>{label}</SPDFText>
                        </View>
                        <View style={{ width: '40%', alignItems: 'flex-end' }}>
                            <SPDFText style={{ ...STYLES.text, ...(bold ? STYLES.bold : {}) }}>{formatCurrency(value)}</SPDFText>
                        </View>
                    </View>
                ))}
                <SPDFText style={{ ...STYLES.text, paddingLeft: 8 }}>
                    {validarDato(data.totalTexto, `Son: ${formatCurrency(total > 0 ? total : 0)}`)}
                </SPDFText>
            </View>
        );
    };

    // Información de la venta
    InfoVenta = () => {
        const { data } = this.props;
        const fields = [
            { label: 'Descripción:', value: data.descripcion },
            { label: 'Tipo:', value: data.tipo },
            { label: 'Tipo Pago:', value: data.tipo_pago },
            { label: 'Observación:', value: data.observacion },
            { label: 'Fecha:', value: formatDate(data.fecha_on) },
            {
                label: 'Hora:',
                value: data.fecha_on
                    ? new Date(data.fecha_on).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'Sin hora',
            },
            { label: 'Key Usuario:', value: data.key_usuario },
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>
                    INFORMACIÓN DE LA VENTA
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


    Espacio() {
        return (
            <View style={{ width: "100%" }}>
                <View style={{ width: "100%", height: 4 }} />
                <SPDFText style={{ width: "100%", fontSize: 14, fontWeight: "bold" }}>
                    {'- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'}
                </SPDFText>
                <View style={{ width: "100%", height: 4 }} />
            </View>
        );
    }

    EspacioPunto() {
        return (
            <View style={{ width: "100%" }}>
                <View style={{ width: "100%", height: 4 }} />
                <SPDFText style={{ width: "100%", fontSize: 14 * 1.2 }}>
                    {'.......................................................................................................'}
                </SPDFText>
                <View style={{ width: "100%", height: 4 }} />
            </View>
        );
    }




    // Footer del recibo
    Footer() {
        return <View style={{ width: "100%", alignItems: "center" }}>
            <View style={{ width: "100%", height: 16 }} />
            <SPDFText style={{ ...STYLES.text, width: "85%", textAlign: "center" }}>
                {"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY."}
            </SPDFText>
            <View style={{ width: "100%", height: 12 }} />
            <SPDFText style={{ ...STYLES.text, fontSize: 14 * 0.8, width: "75%", textAlign: "center" }}>
                {"Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de productos."}
            </SPDFText>
            <View style={{ width: "100%", height: 8 }} />
            <SPDFText
                style={{ ...STYLES.text, fontSize: 14 * 0.9, textAlign: "center", width: "70%" }}
            >
                {"'Este Documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturacion en linea."}
            </SPDFText>

            <View style={{ width: "100%", height: 20 }} />
            <View style={{ width: 160, height: 160, borderWidth: 1 }} />
            <View style={{ width: "100%", height: 20 }} />
        </View>
    }

    // Generar el PDF
    handlePress = () => {
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: this.props.data.key });
        if (!detalles) {
            console.error('No se encontraron detalles de la venta');
            return;
        }
        create(
            <Page style={STYLES.page}>


                {this.HeaderRecibo()}
                {this.Espacio()}
                {this.BodyRecibo()}
                {this.EspacioPunto()}
                {this.Espacio()}
                {this.InfoVenta()}
                {this.EspacioPunto()}
                {this.Sucursal()}
                {this.Espacio()}
                {this.Cliente()}
                {this.Espacio()}
                {this.DetalleVenta()}
                {this.EspacioPunto()}
                {this.InfoSubtotal()}
                {this.Espacio()}
                {this.Footer()}


            </Page>
        );
    };

    render() {
        return (
            <SView onPress={this.handlePress.bind(this)}>
                <Text>Exportar PDF</Text>
            </SView>
        );
    }
}

index.propTypes = {
    data: PropTypes.shape({
        key: PropTypes.string.isRequired,
        numero_factura: PropTypes.string,
        nit_empresa: PropTypes.string,
        codigo_autorizacion: PropTypes.string,
        punto_venta: PropTypes.string,
        key_sucursal: PropTypes.string,
        cliente: PropTypes.object,
        descripcion: PropTypes.string,
        tipo: PropTypes.string,
        tipo_pago: PropTypes.string,
        observacion: PropTypes.string,
        fecha_on: PropTypes.string,
        fecha_emision: PropTypes.string,
        key_usuario: PropTypes.string,
        descuento: PropTypes.number,
        monto_gift_card: PropTypes.number,
        totalTexto: PropTypes.string,
    }).isRequired,
};

export default index;