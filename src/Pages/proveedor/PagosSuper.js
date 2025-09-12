import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme, SDate, SMath, SIcon, SNavigation } from 'servisofts-component';
import PopupPagoCuota from './Components/PopupPagoCuota';
import MDL from '../../MDL';
import SIconApp from '../../Assets/SIconApp';

// Color palette
const COLORS = {
    CARD: STheme.color.card,
    TEXT: STheme.color.text,
    BORDER: STheme.color.lightGray + '30',
    PENDIENTE: '#b58940',
    PENDIENTE_BACKGROUNG: '#fef8c3',
    PAGADO: '#22C55E',
    PAGADO_BACKGROUNG: '#dafce6',
    VENCIDO: '#ee343b',
    VENCIDO_BACKGROUNG: '#eeccda',
    ACCENT: '#3B82F6',
    ACCENT_BACKGROUNG: '#7da4e2ff',
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
        pendiente: { label: 'Pendiente', color: COLORS.PENDIENTE, bgColor: COLORS.PENDIENTE_BACKGROUNG, textColor: COLORS.PENDIENTE, icon: 'history' },
        pagado: { label: 'Pagado', color: COLORS.PAGADO, bgColor: COLORS.PAGADO_BACKGROUNG, textColor: COLORS.PAGADO, icon: 'bien' },
        vencido: { label: 'Vencido', color: COLORS.VENCIDO, bgColor: COLORS.VENCIDO_BACKGROUNG, textColor: COLORS.VENCIDO, icon: 'AlertOutline' },
    },
    metodosPago: ['Efectivo', 'Transferencia', 'Tarjeta de crédito', 'Cheque'],
};

// Reusable UI component for info rows
const InfoRow = ({ label, value, icon, iconColor, bgColor, subText, subTextColor }) => (
    <SView col={'xs-12 sm-6 md-3'} row center height={90} style={{ padding: 8 }}>
        <SView center style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: bgColor || STheme.color.lightGray }}>
            <SIconApp name={icon} width={24} height={24} fill={iconColor || 'transparent'} stroke={iconColor || STheme.color.lightBlack} />
        </SView>
        <SView flex style={{ marginLeft: 12 }}>
            <SText {...TYPOGRAPHY.LABEL}>{label}</SText>
            {typeof value === 'string' ? (
                <SText {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>{value}</SText>
            ) : (
                value
            )}
            {subText && <SText fontSize={10} color={subTextColor || COLORS.TEXT}>{subText}</SText>}
        </SView>
    </SView>
);

export default class PagosSuper extends Component {
    state = {
        data: null,
        loading: true,
        error: null,
        showPaid: false, // New state to toggle paid/no-debt/no-cuota purchases
    };

    /**
     * Calculates cuota summaries for a single compra
     * @param {Object[]} cuotas - Array of cuota objects
     * @param {string} moneda - Currency code
     * @returns {Object} Summary of cuota counts and amounts
     */
    calculateCuotaSummary(cuotas, moneda) {
        const today = new SDate();
        const summary = {
            cant_pendientes: 0,
            cant_mora: 0,
            cant_pagado: 0,
            montototal_pendientes: 0,
            montototal_mora: 0,
            montototal_pagado: 0,
            deudaTotal: 0,
        };

        cuotas.forEach(cuota => {
            const saldoPendiente = parseFloat(cuota.monto || 0);
            if (saldoPendiente <= 0) {
                cuota.estado = 'Pagado';
                summary.cant_pagado++;
                summary.montototal_pagado += parseFloat(cuota.monto_total || 0);
            } else {
                const fechaVencimiento = new SDate(cuota.vencimiento, 'yyyy-MM-dd');
                if (fechaVencimiento.isBefore(today)) {
                    cuota.estado = 'Vencido';
                    summary.cant_mora++;
                    summary.montototal_mora += saldoPendiente;
                    summary.deudaTotal += saldoPendiente;
                } else {
                    cuota.estado = 'Pendiente';
                    summary.cant_pendientes++;
                    summary.montototal_pendientes += saldoPendiente;
                    summary.deudaTotal += saldoPendiente;
                }
            }
        });

        return {
            ...summary,
            montototal_pendientes: summary.montototal_pendientes.toFixed(2),
            montototal_mora: summary.montototal_mora.toFixed(2),
            montototal_pagado: summary.montototal_pagado.toFixed(2),
            deudaTotal: summary.deudaTotal.toFixed(2),
        };
    }

