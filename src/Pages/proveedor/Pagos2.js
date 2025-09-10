import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme, SDate, SMath, SIcon } from 'servisofts-component';
import PopupPagoCuota from './Components/PopupPagoCuota';
import MDL from '../../MDL';
import SIconApp from '../../Assets/SIconApp';

// Color palette
const COLORS = {
    CARD: STheme.color.card,
    TEXT: STheme.color.text,
    BORDER: STheme.color.lightGray + '30',
    PENDIENTE: '#b58940',
    // PENDIENTE: '#EAB308',
    PAGADO: '#22C55E',
    VENCIDO: '#ee343b',
    // VENCIDO: '#F97316',
    ACCENT: '#3B82F6',
};

// Typography configuration
const TYPOGRAPHY = {
    TITLE: { fontSize: 18, bold: true },
    SUBTITLE: { fontSize: 14, bold: true },
    BODY: { fontSize: 12 },
    LABEL: { fontSize: 12, color: COLORS.TEXT },
    VALUE: { fontSize: 14, bold: true },
};

// State configuration
const DATA_CONFIG = {
    estados: {
        pendiente: { label: 'Pendiente', color: COLORS.PENDIENTE, bgColor: '#fef8c3', textColor: '#b58940', icon: 'history' },
        pagado: { label: 'Pagado', color: COLORS.PAGADO, bgColor: '#dafce6', textColor: '#42b88f', icon: 'bien' },
        vencido: { label: 'Vencido', color: COLORS.VENCIDO, bgColor: '#ee343b', textColor: '#eeccda', icon: 'AlertOutline' },
    },
    metodosPago: ['Efectivo', 'Transferencia', 'Tarjeta de crédito', 'Cheque'],
};

export default class Pagos2 extends Component {
    state = {
        data: null,
        loading: true,
        error: null,
    };

    async loadData() {
        try {
            const key_proveedor = '15843bf1-0ee2-467d-8052-aa394d2cf477';
            const registros = await MDL.compra_venta.getTransaccionCuotas(key_proveedor);

            if (!registros || !Array.isArray(registros)) {
                return this.getDefaultData();
            }

            const cantidadTotalCompras = registros.length;
            let pendientes = 0;
            let deudaTotal = {};
            let amortizadoTotal = {};

            for (const compra of registros) {
                if (compra.cuotas?.cantidad > 0) pendientes++;
                if (compra.cuotas_en_mora?.monto) {
                    const moneda = compra.moneda || 'BOB';
                    deudaTotal[moneda] = (deudaTotal[moneda] || 0) + compra.cuotas_en_mora.monto;
                }
                if (compra.monto_amortizado) {
                    const moneda = compra.moneda || 'BOB';
                    amortizadoTotal[moneda] = (amortizadoTotal[moneda] || 0) + compra.monto_amortizado;
                }
            }

            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            return {
                cantidadTotalCompras,
                pendientes,
                deudaTotal: Object.keys(deudaTotal).length ? deudaTotal : null,
                amortizadoTotal: Object.keys(amortizadoTotal).length ? amortizadoTotal : null,
                proveedor: proveedores.find(prov => prov.key === key_proveedor) || {},
                compras: registros,
            };
        } catch (error) {
            console.error('Error in loadData:', error);
            return this.getDefaultData();
        }
    }

    getDefaultData() {
        return {
            cantidadTotalCompras: 0,
            pendientes: 0,
            deudaTotal: null,
            amortizadoTotal: null,
            proveedor: {},
            compras: [],
        };
    }

    componentDidMount() {
        this.loadData().then(data => {
            this.setState({ data, loading: false });
        }).catch(error => {
            this.setState({ error, loading: false, data: this.getDefaultData() });
        });
    }

    renderLoading() {
        return (
            <SView col={'xs-12'} center style={{ padding: 16 }}>
                <SIcon name='Spinner' width={24} height={24} fill={COLORS.ACCENT} />
                <SHr h={8} />
                <SText {...TYPOGRAPHY.BODY}>Cargando datos...</SText>
            </SView>
        );
    }

