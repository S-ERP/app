import React, { Component } from 'react';
import { Text } from 'react-native';
import { SLoad, SView } from 'servisofts-component';
import { Page, View, Text as SPDFText, create } from 'servisofts-rn-spdf';
import Model from '../../../Model';

// Constantes de estilo
const STYLES = {
    page: { width: 464, margin: 24, padding: 0, borderWidth: 0 },
    text: {
        fontSize: 14,
        font: 'Roboto',
        color: '#000',
    },
    bold: { fontWeight: 'bold' },
    center: { textAlign: 'center' },
    spacer: { height: 8 },
    separator: {
        dash: { width: '100%', fontSize: 14, textAlign: 'center' },
        dotted: { width: '100%', fontSize: 16, textAlign: 'center' },
    },
    row: { width: '100%', flexDirection: 'row', marginVertical: 2 },
    column: { width: '50%', alignItems: 'flex-end' },
};

// Utilidad para validar datos
const validarDato = (value, fallback = 'Sin dato') =>
    value && value.toString().trim() ? value : fallback;

// Utilidad para formatear números
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));

// Utilidad para formatear fechas
const formatDate = (dateStr, fallback = 'Sin fecha') => {
    if (!dateStr) return fallback;
    const dt = new Date(dateStr);
    return isNaN(dt)
        ? fallback
        : dt.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
};

