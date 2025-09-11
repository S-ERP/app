import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SPopup, SText, STheme, SView, SIcon, SHr, SDate } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import MDL from '../../../MDL';

// Configuración
const data = {
    configuracion: {
        estados: {
            Pendiente: { label: "Pendiente", color: "#EAB308", bgColor: "#fef8c3", textColor: "#b58940", icon: "history" },
            Pagado: { label: "Pagado", color: "#22C55E", bgColor: "#dafce6", textColor: "#42b88f", icon: "Check" },
            Vencido: { label: "Vencido", color: "#F97316", bgColor: "#ee343b", textColor: "#eeccda", icon: "AlertOutline" }
        }
    }
};

// Colores
const COLOR_CARD = STheme.color.lightGray + '44';
const COLOR_TEXT = STheme.color.text;
const COLOR_BORDER = STheme.color.white;

// Static JSON Data (fallback)
const compraFallback = {
    id: 101,
    descripcion: 'Productos de limpieza y mantenimiento',
    estado: 'Pendiente',
    fecha: '2024-12-01',
    total: 1416.66,
    cuotasDetalle: [
        { numero: 1, estado: 'Pagado', vencimiento: '2025-01-14', fechaPago: '2025-01-13', monto: 708.33 },
        { numero: 2, estado: 'Pendiente', vencimiento: '2025-02-14', fechaPago: null, monto: 708.33 },
    ],
    moneda: 'BOB',
};

export default class PopupPagoCuota2 extends Component {
    static open(props) {
        SPopup.open({
            key: 'PopupPagoCuota2',
            content: (
                <SView
                    style={{
                        width: "100%",
                        maxWidth: 600,
                        maxHeight: "90%",
                        padding: 8,
                        overflow: 'hidden',
                        backgroundColor: STheme.color.background,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: COLOR_BORDER,
                    }}
                    withoutFeedback
                    closeOnTouchOutside
                    accessibilityLabel="Popup de gestión de cuotas"
                >
                    <PopupPagoCuota2
                        {...props}
                        onCancel={() => {
                            SPopup.close('PopupPagoCuota2');
                            if (props.onCancel) props.onCancel();
                        }}
                    />
                </SView>
            ),
        });
    }

    constructor(props) {
        super(props);
        this.cuotasCompras = []; // Initialize as empty array
    }

    loadData = async () => {
        const key_compra_venta = this.props.editObject?.key || '1f30bf00-33ba-4466-813b-2870eec111dd';
        try {
            const registros = await MDL.compra_venta.getCuotasCompras(key_compra_venta);
            // Limit to two cuotas to prevent crashes
            return registros.slice(0, 2);
        } catch (error) {
            console.error('Error in loadData:', error);
            return compraFallback.cuotasDetalle; // Fallback to static cuotas
        }
    };

    componentDidMount() {
        this.loadData()
            .then((resp) => {
                this.cuotasCompras = resp;
                this.forceUpdate();
            })
            .catch((error) => {
                console.error('Error loading data:', error);
                this.cuotasCompras = compraFallback.cuotasDetalle;
                this.forceUpdate();
            });
    }

    isCuotaVencida = (vencimiento) => {
        const today = new SDate('2025-09-08', 'yyyy-MM-dd');
        const vencimientoDate = new SDate(vencimiento, 'yyyy-MM-dd');
        return vencimientoDate.isBefore(today);
    };

