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

export default class PagosSuper extends Component {
    state = {
        data: null,
        loading: true,
        error: null,
    };

    async loadData() {
        try {
            const key_proveedor = SNavigation.getParam("key_proveedor") || '15843bf1-0ee2-467d-8052-aa394d2cf477';
            const registros = await MDL.compra_venta.getTransaccionCuotas(key_proveedor);

            if (!registros || !Array.isArray(registros)) {
                return this.getDefaultData();
            }

            // const cantidadTotalCompras = registros.length;
            // let pendientes = 0;
            let deudaTotal = {};
            // let amortizadoTotal = {};


            let cant_pendientes = 0;
            let cant_mora = 0;
            let cant_pagado = 0;
            let montototal_pendientes = 0;
            let montototal_mora = 0;
            let montototal_pagado = 0;

            // Fetch cuotas for all compras and calculate summaries
            const today = new SDate();
            for (const compra of registros) {

                const cuotas = await MDL.compra_venta.getCuotasCompras(compra.key) || [];
                const moneda = compra.moneda || 'BOB';

                // Calculate cuota summaries (aligned with PopupPagoCuota)
                for (const cuota of cuotas) {
                    const saldoPendiente = parseFloat(cuota.monto || 0);
                    if (saldoPendiente <= 0) {
                        cuota.estado = 'Pagado';
                        cant_pagado++;
                        montototal_pagado += parseFloat(cuota.monto_total || 0);
                        // amortizadoTotal[moneda] = (amortizadoTotal[moneda] || 0) + parseFloat(cuota.monto_total || 0);
                    } else {
                        const fechaVencimiento = new SDate(cuota.vencimiento, 'yyyy-MM-dd');
                        if (fechaVencimiento.isBefore(today)) {
                            cuota.estado = 'Vencido';
                            cant_mora++;
                            montototal_mora += saldoPendiente;
                            deudaTotal[moneda] = (deudaTotal[moneda] || 0) + saldoPendiente;
                        } else {
                            cuota.estado = 'Pendiente';
                            cant_pendientes++;
                            montototal_pendientes += saldoPendiente;
                            deudaTotal[moneda] = (deudaTotal[moneda] || 0) + saldoPendiente;
                        }
                    }
                }

                // Count pending compras
                // if (compra.cuotas_en_mora?.monto > 0 || (compra.cuotas?.monto || 0) > (compra.monto_amortizado || 0)) {
                //     pendientes++;
                // }

                // Update compra with cuotas
                compra.cuotasDetalle = cuotas;
            }

            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            const proveedor = proveedores.find(prov => prov.key === key_proveedor) || {};
            const monedaDefault = Object.keys(deudaTotal).length > 0
                ? Object.keys(deudaTotal).reduce((a, b) => deudaTotal[a] > deudaTotal[b] ? a : b, 'BOB')
                : 'BOB';

            return {
                // cantidadTotalCompras,
                // pendientes,

                cant_pendientes,
                cant_mora,
                cant_pagado,
                montototal_pendientes: montototal_pendientes.toFixed(2),
                montototal_mora: montototal_mora.toFixed(2),
                montototal_pagado: montototal_pagado.toFixed(2),

                // deudaTotal: Object.keys(deudaTotal).length ? deudaTotal : null,
                // amortizadoTotal: Object.keys(amortizadoTotal).length ? amortizadoTotal : null,
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
            cantidadTotalCompras: 0,
            pendientes: 0,
            cant_pendientes: 0,
            cant_mora: 0,
            cant_pagado: 0,
            montototal_pendientes: 0,
            montototal_mora: 0,
            montototal_pagado: 0,
            deudaTotal: null,
            amortizadoTotal: null,
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
                <SIcon name='Spinner' width={24} height={24} fill={COLORS.ACCENT} />
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

        return (
            <SView>
                {Object.entries(montoObj).map(([moneda, monto]) => (
                    <SText key={moneda} {...TYPOGRAPHY.VALUE} color={color}>
                        {moneda} {SMath.formatMoney(monto)}
                    </SText>
                ))}
            </SView>
        );
    }

    resumen() {
        const { data, loading } = this.state;
        if (loading || !data) return this.renderLoading();

        const { proveedor, pendientes, cant_pendientes, cant_mora, cant_pagado, montototal_pendientes, montototal_mora, montototal_pagado, deudaTotal, amortizadoTotal, monedaDefault, cantidadTotalCompras } = data;

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
                        padding: 12,
                        flexWrap: 'wrap',
                    }}
                >
                    <SView col={'xs-12 sm-6 md-3'} row center height={90} style={{ padding: 8 }}>
                        <SView center style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: STheme.color.lightGray }}>
                            <SIconApp name="iconEdifcio" width={24} height={24} fill="transparent" stroke={STheme.color.lightBlack} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText {...TYPOGRAPHY.LABEL}>Proveedor</SText>
                            <SText {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>{proveedor?.razon_social || 'Sin nombre'}</SText>
                        </SView>
                    </SView>

                    <SView col={'xs-12 sm-6 md-3'} row center height={90} style={{ padding: 8 }}>
                        <SView center style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: COLORS.VENCIDO_BACKGROUNG }}>
                            <SIconApp name="iconPesos" width={24} height={24} fill="transparent" stroke={COLORS.VENCIDO} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText {...TYPOGRAPHY.LABEL}>Deuda Total</SText>
                            <SView>
                                <SText {...TYPOGRAPHY.VALUE} color={COLORS.VENCIDO}>
                                    {monedaDefault} {SMath.formatMoney(parseFloat(montototal_pendientes) + parseFloat(montototal_mora))}
                                </SText>
                                <SText fontSize={10}>Mora: {monedaDefault} {SMath.formatMoney(montototal_mora)}</SText>
                                <SText fontSize={10}>Pendiente: {monedaDefault} {SMath.formatMoney(montototal_pendientes)}</SText>
                            </SView>
                        </SView>
                    </SView>

                    <SView col={'xs-12 sm-6 md-3'} row center height={90} style={{ padding: 8 }}>
                        <SView center style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: COLORS.PAGADO_BACKGROUNG }}>
                            <SIconApp name="pagotarjeta" width={24} height={24} fill={COLORS.PAGADO} stroke={COLORS.PAGADO} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText {...TYPOGRAPHY.LABEL}>Total Pagado</SText>
                            <SText {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>{monedaDefault} {SMath.formatMoney(montototal_pagado)}</SText>
                            <SText fontSize={10}>(Amortizado)</SText>
                        </SView>
                    </SView>

                    <SView col={'xs-12 sm-6 md-3'} row center height={90} style={{ padding: 8 }}>
                        <SView center style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: COLORS.PENDIENTE_BACKGROUNG }}>
                            <SIconApp name="iconLista" width={24} height={24} fill={COLORS.PENDIENTE} stroke={COLORS.PENDIENTE} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText {...TYPOGRAPHY.LABEL}>Cuotas</SText>
                            <SText {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>
                                Pendientes: {cant_pendientes} | Mora: {cant_mora} | Pagadas: {cant_pagado}
                            </SText>
                            <SText fontSize={10}>({pendientes} compras pendientes de {cantidadTotalCompras})</SText>
                        </SView>
                    </SView>
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
        const { data, loading } = this.state;
        if (loading || !data) return this.renderLoading();

        const { compras, monedaDefault } = data;
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
                    {compras.map((compra, index) => {
                        // Calculate total purchase amount from detalles
                        const totalCompra = compra.detalles?.reduce(
                            (sum, item) => sum + (item.precio_unitario || 0) * (item.cantidad || 0),
                            0
                        ) || 0;

                        // Calculate debt-related values from cuotasDetalle
                        const ___totaldeudaa = compra.cuotasDetalle?.reduce(
                            (sum, cuota) => sum + (cuota.estado !== 'Pagado' ? parseFloat(cuota.monto || 0) : 0),
                            0
                        ) || 0;

                        const ___totalMora = compra.cuotasDetalle?.reduce(
                            (sum, cuota) => sum + (cuota.estado === 'Vencido' ? parseFloat(cuota.monto || 0) : 0),
                            0
                        ) || 0;

                        const ___totalPendiente = compra.cuotasDetalle?.reduce(
                            (sum, cuota) => sum + (cuota.estado === 'Pendiente' ? parseFloat(cuota.monto || 0) : 0),
                            0
                        ) || 0;

                        const ___totalPagado = compra.cuotasDetalle?.reduce(
                            (sum, cuota) => sum + (cuota.estado === 'Pagado' ? parseFloat(cuota.monto_total || 0) : 0),
                            0
                        ) || 0;

                        const cuotasEnMoraCantidad = compra.cuotasDetalle?.filter(cuota => cuota.estado === 'Vencido').length || 0;

                        return (
                            <SView
                                key={compra.key || `compra-${index}`}
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
                                    <SText {...TYPOGRAPHY.TITLE} color={COLORS.TEXT}>Compra #{compra.key || (index + 1)}</SText>
                                    {this.labelEstado(___totaldeudaa > 0 ? 'pendiente' : 'pagado')}
                                </SView>
                                <SHr h={8} />
                                <SText {...TYPOGRAPHY.BODY} color={COLORS.TEXT} numberOfLines={1}>
                                    {compra.descripcion || 'Sin descripción'}
                                </SText>
                                <SHr h={12} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Fecha:</SText>
                                    <SText {...TYPOGRAPHY.BODY}>
                                        {new SDate(compra.fecha_on || new Date()).toString('dd/MM/yyyy')}
                                    </SText>
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
                                    <SText
                                        {...TYPOGRAPHY.BODY}
                                        color={cuotasEnMoraCantidad ? COLORS.VENCIDO : COLORS.TEXT}
                                    >
                                        {cuotasEnMoraCantidad} cuotas
                                    </SText>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Deuda:</SText>
                                    <SView>
                                        <SText
                                            {...TYPOGRAPHY.BODY}
                                            color={___totaldeudaa > 0 ? COLORS.VENCIDO : COLORS.TEXT}
                                        >
                                            {compra.moneda || monedaDefault} {SMath.formatMoney(___totaldeudaa)}
                                        </SText>
                                        {___totalMora > 0 && (
                                            <SText fontSize={10} color={COLORS.VENCIDO}>
                                                Mora: {compra.moneda || monedaDefault} {SMath.formatMoney(___totalMora)}
                                            </SText>
                                        )}
                                        {___totalPendiente > 0 && (
                                            <SText fontSize={10} color={COLORS.PENDIENTE}>
                                                Pendiente: {compra.moneda || monedaDefault} {SMath.formatMoney(___totalPendiente)}
                                            </SText>
                                        )}
                                    </SView>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Pagado:</SText>
                                    <SText
                                        {...TYPOGRAPHY.BODY}
                                        color={COLORS.PAGADO}
                                    >
                                        {compra.moneda || monedaDefault} {SMath.formatMoney(___totalPagado)}
                                    </SText>
                                </SView>
                                <SHr h={16} />
                                <SView col={'xs-12'} center>
                                    <SView
                                        col={'xs-12'}
                                        style={{
                                            paddingVertical: 12,
                                            borderTopWidth: 1,
                                            borderColor: STheme.color.lightGray + '66',
                                        }}
                                    >
                                        {___totaldeudaa > 0 ? (
                                            <SView
                                                col={'xs-12'}
                                                onPress={() => {
                                                    PopupPagoCuota.open({
                                                        editObject: {
                                                            ...compra,
                                                            id: compra.key || (index + 1),
                                                            moneda: compra.moneda || monedaDefault,
                                                            cuotasDetalle: compra.cuotasDetalle || [],
                                                            cuotas_en_mora: {
                                                                cantidad: cuotasEnMoraCantidad,
                                                                monto: ___totalMora,
                                                            },
                                                            totalMora: ___totalMora,
                                                            totalPendiente: ___totalPendiente,
                                                            totalPagado: ___totalPagado,
                                                        },
                                                        onSuccess: () => {
                                                            this.setState({ loading: true });
                                                            this.loadData().then(data => {
                                                                this.setState({ data, loading: false });
                                                            });
                                                        },
                                                    });
                                                }}
                                                backgroundColor={COLORS.ACCENT}
                                                style={{
                                                    padding: 12,
                                                    borderRadius: 6,
                                                    borderWidth: 1,
                                                    borderColor: COLORS.ACCENT + '33',
                                                }}
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
                                                            totalMora: ___totalMora,
                                                            totalPendiente: ___totalPendiente,
                                                            totalPagado: ___totalPagado,
                                                        },
                                                        onSuccess: () => {
                                                            this.setState({ loading: true });
                                                            this.loadData().then(data => {
                                                                this.setState({ data, loading: false });
                                                            });
                                                        },
                                                    });
                                                }}
                                                backgroundColor={COLORS.ACCENT}
                                                style={{
                                                    padding: 12,
                                                    borderRadius: 6,
                                                    borderWidth: 1,
                                                    borderColor: COLORS.ACCENT + '33',
                                                }}
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
        return (
            <SPage title={'Compras de Distribuidora Central S.A.'} disableScroll>
                <SScrollView2 disableHorizontal>
                    <SView col={'xs-12'} center style={{ padding: 8 }}>
                        {this.header()}
                        {this.resumen()}
                        {this.itemCard()}
                        <SHr h={16} />
                    </SView>
                </SScrollView2>
            </SPage>
        );
    }
}