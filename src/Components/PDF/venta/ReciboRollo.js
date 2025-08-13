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
    textItemDetalle: { fontSize: 10, font: 'Roboto', color: '#000' },
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


    // Encabezado del recibo
    HeaderRecibo() {
        const { data } = this.props;

        // Obtener la sucursal
        const sucursal = Model.sucursal.Action.getByKey({ key: data.key_sucursal });

        console.log("Datos completos:", JSON.stringify(data));

        const fields = [
            "PINTURAS EL COLOR S.A.",
            `Sucursal: ${validarDato(sucursal?.descripcion, 'Centro Comercial')}`,
            `${validarDato(sucursal?.direccion, 'Av. xxx Nro. 0')}`,
            sucursal?.telefono ? `Tel: ${sucursal.telefono}` : "Tel: (123) 00000000",
            "REF: A-125678-9",
        ];

        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {fields.map((text, i) => (
                    <SPDFText
                        key={i}
                        style={{
                            ...STYLES.text,
                            ...(i < 2 ? STYLES.bold : {}),
                            ...STYLES.center
                        }}
                    >
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
            { label: 'Cliente:', value: cliente.razon_social || cliente.nombres },
            // { label: 'Nombre/Razón Social:', value: cliente.razon_social || cliente.nombres },
            { label: 'NIT/CI/CEX:', value: cliente.nit },
            // { label: 'Cód. Cliente:', value: cliente.codigo_cliente },
            // { label: 'Fecha de Emisión:', value: data.fecha_emision },
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {/* <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>CLIENTE</SPDFText> */}
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


                    <SPDFText style={{ ...STYLES.textItemDetalle, ...STYLES.bold, width: '70%' }}>DESCRIPCIÓN</SPDFText>
                    <SPDFText style={{ ...STYLES.textItemDetalle, ...STYLES.bold, width: '8%' }}>CANT</SPDFText>
                    <SPDFText style={{ ...STYLES.textItemDetalle, ...STYLES.bold, width: '10%' }}>PRECIO</SPDFText>
                    <SPDFText style={{ ...STYLES.textItemDetalle, ...STYLES.bold, width: '8%' }}>TOTAL</SPDFText>
                    {/* <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '50%' }}>DESCRIPCIÓN</SPDFText>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '15%' }}>CANT</SPDFText>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '20%' }}>PRECIO</SPDFText>
                    <SPDFText style={{ ...STYLES.text, ...STYLES.bold, width: '15%' }}>TOTAL</SPDFText> */}
                </View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    return (
                        <View key={item.key || i} style={{ width: '100%', marginBottom: 4 }}>
                            <SPDFText style={STYLES.text}>{validarDato(item.descripcion)}</SPDFText>
                            <View style={STYLES.row}>
                                <SPDFText style={{ ...STYLES.textItemDetalle, width: '50%' }} />
                                <SPDFText style={{ ...STYLES.textItemDetalle, width: '15%' }}>{cantidad.toFixed(2)}</SPDFText>
                                <SPDFText style={{ ...STYLES.textItemDetalle, width: '20%' }}>{formatCurrency(precio)}</SPDFText>
                                <SPDFText style={{ ...STYLES.textItemDetalle, width: '15%' }}>{formatCurrency(cantidad * precio)}</SPDFText>
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


    // Detalles de la venta
    DetalleVenta2 = () => {
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
                {/* <View style={STYLES.row}>
                    <View style={{ width: '60%', alignItems: 'flex-end' }}>
                        <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>SUBTOTAL Bs.</SPDFText>
                    </View>
                    <View style={{ width: '40%', alignItems: 'flex-end' }}>
                        <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>{formatCurrency(subtotal)}</SPDFText>
                    </View>
                </View> */}
            </View>
        );
    };

    // Información del cliente
    Cajero() {
        const { data } = this.props;
        const cliente = data.cliente || {};
        const fields = [
            { label: 'Cajero:', value: cliente.razon_social || cliente.nombres || 'María Gómez' },
            { label: 'Caja:', value: cliente.nit || '01' },
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {/* <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 6 }}>
                        CLIENTE
                    </SPDFText> */}
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

                {this.EspacioPunto()}

                <View style={STYLES.row}>
                    <View style={{ width: '60%', alignItems: 'flex-end' }}>
                        <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>TOTAL A PAGAR:</SPDFText>
                    </View>
                    <View style={{ width: '40%', alignItems: 'flex-end' }}>
                        <SPDFText style={{ ...STYLES.text, ...STYLES.bold }}>{formatCurrency(subtotal)}</SPDFText>
                    </View>
                </View>


            </View>
        );
    };

    // Información de la venta
    InfoVenta = () => {
        const { data } = this.props;
        const fields = [
            { label: 'No. Recibo:', value: "b2aa9d81" },
            // { label: 'No. Recibo:', value: data.key_usuario },
            // { label: 'Descripción:', value: data.descripcion },
            // { label: 'Tipo:', value: data.tipo },
            // { label: 'Tipo Pago:', value: data.tipo_pago },
            // { label: 'Observación:', value: data.observacion },
            { label: 'Fecha:', value: formatDate(data.fecha_on) },
            {
                label: 'Hora:',
                value: data.fecha_on
                    ? new Date(data.fecha_on).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'Sin hora',
            },
            // { label: 'Key Usuario:', value: data.key_usuario },
        ];
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <SPDFText style={{ ...STYLES.text, ...STYLES.bold, ...STYLES.center, marginBottom: 8 }}>
                    RECIBO DE VENTA
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
                <View style={{ width: "100%", height: 6 }} />
                <SPDFText style={{ width: "100%", fontSize: 12, fontWeight: "bold" }}>
                    {'- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'}
                </SPDFText>
                <View style={{ width: "100%", height: 6 }} />
            </View>
        );
    }

    EspacioPunto() {
        return (
            <View style={{ width: "100%" }}>
                <View style={{ width: "100%", height: 6 }} />
                <SPDFText style={{ width: "100%", fontSize: 14 }}>
                    {'.......................................................................................................'}
                </SPDFText>
                <View style={{ width: "100%", height: 6 }} />
            </View>
        );
    }




    // Footer del recibo
    Footer() {
        return <View style={{ width: "100%", alignItems: "center" }}>
            <View style={{ width: "100%", height: 16 }} />
            <SPDFText style={{ ...STYLES.text, width: "85%", textAlign: "center" }}>Guarde este recibo para devoluciones.</SPDFText>
            <View style={{ width: "100%", height: 8 }} />
            <SPDFText style={{ ...STYLES.text, fontSize: 14 * 0.8, width: "75%", textAlign: "center" }}>Guarde este recibo para devoluciones.</SPDFText>
            <View style={{ width: "100%", height: 8 }} />
            <SPDFText style={{ ...STYLES.text, fontSize: 14 * 0.9, textAlign: "center", width: "70%" }} >Visítenos en www.pinturaselcolor.com</SPDFText>
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
                {this.Espacio()}
                {this.HeaderRecibo()}
                {this.Espacio()}
                {this.InfoVenta()}
                {/* InfoVenta */}
                {/* {this.BodyRecibo()} */}
                {/* {this.EspacioPunto()} */}
                {/* {this.Espacio()} */}
                {this.EspacioPunto()}
                {/* {this.Sucursal()} */}
                {/* {this.Espacio()} */}
                {this.Cliente()}
                {this.Espacio()}
                {this.DetalleVenta()}
                {this.Espacio()}
                {this.DetalleVenta2()}
                {this.EspacioPunto()}
                {this.InfoSubtotal()}
                {this.Espacio()}

                {this.Cajero()}


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