    Item = ({ cuota }) => {
        const monedaSymbol = this.props.editObject?.moneda || compraFallback.moneda;
        const isPaid = cuota.estado === 'Pagado';
        const isVencida = !isPaid && this.isCuotaVencida(cuota.vencimiento);
        const estadoConfig = data.configuracion.estados[isVencida ? 'Vencido' : cuota.estado] || data.configuracion.estados.Pendiente;

        return (
            <SView
                key={`cuota-${cuota.numero}`}
                col={'xs-12'}
                style={{
                    backgroundColor: STheme.color.lightGray + '55',
                    borderColor: STheme.color.success + '55',
                    borderRadius: 8,
                    padding: 16,
                    borderWidth: 1,
                    marginBottom: 12,
                }}
                accessibilityLabel={`Cuota ${cuota.numero} - ${cuota.estado}`}
            >
                <SView row style={{ justifyContent: "space-between" }}>
                    <SView flex row>
                        <SText fontSize={16} bold color={COLOR_TEXT}>Cuota #{cuota.numero}</SText>
                    </SView>
                    <SView>
                        {this.labelEstado(cuota.estado, isVencida)}
                    </SView>
                </SView>
                <SHr h={12} />
                <SView row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={14} color={COLOR_TEXT}>
                        Vencimiento: <SText bold>{new SDate(cuota.vencimiento, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText>
                    </SText>
                    <SText fontSize={16} bold color={COLOR_TEXT}>
                        {monedaSymbol} {parseFloat(cuota.monto).toFixed(2)}
                    </SText>
                </SView>
                <SHr h={8} />
                {isPaid ? (
                    <SView row>
                        <SText fontSize={14} color={COLOR_TEXT}>
                            Pagado: <SText bold color={data.configuracion.estados.Pagado.color}>{new SDate(cuota.fechaPago, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText>
                        </SText>
                    </SView>
                ) : (
                    <SView row>
                        <SText fontSize={14} color={COLOR_TEXT}>
                            Estado: <SText bold color={estadoConfig.color}>
                                {isVencida ? 'En mora' : 'Pendiente de pago'}
                            </SText>
                        </SText>
                    </SView>
                )}
            </SView>
        );
    };

    labelEstado = (estado, isVencida = false) => {
        const estadoNormalizado = isVencida ? 'Vencido' : estado;
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estadoNormalizado] || data.configuracion.estados.Pendiente;
        return (
            <SView width={80} row center accessibilityLabel={`Estado: ${label}`}>
                <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: color }}>
                    <SIconApp name={icon} width={14} height={14} fill={textColor} /><SView width={4} /><SText fontSize={12} bold color={textColor}>{label}</SText>
                </SView>
            </SView>
        );
    };

    labelEstado2 = (estado, isVencida = false) => {
        const estadoNormalizado = isVencida ? 'Vencido' : estado;
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estadoNormalizado] || data.configuracion.estados.Pendiente;
        return (
            <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, padding: 4, borderWidth: 1, borderColor: color }}>
                <SIconApp name={icon} width={12} height={12} fill={textColor} /><SText fontSize={12} bold color={textColor}> {label}</SText>
            </SView>
        );
    };

    calculateCompraDetails = () => {
        const ____compra = this.props.editObject || compraFallback;
        console.log(`todo popu: id=${____compra.id}, totalCompra=${____totalCompra}, estadoCompra=${____estadoCompra}`);

        let ____totalCompra = ____compra.detalles?.length ? ____compra.detalles.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0) : 0;
        const ____estadoCompra = ____compra.cuotas_en_mora?.monto > 0 ? 'Pendiente' : 'Pagado';
        const ____saldoCompra = ____compra.cuotas_en_mora?.monto || 0;

        return { totalCompra: ____totalCompra, estadoCompra: ____estadoCompra, saldoCompra: ____saldoCompra };
    };

    render() {
        const ____compra = this.props.editObject || compraFallback;
        const { totalCompra, estadoCompra, saldoCompra } = this.calculateCompraDetails();
        const cuotasDetalle = this.cuotasCompras.length > 0 ? this.cuotasCompras : compraFallback.cuotasDetalle;

        console.log(`todo popu: id=${____compra.id}, totalCompra=${totalCompra.toFixed(2)}, estadoCompra=${estadoCompra}`);

        return (
            <SView col={'xs-12'} flex style={{ flex: 1 }} accessibilityLabel="Contenedor principal de gestión de cuotas">
                {/* Header */}
                <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}>
                    <SView flex>
                        <SText col={'xs-12'} fontSize={20} bold color={COLOR_TEXT} numberOfLines={1}>
                            Gestión de Cuotas - Compra #{____compra.id}
                        </SText>
                    </SView>
                    <SView width={40} style={{ overflow: "hidden", alignItems: "flex-end" }}>
                        <SView
                            width={24}
                            height={24}
                            onPress={this.props.onCancel}
                            style={{ opacity: 0.6 }}
                            accessibilityLabel="Cerrar popup"
                            activeOpacity={0.7}
                        >
                            <SIcon name="Close" fill={STheme.color.text} width={24} height={24} />
                        </SView>
                    </SView>
                </SView>
                <SHr h={16} />

                {/* Detalles de la Compra */}
                <SView col={'xs-12'} style={{ paddingHorizontal: 16 }}>
                    <SView
                        col={'xs-12'}
                        style={{
                            backgroundColor: COLOR_CARD,
                            borderRadius: 8,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: COLOR_BORDER,
                        }}
                    >
                        <SView col={'xs-12'}>
                            <SText fontSize={16} bold color={COLOR_TEXT}>Detalles de la Compra</SText>
                        </SView>
                        <SHr h={12} />
                        <SView col={'xs-12'} row>
                            <SText fontSize={14} color={COLOR_TEXT} numberOfLines={1} ellipsizeMode="tail">
                                Descripción: {____compra.descripcion}
                            </SText>
                            <SHr h={4} />
                            <SText fontSize={14} color={COLOR_TEXT}>
                                Total: <SText fontSize={16} bold color={COLOR_TEXT}>{____compra.moneda} {totalCompra.toFixed(2)}</SText>
                            </SText>
                            <SHr h={4} />
                            <SText fontSize={14} color={COLOR_TEXT}>
                                Fecha: {new SDate(____compra.fecha_on || compraFallback.fecha, 'yyyy-MM-dd').toString('dd/MM/yyyy')}
                            </SText>
                            <SHr h={4} />
                            <SText fontSize={14} color={COLOR_TEXT}>Estado: {this.labelEstado2(estadoCompra)}</SText>
                            <SHr h={8} />
                            <SView col={'xs-12'} row>
                                <SView col={'xs-4'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>
                                        Saldo Pendiente: <SText fontSize={14} bold color={COLOR_TEXT}>{____compra.moneda} {saldoCompra.toFixed(2)}</SText>
                                    </SText>
                                </SView>
                                <SView col={'xs-4'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>
                                        Cantidad cuotas: <SText fontSize={14} bold color={COLOR_TEXT}>{____compra.cuotas?.cantidad ?? 0}</SText>
                                    </SText>
                                </SView>
                                <SView col={'xs-4'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>
                                        Monto Total cuotas: <SText fontSize={14} bold color={COLOR_TEXT}>{____compra.moneda} {____compra.cuotas?.total?.toFixed(2) ?? 0}</SText>
                                    </SText>
                                </SView>
                                <SView col={'xs-4'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>
                                        Monto Total pagado: <SText fontSize={14} bold color={COLOR_TEXT}>{____compra.moneda} {____compra.monto_amortizado?.toFixed(2) ?? 0}</SText>
                                    </SText>
                                </SView>
                                <SView col={'xs-4'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>
                                        Cant cuotas Pendientes: <SText fontSize={14} bold color={COLOR_TEXT}>{____compra.cuotas_en_mora?.cantidad ?? 0}</SText>
                                    </SText>
                                </SView>
                                <SView col={'xs-4'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>
                                        Monto Total cuotas Pendientes: <SText fontSize={14} bold color={COLOR_TEXT}>{____compra.moneda} {____compra.cuotas_en_mora?.monto?.toFixed(2) ?? 0}</SText>
                                    </SText>
                                </SView>
                                <SView col={'xs-4'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>
                                        Fecha cuotas Pendientes: <SText fontSize={14} bold color={COLOR_TEXT}>{____compra.cuotas_en_mora?.min_fecha ? new SDate(____compra.cuotas_en_mora.min_fecha).toString('dd/MM/yyyy') : '-'}</SText>
                                    </SText>
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SHr h={16} />

                {/* Cuotas Pendientes Header */}
                <SView col={'xs-12'} style={{ paddingHorizontal: 16 }}>
                    <SView row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <SView width={140} row>
                            <SText fontSize={16} bold color={COLOR_TEXT}>Cuotas</SText>
                        </SView>
                    </SView>
                </SView>
                <SHr h={12} />

                {/* ScrollView for Cuotas */}
                <SView col={'xs-12'} flex style={{ flex: 1, paddingHorizontal: 16 }}>
                    <ScrollView
                        style={{ width: '100%' }}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 16,
                        }}
                    >
                        {cuotasDetalle.length > 0 ? (
                            cuotasDetalle.map((cuota) => (
                                <this.Item
                                    key={`cuota-item-${cuota.numero}`}
                                    cuota={cuota}
                                />
                            ))
                        ) : (
                            <SText
                                center
                                fontSize={14}
                                color={COLOR_TEXT}
                                style={{ padding: 16 }}
                                accessibilityLabel="Mensaje de cuotas no disponibles"
                            >
                                No hay cuotas asociadas a esta compra.
                            </SText>
                        )}
                    </ScrollView>
                </SView>
            </SView>
        );
    }
}