    labelEstado(estado) {
        const estadoNormalizado = estado?.toLowerCase() || 'pendiente';
        const { color, bgColor, textColor, label, icon } = DATA_CONFIG.estados[estadoNormalizado];

        return (
            <SView row center accessibilityLabel={`Estado: ${label}`}>
                <SView
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderWidth: 1,
                        borderColor: color,
                    }}
                >
                    <SView row center>
                        <SIconApp name={icon} width={12} height={12} fill={textColor} />
                        <SView width={4} />
                        <SText {...TYPOGRAPHY.BODY} bold color={textColor}>{label}</SText>
                    </SView>
                </SView>
            </SView>
        );
    }

    renderMonto(montoObj, monedaDefault, color) {
        if (!montoObj) {
            return <SText {...TYPOGRAPHY.VALUE} color={color}>{monedaDefault} 0.00</SText>;
        }

        return Object.entries(montoObj).map(([moneda, monto]) => (
            <SView key={moneda} row style={{ marginTop: 4 }}>
                <SText {...TYPOGRAPHY.VALUE} color={color}>
                    {moneda} {SMath.formatMoney(monto)}
                </SText>
            </SView>
        ));
    }

    resumen() {
        const { data, loading } = this.state;
        if (loading || !data) return this.renderLoading();

        const { proveedor, pendientes, deudaTotal, amortizadoTotal, monedaDefault = 'BOB' } = data;

        const summaryItems = [
            {
                icon: 'iconEdifcio',
                color: COLORS.PAGADO,
                bgColor: DATA_CONFIG.estados.pagado.bgColor,
                label: 'Proveedor',
                value: proveedor?.razon_social || 'Sin nombre',
            },
            {
                icon: 'iconPesos',
                color: COLORS.PENDIENTE,
                bgColor: DATA_CONFIG.estados.pendiente.bgColor,
                label: 'Deuda Total',
                value: this.renderMonto(deudaTotal, monedaDefault, COLORS.PENDIENTE),
            },
            {
                icon: 'pagotarjeta',
                color: COLORS.PAGADO,
                bgColor: DATA_CONFIG.estados.pagado.bgColor,
                label: 'Total Pagado',
                value: this.renderMonto(amortizadoTotal, monedaDefault, COLORS.PAGADO),
            },
            {
                icon: 'Evento',
                color: COLORS.VENCIDO,
                bgColor: DATA_CONFIG.estados.vencido.bgColor,
                label: 'Compras Pendientes',
                value: pendientes,
            },
        ];

        return (
            <SView col={'xs-12'} style={{ padding: 16 }}>
                <SView
                    col={'xs-12'}
                    row
                    backgroundColor={COLORS.CARD}
                    style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLORS.BORDER,
                        padding: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    {summaryItems.map((item, index) => (
                        <SView
                            key={index}
                            col={'xs-12 sm-6 md-3'}
                            row
                            center
                            height={80}
                            style={{ padding: 8 }}
                        >
                            <SView
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    backgroundColor: item.bgColor,
                                    borderWidth: 1,
                                    borderColor: item.color,
                                }}
                                center
                            >
                                <SIcon name={item.icon} width={24} height={24} fill={item.color} />
                            </SView>
                            <SView flex style={{ marginLeft: 12 }}>
                                <SText {...TYPOGRAPHY.LABEL}>{item.label}</SText>
                                <SView>
                                    {typeof item.value === 'string' ? (
                                        <SText {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>{item.value}</SText>
                                    ) : (
                                        item.value
                                    )}
                                </SView>
                            </SView>
                        </SView>
                    ))}
                </SView>
                <SHr h={16} />
            </SView>
        );
    }

    header() {
        return (
            <SView col={'xs-12'} style={{ padding: 16 }}>
                <SHr h={16} />
                <SText {...TYPOGRAPHY.TITLE} color={COLORS.TEXT}>
                    Compras a Crédito y Pagos Pendientes
                </SText>
                <SHr h={16} />
            </SView>
        );
    }

    handleViewHistory(compra) {
        // Placeholder for viewing payment history
        console.log('View history for compra:', compra);
        // Implement navigation or modal display for payment history
    }

    handlePayPending(compra) {
        // Assuming PopupPagoCuota is a component that handles payment
        PopupPagoCuota.open({
            compra,
            onSuccess: () => {
                // Refresh data after successful payment
                this.loadData().then(data => {
                    this.setState({ data, loading: false });
                });
            },
        });
    }

    itemCard() {
        const { data, loading } = this.state;
        if (loading || !data) return this.renderLoading();

        const { compras, monedaDefault = 'BOB' } = data;
        if (!compras?.length) {
            return (
                <SView col={'xs-12'} center style={{ padding: 16 }}>
                    <SText {...TYPOGRAPHY.BODY}>No hay compras registradas.</SText>
                </SView>
            );
        }

        return (
            <SView col={'xs-12'} style={{ padding: 8 }}>
                <SView col={'xs-12'} row style={{ flexWrap: 'wrap' }}>
                    {compras.map((compra, index) => (
                        <SView
                            key={index}
                            col={'xs-12 md-4 lg-3'}
                            margin={4}
                            style={{
                                backgroundColor: COLORS.CARD,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: COLORS.BORDER,
                                padding: 16,
                            }}
                        >
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText {...TYPOGRAPHY.TITLE} color={COLORS.TEXT}>Compra #{index + 1}</SText>
                                {this.labelEstado(compra.cuotas_en_mora?.monto ? 'pendiente' : 'pagado')}
                            </SView>
                            <SHr h={8} />
                            <SText {...TYPOGRAPHY.BODY} color={COLORS.TEXT} numberOfLines={2}>
                                {compra.descripcion || 'Sin descripción'}
                            </SText>
                            <SHr h={12} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText {...TYPOGRAPHY.LABEL}>Fecha:</SText>
                                <SText {...TYPOGRAPHY.BODY}>
                                    {new SDate(compra.fecha_on || new Date()).toString('yyyy-MM-dd')}
                                </SText>
                            </SView>
                            <SHr h={8} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText {...TYPOGRAPHY.LABEL}>Total compra:</SText>
                                {compra.detalles?.map((item, idx) => (
                                    <SText key={idx} {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>
                                        {compra.moneda || monedaDefault} {SMath.formatMoney(item.precio_unitario * item.cantidad ?? 0)}
                                    </SText>
                                ))}
                            </SView>
                            <SHr h={8} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText {...TYPOGRAPHY.LABEL}>Cuotas pendientes/mora:</SText>
                                <SText
                                    {...TYPOGRAPHY.BODY}
                                    color={compra.cuotas_en_mora?.cantidad ? COLORS.VENCIDO : COLORS.TEXT}
                                >
                                    {`${compra.cuotas_en_mora?.cantidad || 0} cuotas`}
                                </SText>
                            </SView>
                            <SHr h={8} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText {...TYPOGRAPHY.LABEL}>Cuotas total:</SText>
                                <SText
                                    {...TYPOGRAPHY.BODY}
                                    color={COLORS.TEXT}
                                >
                                    {`${compra.cuotas?.cantidad || 0} cuotas`}
                                </SText>
                            </SView>
                            <SHr h={16} />
                            <SView col={'xs-12'} center>
                                <SView
                                    col={'xs-12'}
                                    style={{
                                        paddingVertical: 12,
                                        borderTopWidth: 1,
                                        borderColor: COLORS.ACCENT,
                                    }}
                                >
                                    {compra.cuotas_en_mora?.cantidad ? (
                                        <SView
                                            col={'xs-12'}
                                            onPress={() => this.handlePayPending(compra)}
                                            backgroundColor={COLORS.PENDIENTE}
                                            style={{
                                                padding: 12,
                                                borderRadius: 6,
                                                borderWidth: 1,
                                                borderColor: COLORS.PENDIENTE + '33',
                                            }}
                                            center
                                        >
                                            <SView row center>
                                                <SIcon name={'Money'} width={16} height={16} fill={COLORS.TEXT} style={{ marginRight: 8 }} />
                                                <SText {...TYPOGRAPHY.SUBTITLE} color={COLORS.TEXT}>Pagar Cuotas Pendientes</SText>
                                            </SView>
                                        </SView>
                                    ) : (
                                        <SView
                                            col={'xs-12'}
                                            onPress={() => this.handleViewHistory(compra)}
                                            backgroundColor={COLORS.ACCENT + '22'}
                                            style={{
                                                padding: 12,
                                                borderRadius: 6,
                                                borderWidth: 1,
                                                borderColor: COLORS.ACCENT + '33',
                                            }}
                                            center
                                        >
                                            <SView row center>
                                                <SIcon name={'Eyes'} width={16} height={16} fill={COLORS.ACCENT} style={{ marginRight: 8 }} />
                                                <SText {...TYPOGRAPHY.SUBTITLE} color={COLORS.ACCENT}>Ver Historial de Pagos</SText>
                                            </SView>
                                        </SView>
                                    )}
                                </SView>
                            </SView>
                        </SView>
                    ))}
                </SView>
            </SView>
        );
    }

    render() {
        return (
            <SPage title={'Compras de Distribuidora Central S.A.'} disableScroll>
                <SScrollView2 disableHorizontal>
                    <SView col={'xs-12'} center style={{ padding: 8 }}>
                        {this.header()}
                        {this.resumen()}
                        {this.itemCard()}
                        <SHr h={24} />
                    </SView>
                </SScrollView2>
            </SPage>
        );
    }
}