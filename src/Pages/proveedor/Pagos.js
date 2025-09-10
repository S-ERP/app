import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme, SDate, SMath, SIcon } from 'servisofts-component';
import PopupPagoCuota from './Components/PopupPagoCuota';
import MDL from '../../MDL';
import SIconApp from '../../Assets/SIconApp';

// Paleta de colores mínima
const COLOR_CARD = STheme.color.card;
const COLOR_TEXT = STheme.color.text;
const COLOR_ACCENT = STheme.color.lightGray + "66";
const COLOR_BORDER = STheme.color.lightGray + "30";
const COLOR_PENDIENTE = '#EAB308';
const COLOR_PAGADO = '#22C55E';
const COLOR_VENCIDO = '#ee343b';
// const COLOR_CARD = STheme.color.lightGray + '44';
// const COLOR_TEXT = STheme.color.text;
// const COLOR_ACCENT = STheme.color.card;
// const COLOR_BORDER = STheme.color.white;
// const COLOR_PENDIENTE = '#EAB308';
// const COLOR_PAGADO = '#22C55E';
// const COLOR_VENCIDO = '#F97316';

// Configuración de estados
const dataConfig = {
    configuracion: {
        estados: {
            pendiente: { label: 'Pendiente', color: COLOR_PENDIENTE, bgColor: '#fef8c3', textColor: '#b58940', icon: 'history' },
            pagado: { label: 'Pagado', color: COLOR_PAGADO, bgColor: '#dafce6', textColor: '#42b88f', icon: 'Check' },
            vencido: { label: 'Vencido', color: COLOR_VENCIDO, bgColor: '#ee343b', textColor: '#eeccda', icon: 'AlertOutline' },
        },
        metodosPago: ['Efectivo', 'Transferencia', 'Tarjeta de crédito', 'Cheque'],
    },
};

export default class Pagos extends Component {
    loadData() {
        const key_proveedor = '15843bf1-0ee2-467d-8052-aa394d2cf477';
        return MDL.compra_venta.getTransaccionCuotas(key_proveedor)
            .then((registros) => {
                if (!registros || !Array.isArray(registros)) {
                    return {
                        cantidadTotalCompras: 0,
                        pendientes: 0,
                        deudaTotal: null,
                        amortizadoTotal: null,
                        proveedor: {},
                        compras: [],
                    };
                }

                const cantidadTotalCompras = registros.length;
                let pendientes = 0;
                let deudaTotal = {};
                let amortizadoTotal = {};

                for (let compra of registros) {
                    if (compra.cuotas && compra.cuotas.cantidad > 0) {
                        pendientes++;
                    }
                    if (compra.cuotas_en_mora && compra.cuotas_en_mora.monto !== null) {
                        const moneda = compra.moneda || 'BOB';
                        deudaTotal[moneda] = (deudaTotal[moneda] || 0) + compra.cuotas_en_mora.monto;
                    }
                    if (compra.monto_amortizado && compra.monto_amortizado !== null) {
                        const moneda = compra.moneda || 'BOB';
                        amortizadoTotal[moneda] = (amortizadoTotal[moneda] || 0) + compra.monto_amortizado;
                    }
                }

                if (Object.keys(deudaTotal).length === 0) deudaTotal = null;
                if (Object.keys(amortizadoTotal).length === 0) amortizadoTotal = null;

                return MDL.inventario.proveedor.getAllProveedor().then((proveedores) => {
                    return {
                        cantidadTotalCompras,
                        pendientes,
                        deudaTotal,
                        amortizadoTotal,
                        proveedor: proveedores.find((prov) => prov.key === key_proveedor) || {},
                        compras: Object.values(registros),
                    };
                });
            })
            .catch((error) => {
                console.error('Error in loadData:', error);
                return {
                    cantidadTotalCompras: 0,
                    pendientes: 0,
                    deudaTotal: null,
                    amortizadoTotal: null,
                    proveedor: {},
                    compras: [],
                };
            });
    }

    componentDidMount() {
        this.loadData()
            .then((data) => {
                this.data = data;
                this.forceUpdate();
            })
            .catch((error) => {
                console.error('Error loading data:', error);
                this.data = {
                    cantidadTotalCompras: 0,
                    pendientes: 0,
                    deudaTotal: null,
                    amortizadoTotal: null,
                    proveedor: {},
                    compras: [],
                };
                this.forceUpdate();
            });
    }

    renderLoading() {
        return (
            <SView col={'xs-12'} center style={{ padding: 8 }}>
                <SIcon name='Spinner' width={24} height={24} fill={COLOR_ACCENT} />
                <SHr h={8} />
                <SText fontSize={12} color={COLOR_TEXT}>
                    Cargando datos...
                </SText>
            </SView>
        );
    }

