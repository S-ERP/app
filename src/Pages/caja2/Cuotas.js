import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme, SDate, SMath, SIcon, SNavigation } from 'servisofts-component';
import PopupPagoCuota from './components/PopupPagoCuota';
import MDL from '../../MDL';
import SIconApp from '../../Assets/SIconApp';

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
    ACCENT: '#2c7bfaff',
    ACCENT_BACKGROUNG: '#a7c9ffff',
};

const TYPOGRAPHY = {
    TITLE: { fontSize: 18, bold: true },
    SUBTITLE: { fontSize: 14, bold: true },
    BODY: { fontSize: 12 },
    LABEL: { fontSize: 12, color: COLORS.TEXT },
    VALUE: { fontSize: 14, bold: true },
};

const DATA_CONFIG = {
    estados: {
        pendiente: { label: 'Pendiente', color: COLORS.PENDIENTE, bgColor: COLORS.PENDIENTE_BACKGROUNG, textColor: COLORS.PENDIENTE, icon: 'history' },
        pagado: { label: 'Pagado', color: COLORS.PAGADO, bgColor: COLORS.PAGADO_BACKGROUNG, textColor: COLORS.PAGADO, icon: 'bien' },
        vencido: { label: 'Vencido', color: COLORS.VENCIDO, bgColor: COLORS.VENCIDO_BACKGROUNG, textColor: COLORS.VENCIDO, icon: 'AlertOutline' },
    },
    metodosPago: ['Efectivo', 'Transferencia', 'Tarjeta de crédito', 'Cheque'],
};

const InfoRow = ({ label, value, icon, iconColorFill, iconColorStroke, bgColor, subText, subTextColor }) => (
    <SView col={'xs-12 sm-6 md-3'} row center height={90} style={{ padding: 8 }}>
        <SView center style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: bgColor || STheme.color.lightGray }}>
            <SIconApp name={icon} width={24} height={24} fill={iconColorFill || 'transparent'} stroke={iconColorStroke || STheme.color.lightBlack} />
        </SView>
        <SView style={{ marginLeft: 12 }}>
            <SView flex>
                <SText numberOfLines={1} {...TYPOGRAPHY.LABEL}>{label}</SText>
                {typeof value === 'string' ? (
                    <SText numberOfLines={1} {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>{value}</SText>
                ) : (
                    value
                )}
            </SView>
            <SView col={'xs-0 lg-12'} style={{ paddingHorizontal: 5, paddingVertical: 3, borderRadius: 5, backgroundColor: subTextColor + "88" || "transparent" }}>
                {subText && <SText numberOfLines={1} fontSize={10} color={COLORS.TEXT}>{subText}</SText>}
            </SView>
        </SView>
    </SView>
);

export default class Cuotas extends Component {
    state = {
        data: null,
        loading: true,
        error: null,
        showPaid: false,
    };

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

        if (!Array.isArray(cuotas)) {
            console.warn('Cuotas no es un array válido');
            return summary;
        }