// Utilidad para formatear moneda
const formatCurrency = (value) => `${toNumber(value).toFixed(2)} Bs`;

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detalles: null,
            sucursal: null,
            loading: true,
            error: null,
        };
    }

    async componentDidMount() {
        try {
            const [detalles, sucursal] = await Promise.all([
                Model.compra_venta_detalle.Action.getAllConProductos({
                    key_compra_venta: this.props.data.key,
                }),
                Model.sucursal.Action.getByKey({ key: this.props.data.key_sucursal }),
            ]);
            this.setState({ detalles, sucursal, loading: false });
        } catch (error) {
            console.error('Error fetching data:', error);
            this.setState({ error: 'Error al cargar los datos', loading: false });
        }
    }

    // Separador genérico
    Separator(type = "dash") {
        const separatorText =
            type === "dash"
                ? "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
                : ".......................................................................................................";

        return (
            <View style={{ width: "100%", paddingVertical: 4 }}>
                <SPDFText
                    style={{
                        width: "100%",
                        fontSize: type === "dash" ? 14 : 17,
                        fontWeight: type === "dash" ? "bold" : "normal",
                    }}
                >
                    {separatorText}
                </SPDFText>
            </View>
        );
    }

    // Encabezado del recibo
    HeaderRecibo = () => {
        const { data } = this.props;
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center }}>
                    FACTURA {validarDato(data.numero_factura, 'N/A')}
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center }}>
                    CON DERECHO A CRÉDITO FISCAL
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                    COMERCIAL TORRICO
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                    CASA MATRIZ
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                    No. Punto de Venta {validarDato(data.punto_venta, '0')}
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                    c/ Diego de Bazan s/n, comercial minorista, artesanos
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                    Tel. +591 70838928
                </SPDFText>
                <View style={STYLES.spacer} />
            </View>
        );
    };

    // Cuerpo del recibo (NIT, número de factura, código de autorización)
    BodyRecibo = () => {
        const { data } = this.props;
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center }}>
                    NIT
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                    {validarDato(data.nit_empresa, '818134019')}
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center }}>
                    FACTURA N°
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center }}>
                    {validarDato(data.numero_factura, 'N/A')}
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center }}>
                    CÓD. AUTORIZACIÓN
                </SPDFText>
                <SPDFText style={{ ...STYLES.text, ...STYLES.center, width: '90%' }}>
                    {validarDato(data.codigo_autorizacion, 'N/A')}
                </SPDFText>
            </View>
        );
    };

    // Información de la sucursal
    Sucursal = () => {
        const { sucursal } = this.state;
        if (!sucursal) {
            return (
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center }}>
                        No se encontró información de la sucursal
                    </SPDFText>
                </View>
            );
        }
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>
                    SUCURSAL
                </SPDFText>
                {[
                    { label: 'Descripción:', value: sucursal.descripcion },
                    { label: 'Dirección:', value: sucursal.direccion },
                    { label: 'Teléfono:', value: sucursal.telefono },
                    { label: 'Correo:', value: sucursal.correo },
                ].map(({ label, value }, index) => (
                    <View key={index} style={STYLES.row}>
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
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>
                    CLIENTE
                </SPDFText>
                {[
                    { label: 'Nombre/Razón Social:', value: cliente.razon_social || cliente.nombres },
                    { label: 'NIT/CI/CEX:', value: cliente.nit },
                    { label: 'Cód. Cliente:', value: cliente.codigo_cliente },
                    { label: 'Fecha de Emisión:', value: data.fecha_emision },
                ].map(({ label, value }, index) => (
                    <View key={index} style={STYLES.row}>
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
        const { detalles } = this.state;
        if (!detalles) return <SLoad />;

        const itemsArray = Object.values(detalles);
        const subtotal = itemsArray.reduce(
            (acc, item) => acc + toNumber(item.cantidad) * toNumber(item.precio_unitario),
            0
        );

        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>
                    DETALLE
                </SPDFText>
                {itemsArray.map((item, index) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    const total = cantidad * precio;

                    return (
                        <View key={item.key || index} style={{ width: '100%', marginBottom: 4 }}>
                            <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>
                                {validarDato(item.descripcion, 'Sin descripción')}
                            </SPDFText>
                            <View style={STYLES.row}>
                                <View style={{ width: '60%', alignItems: 'flex-end' }}>
                                    <SPDFText style={STYLES.text}>
                                        {`cant ${cantidad.toFixed(2)} x ${formatCurrency(precio)}`}
                                    </SPDFText>
                                </View>
                                <View style={{ width: '40%', alignItems: 'flex-end' }}>
                                    <SPDFText style={STYLES.text}>{formatCurrency(total)}</SPDFText>
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
        const { detalles } = this.state;
        if (!detalles) return null;

        const itemsArray = Object.values(detalles);
        const subtotal = itemsArray.reduce(
            (acc, item) => acc + toNumber(item.cantidad) * toNumber(item.precio_unitario),
            0
        );
        const descuento = toNumber(data.descuento);
        const montoGiftCard = toNumber(data.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;
        const montoPagar = total > 0 ? total : 0;
        const importeBaseCreditoFiscal = montoPagar;

        // Convertir total a texto (implementar lógica según necesidades)
        const totalTexto = data.totalTexto || `Son: ${formatCurrency(montoPagar)}`;

        return (
            <View style={{ width: '100%' }}>
                {[
                    { label: 'SUBTOTAL Bs.', value: subtotal },
                    { label: 'DESCUENTO Bs.', value: descuento },
                    { label: 'TOTAL Bs.', value: total },
                    { label: 'MONTO GIFT CARD Bs.', value: montoGiftCard },
                    { label: 'MONTO A PAGAR Bs.', value: montoPagar, bold: true },
                    { label: 'IMPORTE BASE CRÉDITO FISCAL Bs.', value: importeBaseCreditoFiscal, bold: true },
                ].map(({ label, value, bold }, index) => (
                    <View key={index} style={STYLES.row}>
                        <View style={{ width: '60%', alignItems: 'flex-end' }}>
                            <SPDFText style={{ ...STYLES.text, ...(bold && STYLES.bold) }}>{label}</SPDFText>
                        </View>
                        <View style={{ width: '40%', alignItems: 'flex-end' }}>
                            <SPDFText style={{ ...STYLES.text, ...(bold && STYLES.bold) }}>
                                {formatCurrency(value)}
                            </SPDFText>
                        </View>
                    </View>
                ))}
                <View style={STYLES.spacer} />
                <SPDFText style={{ ...STYLES.text, paddingLeft: 8 }}>{totalTexto}</SPDFText>
            </View>
        );
    };

    // Información de la venta
    InfoVenta = () => {
        const { data } = this.props;
        const fecha = formatDate(data.fecha_on);
        const hora = data.fecha_on
            ? new Date(data.fecha_on).toLocaleTimeString('es-BO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
            : 'Sin hora';

        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>
                    INFORMACIÓN DE LA VENTA
                </SPDFText>
                {[
                    { label: 'Descripción:', value: data.descripcion },
                    { label: 'Tipo:', value: data.tipo },
                    { label: 'Tipo Pago:', value: data.tipo_pago },
                    { label: 'Observación:', value: data.observacion },
                    { label: 'Fecha:', value: fecha },
                    { label: 'Hora:', value: hora },
                    { label: 'Key Usuario:', value: data.key_usuario },
                ].map(({ label, value }, index) => (
                    <View key={index} style={STYLES.row}>
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

    // Footer del recibo
    Footer = () => (
        <View style={{ width: '100%', alignItems: 'center' }}>
            <View style={STYLES.spacer} />
            <SPDFText style={{ ...STYLES.text, ...STYLES.center, width: '85%' }}>
                ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY.
            </SPDFText>
            <View style={STYLES.spacer} />
            <SPDFText style={{ ...STYLES.text, fontSize: 12, ...STYLES.center, width: '75%' }}>
                Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de productos.
            </SPDFText>
            <View style={STYLES.spacer} />
            <SPDFText style={{ ...STYLES.text, fontSize: 12, ...STYLES.center, width: '70%' }}>
                Este Documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea.
            </SPDFText>
            <View style={{ width: '100%', height: 20 }} />
            {/* Placeholder para código QR - implementar según necesidades */}
            <View style={{ width: 160, height: 160, borderWidth: 1 }} />
        </View>
    );

    // Generar el PDF
    handlePress = () => {
        const { loading, error } = this.state;
        if (loading) return;
        if (error) {
            console.error(error);
            return;
        }

        create(
            <Page style={STYLES.page}>
                <View style={STYLES.spacer} />
                {this.HeaderRecibo()}
                {this.Separator()}
                {this.BodyRecibo()}
                {this.Separator()}

                {this.InfoVenta()}
                {this.Separator()}

                {this.Sucursal()}
                {this.Separator()}
                {this.Cliente()}
                {this.Separator()}

                {this.DetalleVenta()}
                {this.Separator()}


                {this.InfoVenta()}
                {this.Separator()}

                {this.InfoSubtotal()}
                {this.Separator()}
                {this.Footer()}


            </Page>
        );
    };

    render() {
        const { loading, error } = this.state;
        if (loading) return <SLoad />;
        if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

        return (
            <SView onPress={this.handlePress.bind(this)}>
                <Text>Exportar PDF</Text>
            </SView>
        );
    }
}

// Validación de props                 {this.Separator(type = "dotted")}

import PropTypes from 'prop-types';

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