    /**
     * Loads data for the component
     * @returns {Object} Aggregated data for rendering
     */
    async loadData() {
        try {
            const key_proveedor = SNavigation.getParam('key_proveedor') || '15843bf1-0ee2-467d-8052-aa394d2cf477';
            const registros = await MDL.compra_venta.getTransaccionCuotas(key_proveedor);
            if (!registros || !Array.isArray(registros)) {
                return this.getDefaultData();
            }

            const cuotasPromises = registros.map(compra => MDL.compra_venta.getCuotasCompras(compra.key));
            const cuotasResults = await Promise.all(cuotasPromises);

            const globalSummary = {
                cant_pendientes: 0,
                cant_mora: 0,
                cant_pagado: 0,
                montototal_pendientes: 0,
                montototal_mora: 0,
                montototal_pagado: 0,
                deudaTotal: {},
            };

            registros.forEach((compra, index) => {
                const cuotas = cuotasResults[index] || [];
                const moneda = compra.moneda || 'BOB';
                compra.cuotasDetalle = cuotas;
                compra.summary = this.calculateCuotaSummary(cuotas, moneda);

                globalSummary.cant_pendientes += compra.summary.cant_pendientes;
                globalSummary.cant_mora += compra.summary.cant_mora;
                globalSummary.cant_pagado += compra.summary.cant_pagado;
                globalSummary.montototal_pendientes += parseFloat(compra.summary.montototal_pendientes);
                globalSummary.montototal_mora += parseFloat(compra.summary.montototal_mora);
                globalSummary.montototal_pagado += parseFloat(compra.summary.montototal_pagado);
                globalSummary.deudaTotal[moneda] = (globalSummary.deudaTotal[moneda] || 0) + parseFloat(compra.summary.deudaTotal);
            });

            const proveedor = await MDL.inventario.proveedor.getByKey(key_proveedor) || {};
            const monedaDefault = Object.keys(globalSummary.deudaTotal).length
                ? Object.keys(globalSummary.deudaTotal).reduce((a, b) => globalSummary.deudaTotal[a] > globalSummary.deudaTotal[b] ? a : b, 'BOB')
                : 'BOB';

            return {
                cant_pendientes: globalSummary.cant_pendientes,
                cant_mora: globalSummary.cant_mora,
                cant_pagado: globalSummary.cant_pagado,
                montototal_pendientes: globalSummary.montototal_pendientes.toFixed(2),
                montototal_mora: globalSummary.montototal_mora.toFixed(2),
                montototal_pagado: globalSummary.montototal_pagado.toFixed(2),
                deudaTotal: Object.keys(globalSummary.deudaTotal).length ? globalSummary.deudaTotal : null,
                proveedor,
                compras: registros,
                monedaDefault,
            };
        } catch (error) {
            console.error('Error in loadData:', error);
            return this.getDefaultData();
        }
    }

    getDefaultData() {
        return {
            cant_pendientes: 0,
            cant_mora: 0,
            cant_pagado: 0,
            montototal_pendientes: '0.00',
            montototal_mora: '0.00',
            montototal_pagado: '0.00',
            deudaTotal: null,
            proveedor: {},
            compras: [],
            monedaDefault: 'BOB',
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
                <SIcon name="Spinner" width={24} height={24} fill={COLORS.ACCENT} />
                <SHr h={8} />
                <SText {...TYPOGRAPHY.BODY}>Cargando datos...</SText>
            </SView>
        );
    }