    labelEstado(estado) {
        const estadoNormalizado = estado?.toLowerCase() || 'pendiente';
        const { color, bgColor, textColor, label, icon } = dataConfig.configuracion.estados[estadoNormalizado];
        return (
            <SView row center accessibilityLabel={`Estado: ${label}`}>
                <SView
                    width={90}
                    center
                    // row
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

                        <SText fontSize={12} bold color={textColor} paddingHorizontal={8} paddingVertical={4} center ><SIconApp name={icon} width={14} height={14} fill={textColor} style={{ marginRight: 4 }} />{label}</SText>
                    </SView>
                </SView>
            </SView>
        );
    }

    renderMonto(montoObj, monedaDefault, color) {
        if (!montoObj) {
            return (
                <SText fontSize={14} bold color={color}>
                    {monedaDefault} 0.00
                </SText>
            );
        }
        const entries = [];
        for (let moneda in montoObj) {
            entries.push(
                <SView key={moneda} row style={{ marginTop: 4 }}>
                    <SText fontSize={14} bold color={color}>
                        {moneda} {SMath.formatMoney(montoObj[moneda])}
                    </SText>
                </SView>
            );
        }
        return entries;
    }

    resumen() {
        const data = this.data;
        if (!data) return this.renderLoading();

        console.log("suavesita " + JSON.stringify(data))
        const { proveedor, pendientes, deudaTotal, amortizadoTotal, monedaDefault = 'BOB' } = data;

        return (
            <SView col={'xs-12'} style={{ paddingHorizontal: 8 }}>
                <SView
                    col={'xs-12'}
                    row
                    backgroundColor={COLOR_CARD}
                    style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLOR_BORDER,
                        padding: 8,
                    }}
                >
                    {/* Proveedor */}
                    <SView col={'xs-12 sm-6 md-3'} row center height={60}>
                        <SView
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                backgroundColor: dataConfig.configuracion.estados.pagado.bgColor,
                                borderWidth: 1,
                                borderColor: COLOR_PAGADO,
                            }}
                            center
                        >
                            <SIcon name='empresa' width={20} height={20} fill={COLOR_PAGADO} />
                        </SView>
                        <SView flex style={{ marginLeft: 8 }}>
                            <SText fontSize={12} color={COLOR_TEXT}>Proveedor</SText>
                            <SText fontSize={14} bold color={COLOR_TEXT}>
                                {proveedor?.razon_social || 'Sin nombre'}
                            </SText>
                        </SView>
                    </SView>

                    {/* Deuda Total */}
                    <SView col={'xs-12 sm-6 md-3'} row center height={60}>
                        <SView
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                backgroundColor: dataConfig.configuracion.estados.pendiente.bgColor,
                                borderWidth: 1,
                                borderColor: COLOR_PENDIENTE,
                            }}
                            center
                        >
                            <SIcon name='tpAf' width={20} height={20} fill={COLOR_PENDIENTE} />
                        </SView>
                        <SView flex style={{ marginLeft: 8 }}>
                            <SText fontSize={12} color={COLOR_TEXT}>Deuda Total(cuotas_en_mora)</SText>
                            {this.renderMonto(deudaTotal, monedaDefault, COLOR_PENDIENTE)}
                        </SView>
                    </SView>

                    {/* Total Pagado */}
                    <SView col={'xs-12 sm-6 md-3'} row center height={60}>
                        <SView
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                backgroundColor: dataConfig.configuracion.estados.pagado.bgColor,
                                borderWidth: 1,
                                borderColor: COLOR_PAGADO,
                            }}
                            center
                        >
                            <SIcon name='pagotarjeta' width={20} height={20} fill={COLOR_PAGADO} />
                        </SView>
                        <SView flex style={{ marginLeft: 8 }}>
                            <SText fontSize={12} color={COLOR_TEXT}>Total Pagado(amortizado)</SText>
                            {this.renderMonto(amortizadoTotal, monedaDefault, COLOR_PAGADO)}
                        </SView>
                    </SView>

                    {/* Compras Pendientes */}
                    <SView col={'xs-12 sm-6 md-3'} row center height={60}>
                        <SView
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                backgroundColor: dataConfig.configuracion.estados.vencido.bgColor,
                                borderWidth: 1,
                                borderColor: COLOR_VENCIDO,
                            }}
                            center
                        >
                            <SIcon name='Evento' width={20} height={20} fill={COLOR_VENCIDO} />
                        </SView>
                        <SView flex style={{ marginLeft: 8 }}>
                            <SText fontSize={12} color={COLOR_TEXT}>Compras Pendientes</SText>
                            <SText fontSize={14} bold color={COLOR_TEXT}>
                                {pendientes}
                            </SText>
                        </SView>
                    </SView>
                </SView>
                <SHr h={12} />
            </SView>
        );
    }

    header() {
        return (
            <SView col={'xs-12'} style={{ paddingHorizontal: 8 }}>
                <SHr h={12} />
                <SText fontSize={14} bold color={COLOR_TEXT}>
                    Compras a Crédito y Pagos Pendientes
                </SText>
                <SHr h={12} />
            </SView>
        );
    }

    itemCard() {
        const data = this.data;
        if (!data) return this.renderLoading();

        const { compras, monedaDefault = 'BOB' } = data;
        if (!compras || !compras.length) {
            return (
                <SView col={'xs-12'} center style={{ padding: 8 }}>
                    <SText fontSize={12} color={COLOR_TEXT}>
                        No hay compras registradas.
                    </SText>
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
                                backgroundColor: COLOR_CARD,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: COLOR_BORDER,
                                padding: 8,
                            }}
                        >
                            <SView col={'xs-12'} row>
                                <SView flex height={36}>
                                    <SText fontSize={14} bold color={COLOR_TEXT} numberOfLines={1}>
                                        Compra #{index + 1}
                                    </SText>
                                    <SText fontSize={12} color={COLOR_TEXT} numberOfLines={1}>
                                        {compra.descripcion || 'Sin udescripción'}
                                    </SText>
                                </SView>
                                {this.labelEstado(compra.cuotas_en_mora?.monto ? 'pendiente' : 'pagado')}
                            </SView>

                            <SHr h={8} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Fecha:</SText>
                                <SText fontSize={12} color={COLOR_TEXT}>
                                    {new SDate(compra.fecha_on || new Date()).toString('yyyy-MM-dd')}
                                </SText>
                            </SView>
                            <SHr h={4} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Tipo pago:</SText>
                                <SText fontSize={12} color={COLOR_TEXT}>
                                    {compra.tipo_pago || 'No especificado'}
                                </SText>
                            </SView>
                            <SHr h={4} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Total compra:</SText>

                                {compra.detalles.map((item, index) => (

                                    <SText fontSize={16} bold color={COLOR_TEXT}>
                                        {compra.moneda || monedaDefault} {SMath.formatMoney(item.precio_unitario * item.cantidad ?? 0)}
                                    </SText>))}

                                {/* <SText fontSize={14} bold color={COLOR_TEXT}>
                                    {compra.moneda || monedaDefault} {SMath.formatMoney(compra.total || 0)}
                                </SText> */}
                            </SView>
                            <SHr h={4} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas pendientes/mora:</SText>
                                <SText
                                    fontSize={12}
                                    color={compra.cuotas_en_mora?.cantidad ? COLOR_VENCIDO : COLOR_TEXT}
                                >
                                    {`${compra.cuotas_en_mora?.cantidad || 0} cuotas`}
                                </SText>
                            </SView>

                            <SHr h={4} />
                            <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas total:</SText>
                                <SText fontSize={12} color={COLOR_TEXT} > {`${compra.cuotas?.cantidad || 0} cuotas`} </SText>
                            </SView>
                            <SHr h={8} />
                            <SView col={'xs-12'} center>
                                <SView
                                    col={'xs-12'}
                                    center
                                    style={{
                                        backgroundColor: compra.cuotas_en_mora?.cantidad ? dataConfig.configuracion.estados.vencido.bgColor : COLOR_ACCENT,
                                        borderRadius: 6,
                                        padding: 8,
                                        borderWidth: 1,
                                        borderColor: compra.cuotas_en_mora?.cantidad ? COLOR_VENCIDO : COLOR_ACCENT,
                                    }}
                                    onPress={() => {
                                        PopupPagoCuota.open({
                                            editObject: { ...compra, id: (index + 1), moneda: compra.moneda || monedaDefault },
                                            onSuccess: () => {
                                                console.log('Payment successful');
                                                this.loadData().then((data) => {
                                                    this.data = data;
                                                    this.forceUpdate();
                                                });
                                            },
                                        });
                                    }}
                                >
                                    <SView row center>
                                        {!compra.cuotas_en_mora?.cantidad ? <SIcon name={'Eyes'} width={12} height={12} fill={COLOR_TEXT} style={{ marginRight: 4 }} /> : null}
                                        <SText fontSize={12} bold color={COLOR_TEXT} >{compra.cuotas_en_mora?.cantidad ? 'Pagar Cuotas Pendientes' : 'Ver Historial de Pagos'}</SText>
                                    </SView>
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
                    <SView col={'xs-12'} style={{ minHeight: '100%' }}>
                        {this.header()}
                        {this.resumen()}
                        {this.itemCard()}
                        <SHr h={12} />
                    </SView>
                </SScrollView2>
            </SPage>
        );
    }
}