        cuotas.forEach(cuota => {
            if (!cuota || !cuota.vencimiento) return;
            const saldoPendiente = parseFloat(cuota.monto || 0);
            if (cuota.estado === "Pagado") {
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

    async loadData() {
    try {
        // Obtener parámetros de entrada
        const key_proveedor = SNavigation.getParam('key_proveedor') || '';
        const key_cliente = SNavigation.getParam('key_cliente') || '';

        if (!key_proveedor && !key_cliente) {
            console.warn('No se proporcionaron key_proveedor ni key_cliente');
            return this.getDefaultData();
        }

        // Obtener registros según el tipo
        const registros = key_proveedor
            ? await MDL.compra_venta.getTransaccionCuotasCompras(key_proveedor)
            : await MDL.compra_venta.getTransaccionCuotasVentas(key_cliente);

        if (!Array.isArray(registros) || registros.length === 0) {
            console.warn('No hay registros válidos');
            return this.getDefaultData();
        }

        // Calcular resumen global usando reduce
        const globalSummary = registros.reduce((acc, item) => {
            const moneda = item.moneda || 'BOB';

            acc.cant_pendientes += item.cuotas_en_pendientes?.cantidad || 0;
            acc.cant_mora += item.cuotas_en_mora?.cantidad || 0;
            acc.cant_pagado += item.cuotas_en_amortizacion?.cantidad || 0;

            const montoPend = parseFloat(item.cuotas_en_pendientes?.monto || 0);
            const montoMora = parseFloat(item.cuotas_en_mora?.monto || 0);
            const montoPag = parseFloat(item.cuotas_en_amortizacion?.monto || 0);

            acc.total_pendientes += montoPend;
            acc.total_mora += montoMora;
            acc.total_pagado += montoPag;

            acc.deudaTotal[moneda] = (acc.deudaTotal[moneda] || 0) + montoPend + montoMora + montoPag;

            return acc;
        }, {
            cant_pendientes: 0,
            cant_mora: 0,
            cant_pagado: 0,
            total_pendientes: 0,
            total_mora: 0,
            total_pagado: 0,
            deudaTotal: {},
        });

        // Obtener proveedor y cliente
        const [proveedorData, clienteData] = await Promise.all([
            key_proveedor ? MDL.inventario.proveedor.getByKey(key_proveedor).catch(() => ({})) : Promise.resolve({}),
            key_cliente ? MDL.crm.cliente.getByKey(key_cliente).catch(() => ({})) : Promise.resolve({})
        ]);

        const cliente = Object.values(clienteData)[0] || {};

        // Retornar resultado final
        return {
            cant_pendientes: globalSummary.cant_pendientes,
            cant_mora: globalSummary.cant_mora,
            cant_pagado: globalSummary.cant_pagado,
            montototal_pendientes: globalSummary.total_pendientes.toFixed(2),
            montototal_mora: globalSummary.total_mora.toFixed(2),
            montototal_pagado: globalSummary.total_pagado.toFixed(2),
            deudaTotal: Object.keys(globalSummary.deudaTotal).length ? globalSummary.deudaTotal : null,
            proveedor: proveedorData,
            cliente,
            compras: registros,
        };
    } catch (error) {
        console.error('Error crítico en loadData:', error);
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
            cliente: {},
            compras: [],
            monedaDefault: 'BOB',
        };
    }

    componentDidMount() {
        this.loadData().then(data => {
            this.setState({ data, loading: false });
        }).catch(error => {
            console.error('Error en componentDidMount:', error);
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
        const { data, loading, showPaid } = this.state;
        if (loading || !data) return this.renderLoading();

        console.log("todo " + JSON.stringify(data))
        const { cliente, proveedor, montototal_pendientes, montototal_mora, monedaDefault, compras } = data;

        const filteredCompras = showPaid ? compras : compras.filter(compra => compra.summary?.deudaTotal > 0 && compra.cuotasDetalle?.length > 0);

        const totalPagado = showPaid ? parseFloat(data.montototal_pagado) : filteredCompras.reduce((sum, compra) => sum + parseFloat(compra.summary.montototal_pagado || 0), 0).toFixed(2);

        const cantidadCompras = filteredCompras.length;

        const cuotas = showPaid
            ? {
                cant_pendientes: data.cant_pendientes,
                cant_mora: data.cant_mora,
                cant_pagado: data.cant_pagado,
            }
            : filteredCompras.reduce(
                (acc, compra) => ({
                    cant_pendientes: acc.cant_pendientes + (compra.summary?.cant_pendientes || 0),
                    cant_mora: acc.cant_mora + (compra.summary?.cant_mora || 0),
                    cant_pagado: acc.cant_pagado + (compra.summary?.cant_pagado || 0),
                }),
                { cant_pendientes: 0, cant_mora: 0, cant_pagado: 0 }
            );

        const totalDeuda = (parseFloat(montototal_pendientes) + parseFloat(montototal_mora)).toFixed(2);

        if (totalDeuda < 1 && !showPaid) {
            this.setState({ showPaid: true });
        }

        return (
            <SView col={'xs-12'} style={{ padding: 16 }}>
                <SView col={'xs-12'} row backgroundColor={COLORS.CARD} style={{ borderRadius: 8, borderWidth: 1, borderColor: COLORS.BORDER, padding: 12, flexWrap: 'wrap' }}>
                    <InfoRow
                        label={this.key_proveedor ? "Proveedor" : "Cliente"}
                        value={this.key_proveedor ? proveedor?.razon_social || 'Sin nombre' : cliente?.nombres || 'Sin nombre'}
                        icon="iconEdifcio"
                        subText={this.key_proveedor ? `(Nit: ${proveedor?.nit ?? 0})` : `(RS: ${cliente?.razon_social ?? "S/R"} | Nit: ${cliente?.nit ?? 0})`}
                        iconColorStroke={STheme.color.lightBlack}
                    />
                    <InfoRow
                        label="Deuda Total"
                        value={
                            <SView>
                                {this.renderMonto(totalDeuda, monedaDefault, totalDeuda > 0 ? COLORS.VENCIDO : COLORS.TEXT)}
                            </SView>
                        }
                        icon="iconPesos"
                        iconColorStroke={totalDeuda > 0 ? COLORS.VENCIDO : COLORS.ACCENT}
                        bgColor={totalDeuda > 0 ? COLORS.VENCIDO_BACKGROUNG : COLORS.ACCENT_BACKGROUNG}
                        subText={totalDeuda > 0 ? `(Mora ${montototal_mora} + Pend. ${montototal_pendientes})` : null}
                        subTextColor={totalDeuda > 0 ? COLORS.VENCIDO : COLORS.CARD}
                    />
                    <InfoRow
                        label="Total Pagado"
                        value={this.renderMonto(totalPagado, monedaDefault, COLORS.TEXT)}
                        icon="pagotarjeta"
                        iconColorFill={COLORS.PAGADO}
                        iconColorStroke={COLORS.PAGADO}
                        bgColor={COLORS.PAGADO_BACKGROUNG}
                        subText="(Amortizado)"
                    />
                    <InfoRow
                        label={this.key_proveedor ? "Total Compras" : "Total Ventas"}
                        value={
                            <SView>
                                <SText {...TYPOGRAPHY.BODY} color={COLORS.TEXT}>
                                    {this.key_proveedor ? `${cantidadCompras} ${cantidadCompras === 1 ? 'compra' : 'compras'}` : `${cantidadCompras} ${cantidadCompras === 1 ? 'venta' : 'ventas'}`}
                                </SText>
                            </SView>
                        }
                        icon="iconLista"
                        iconColorFill={COLORS.PENDIENTE}
                        iconColorStroke={COLORS.PENDIENTE}
                        bgColor={COLORS.PENDIENTE_BACKGROUNG}
                        subText={`(${cuotas.cant_mora + cuotas.cant_pendientes} ${cuotas.cant_mora + cuotas.cant_pendientes === 1 ? 'cuota' : 'cuotas'})`}
                    />
                </SView>
                {this.botonMostrarPagadas()}
            </SView>
        );
    }

    header() {
        return (
            <SView col={'xs-12'} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                <SText {...TYPOGRAPHY.TITLE} color={COLORS.TEXT}>
                    {this.key_proveedor ? 'Compras a crédito y pagos pendientes' : 'Ventas a crédito y pagos pendientes'}
                </SText>
            </SView>
        );
    }

    itemCard() {
        const { data, loading, showPaid } = this.state;
        if (loading || !data) return this.renderLoading();
        const { compras, monedaDefault } = data;
        if (!Array.isArray(compras) || !compras.length) {
            return (
                <SView col={'xs-12'} center style={{ padding: 16 }}>
                    <SText {...TYPOGRAPHY.TITLE} color={STheme.color.lightGray}>
                        No se encontraron {this.key_proveedor ? 'compras' : 'ventas'} para el cliente o proveedor seleccionado.
                    </SText>
                </SView>
            );
        }

        const filteredCompras = showPaid
            ? compras
            : compras.filter(compra => compra.summary?.deudaTotal > 0 && compra.cuotasDetalle?.length > 0);

        if (!filteredCompras.length) {
            return (
                <SView col={'xs-12'} center style={{ padding: 16 }}>
                    <SText {...TYPOGRAPHY.BODY}>
                        {showPaid ? `No hay ${this.key_proveedor ? 'compras' : 'ventas'} registradas.` : `No hay ${this.key_proveedor ? 'compras' : 'ventas'} con deudas o cuotas pendientes.`}
                    </SText>
                </SView>
            );
        }

        return (
            <SView col={'xs-12'} style={{ padding: 8 }}>
                <SView col={'xs-12'} row style={{ flexWrap: 'wrap' }}>
                    {filteredCompras.map((compra, index) => {
                        const totalCompra = compra.detalles?.reduce((sum, item) => sum + (parseFloat(item.precio_unitario || 0) * parseFloat(item.cantidad || 0)), 0) || 0;
                        const { cant_mora, montototal_mora, montototal_pendiente, montototal_pagado, deudaTotal, cant_pendientes, cant_pagado } = compra.summary || {};

                        return (
                            <SView
                                key={compra.key || `compra-${index}`}
                                col={'xs-12 md-4 lg-3'}
                                margin={4}
                                style={{ backgroundColor: COLORS.CARD, borderRadius: 6, borderWidth: 1, borderColor: COLORS.BORDER, padding: 16 }}
                            >
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.TITLE} color={COLORS.TEXT}>{this.key_proveedor ? `Compra #${index + 1}` : `Venta #${index + 1}`}</SText>
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
                                    <SText {...TYPOGRAPHY.LABEL}>{this.key_proveedor ? "Total compra" : "Total venta"}:</SText>
                                    <SText {...TYPOGRAPHY.VALUE} color={COLORS.TEXT}>
                                        {compra.moneda || monedaDefault} {SMath.formatMoney(totalCompra)}
                                    </SText>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Cuotas pendientes:</SText>
                                    <SView>
                                        <SText {...TYPOGRAPHY.BODY} color={COLORS.TEXT}>
                                            {(cant_pendientes + cant_mora) || 0} {((cant_pendientes + cant_mora) || 0) === 1 ? 'cuota' : 'cuotas'}
                                        </SText>
                                    </SView>
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                    <SText {...TYPOGRAPHY.LABEL}>Deuda total:</SText>
                                    <SView>
                                        <SText {...TYPOGRAPHY.BODY} color={deudaTotal > 0 ? COLORS.VENCIDO : COLORS.TEXT}>
                                            {compra.moneda || monedaDefault} {SMath.formatMoney(deudaTotal)}
                                        </SText>
                                    </SView>
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
                                                            id: index + 1,
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
                                                backgroundColor={COLORS.VENCIDO}
                                                style={{ padding: 12, borderRadius: 6, borderWidth: 1, borderColor: COLORS.CARD }}
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
                                                            id: index + 1,
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
                                                backgroundColor={COLORS.CARD}
                                                style={{ padding: 12, borderRadius: 6, borderWidth: 1, borderColor: COLORS.CARD }}
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

    botonMostrarPagadas() {
        const { showPaid } = this.state;
        return (
            <SView style={{ position: "absolute", left: 16, top: -14 }}>
                <SView center row width={120} backgroundColor={STheme.color.card} style={{ borderRadius: 4, paddingVertical: 4 }}
                    onPress={() => this.setState({ showPaid: !showPaid })}>
                    <SIconApp name='Eyes' fill={COLORS.TEXT} height={10} width={10} />
                    <SView width={4} />
                    <SText {...TYPOGRAPHY.LABEL} color={COLORS.TEXT}>
                        {showPaid ? 'Ocultar Pagadas' : 'Mostrar Pagadas'}
                    </SText>
                </SView>
            </SView>
        );
    }

    render() {
        return (
            <SPage title={this.key_proveedor ? 'Compras a crédito y pagos pendientes' : 'Ventas a crédito y pagos pendientes'} disableScroll>
                <SScrollView2 disableHorizontal>
                    <SView col={'xs-12'} center style={{ padding: 8 }}>
                        <SHr h={16} />
                        {this.resumen()}
                        {this.itemCard()}
                        <SHr h={16} />
                    </SView>
                </SScrollView2>
            </SPage>
        );
    }
}