    labelEstado(estado) {
        const estadoNormalizado = estado?.toLowerCase() || 'pendiente';
        const { color, bgColor, textColor, label, icon } = DATA_CONFIG.estados[estadoNormalizado] || DATA_CONFIG.estados.pendiente;

        return (
            <SView row center accessibilityLabel={`Estado: ${label}`}>
                <SView style={{ backgroundColor: bgColor, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: color }}>
                    <SView row center>
                        <SIconApp name={icon} width={12} height={12} fill={textColor} />
                        <SView width={4} />
                        <SText {...TYPOGRAPHY.BODY} bold color={textColor}>{label}</SText>
                    </SView>
                </SView>
            </SView>
        );
    }

    renderMonto(monto, moneda, color) {
        return <SText {...TYPOGRAPHY.VALUE} color={color}>{moneda} {SMath.formatMoney(monto)}</SText>;
    }

    resumen() {
        const { data, loading } = this.state;
        if (loading || !data) return this.renderLoading();

        const { proveedor, cant_pendientes, cant_mora, cant_pagado, montototal_pendientes, montototal_mora, montototal_pagado, monedaDefault } = data;
        const totalDeuda = (parseFloat(montototal_pendientes) + parseFloat(montototal_mora)).toFixed(2);

        return (
            <SView col={'xs-12'} style={{ padding: 16 }}>
                <SView col={'xs-12'} row backgroundColor={COLORS.CARD} style={{ borderRadius: 8, borderWidth: 1, borderColor: COLORS.BORDER, padding: 12, flexWrap: 'wrap' }}>
                    <InfoRow
                        label="Proveedor"
                        value={proveedor?.razon_social || 'Sin nombre'}
                        icon="iconEdifcio"
                        iconColor={STheme.color.lightBlack}
                    />
                    <InfoRow
                        label="Deuda Total"
                        value={
                            <SView>
                                {this.renderMonto(totalDeuda, monedaDefault, COLORS.VENCIDO)}
                                <SText fontSize={10} color={COLORS.VENCIDO}>Mora: {monedaDefault} {SMath.formatMoney(montototal_mora)}</SText>
                                <SText fontSize={10} color={COLORS.PENDIENTE}>Pendiente: {monedaDefault} {SMath.formatMoney(montototal_pendientes)}</SText>
                            </SView>
                        }
                        icon="iconPesos"
                        iconColor={COLORS.VENCIDO}
                        bgColor={COLORS.VENCIDO_BACKGROUNG}
                    />
                    <InfoRow
                        label="Total Pagado"
                        value={this.renderMonto(montototal_pagado, monedaDefault, COLORS.TEXT)}
                        icon="pagotarjeta"
                        iconColor={COLORS.PAGADO}
                        bgColor={COLORS.PAGADO_BACKGROUNG}
                        subText="(Amortizado)"
                    />
                    <InfoRow
                        label="Cuotas"
                        value={`Pendientes: ${cant_pendientes} | Mora: ${cant_mora} | Pagadas: ${cant_pagado}`}
                        icon="iconLista"
                        iconColor={COLORS.PENDIENTE}
                        bgColor={COLORS.PENDIENTE_BACKGROUNG}
                    />
                </SView>
            </SView>
        );
    }

    header() {
        return (
            <SView col={'xs-12'} style={{ padding: 16 }}>
                <SText {...TYPOGRAPHY.TITLE} color={COLORS.TEXT}>Compras a Crédito y Pagos Pendientes</SText>
            </SView>
        );
    }

    itemCard() {
        const { data, loading, showPaid } = this.state;
        if (loading || !data) return this.renderLoading();
        const { compras, monedaDefault } = data;
        if (!compras?.length) {
            return (
                <SView col={'xs-12'} center style={{ padding: 16 }}>
                    <SText {...TYPOGRAPHY.BODY}>No hay compras registradas.</SText>
                </SView>
            );
        }

        // Filter compras based on showPaid state
        const filteredCompras = showPaid
            ? compras
            : compras.filter(compra => compra.summary?.deudaTotal > 0 && compra.cuotasDetalle?.length > 0);

        if (!filteredCompras.length) {
            return (
                <SView col={'xs-12'} center style={{ padding: 16 }}>
                    <SText {...TYPOGRAPHY.BODY}>
                        {showPaid ? 'No hay compras registradas.' : 'No hay compras con deudas o cuotas pendientes.'}
                    </SText>
                </SView>
            );
        }

        return (
            <SView col={'xs-12'} style={{ padding: 8 }}>
                <SView col={'xs-12'} row style={{ flexWrap: 'wrap' }}>
                    {filteredCompras.map((compra, index) => {
                        const totalCompra = compra.detalles?.reduce((sum, item) => sum + (item.precio_unitario || 0) * (item.cantidad || 0), 0) || 0;
                        const { cant_mora, montototal_mora, montototal_pendiente, montototal_pagado, deudaTotal } = compra.summary || {};

                        return (
                            <SView
                                key={compra.key || `compra-${index}`}
                                col={'xs-12 md-4 lg-3'}
                                margin={4}
                                style={{ backgroundColor: COLORS.CARD, borderRadius: 6, borderWidth: 1, borderColor: COLORS.BORDER, padding: 16 }}
                            >
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.TITLE} color={COLORS.TEXT}>Compra #{compra.key || (index + 1)}</SText>
                                    {this.labelEstado(deudaTotal > 0 ? 'pendiente' : 'pagado')}
                                </SView>
                                <SHr h={8} />
                                <SText {...TYPOGRAPHY.BODY} color={COLORS.TEXT} numberOfLines={1}>
                                    {compra.descripcion || 'Sin descripción'}
                                </SText>
                                <SHr h={12} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Fecha:</SText>
                                    <SText {...TYPOGRAPHY.BODY}>{new SDate(compra.fecha_on || new Date()).toString('dd/MM/yyyy')}</SText>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Total compra:</SText>
                                    <SText {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>
                                        {compra.moneda || monedaDefault} {SMath.formatMoney(totalCompra)}
                                    </SText>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Cuotas en mora:</SText>
                                    <SText {...TYPOGRAPHY.BODY} color={cant_mora ? COLORS.VENCIDO : COLORS.TEXT}>
                                        {cant_mora || 0} cuotas
                                    </SText>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Deuda:</SText>
                                    <SView>
                                        <SText {...TYPOGRAPHY.BODY} color={deudaTotal > 0 ? COLORS.VENCIDO : COLORS.TEXT}>
                                            {compra.moneda || monedaDefault} {SMath.formatMoney(deudaTotal)}
                                        </SText>
                                        {montototal_mora > 0 && (
                                            <SText fontSize={10} color={COLORS.VENCIDO}>
                                                Mora: {compra.moneda || monedaDefault} {SMath.formatMoney(montototal_mora)}
                                            </SText>
                                        )}
                                        {montototal_pendiente > 0 && (
                                            <SText fontSize={10} color={COLORS.PENDIENTE}>
                                                Pendiente: {compra.moneda || monedaDefault} {SMath.formatMoney(montototal_pendiente)}
                                            </SText>
                                        )}
                                    </SView>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Pagado:</SText>
                                    <SText {...TYPOGRAPHY.BODY} color={COLORS.PAGADO}>
                                        {compra.moneda || monedaDefault} {SMath.formatMoney(montototal_pagado)}
                                    </SText>
                                </SView>
                                <SHr h={16} />
                                <SView col={'xs-12'} center>
                                    <SView col={'xs-12'} style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: STheme.color.lightGray + '66' }}>
                                        {deudaTotal > 0 ? (
                                            <SView
                                                col={'xs-12'}
                                                onPress={() => {
                                                    PopupPagoCuota.open({
                                                        editObject: {
                                                            ...compra,
                                                            id: compra.key || (index + 1),
                                                            moneda: compra.moneda || monedaDefault,
                                                            cuotasDetalle: compra.cuotasDetalle || [],
                                                            cuotas_en_mora: { cantidad: cant_mora, monto: montototal_mora },
                                                            totalMora: montototal_mora,
                                                            totalPendiente: montototal_pendiente,
                                                            totalPagado: montototal_pagado,
                                                        },
                                                        onSuccess: () => {
                                                            this.setState({ loading: true });
                                                            this.loadData().then(data => this.setState({ data, loading: false }));
                                                        },
                                                    });
                                                }}
                                                backgroundColor={COLORS.ACCENT}
                                                style={{ padding: 12, borderRadius: 6, borderWidth: 1, borderColor: COLORS.ACCENT + '33' }}
                                                center
                                            >
                                                <SView row center>
                                                    <SIconApp name="pagotarjeta" width={16} height={16} fill={COLORS.TEXT} />
                                                    <SView width={4} />
                                                    <SText {...TYPOGRAPHY.LABEL} color={COLORS.TEXT}>Pagar Cuotas Pendientes</SText>
                                                </SView>
                                            </SView>
                                        ) : (
                                            <SView
                                                col={'xs-12'}
                                                onPress={() => {
                                                    PopupPagoCuota.open({
                                                        editObject: {
                                                            ...compra,
                                                            id: compra.key || (index + 1),
                                                            moneda: compra.moneda || monedaDefault,
                                                            pagado: true,
                                                            cuotasDetalle: compra.cuotasDetalle || [],
                                                            cuotas_en_mora: { cantidad: 0, monto: 0 },
                                                            totalMora: montototal_mora,
                                                            totalPendiente: montototal_pendiente,
                                                            totalPagado: montototal_pagado,
                                                        },
                                                        onSuccess: () => {
                                                            this.setState({ loading: true });
                                                            this.loadData().then(data => this.setState({ data, loading: false }));
                                                        },
                                                    });
                                                }}
                                                backgroundColor={COLORS.ACCENT}
                                                style={{ padding: 12, borderRadius: 6, borderWidth: 1, borderColor: COLORS.ACCENT + '33' }}
                                                center
                                            >
                                                <SView row center>
                                                    <SIcon name="Eyes" width={16} height={16} fill={COLORS.TEXT} />
                                                    <SView width={4} />
                                                    <SText {...TYPOGRAPHY.LABEL} color={COLORS.TEXT}>Ver Historial de Pagos</SText>
                                                </SView>
                                            </SView>
                                        )}
                                    </SView>
                                </SView>
                            </SView>
                        );
                    })}
                </SView>
            </SView>
        );
    }

    render() {
        const { showPaid } = this.state;
        return (
            <SPage title={'Compras de Distribuidora Central S.A.'} disableScroll>
                <SScrollView2 disableHorizontal>
                    <SView col={'xs-12'} center style={{ padding: 8 }}>
                        {this.header()}
                        <SView col={'xs-12'} center style={{ padding: 8 }}>
                            <SView
                                col={'xs-12 sm-6 md-4'}
                                onPress={() => this.setState({ showPaid: !showPaid })}
                                backgroundColor={COLORS.ACCENT}
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: COLORS.ACCENT + '33',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <SIconApp name={showPaid ? 'EyeOff' : 'Eye'} width={16} height={16} fill={COLORS.TEXT} />
                                <SView width={8} />
                                <SText {...TYPOGRAPHY.LABEL} color={COLORS.TEXT}>
                                    {showPaid ? 'Ocultar Pagadas' : 'Mostrar Pagadas'}
                                </SText>
                            </SView>
                        </SView>
                        {this.resumen()}
                        {this.itemCard()}
                        <SHr h={16} />
                    </SView>
                </SScrollView2>
            </SPage>
        );
    }
}