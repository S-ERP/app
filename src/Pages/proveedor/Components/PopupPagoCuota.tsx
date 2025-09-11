import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SIcon, SHr, SDate } from 'servisofts-component';
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
const COLOR_ACCENT = "#3B82F6";
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

export default class PopupPagoCuota extends Component {
    static open(props) {
        SPopup.open({
            key: 'PopupPagoCuota',
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
                    <PopupPagoCuota
                        {...props}
                        onCancel={() => {
                            SPopup.close('PopupPagoCuota');
                            if (props.onCancel) props.onCancel();
                        }}
                        onSuccess={(e) => {
                            SPopup.close('PopupPagoCuota');
                            if (props.onSuccess) props.onSuccess(e);
                        }}
                    />
                </SView>
            ),
        });
    }

    constructor(props) {
        super(props);
        this.cuotasCompras = [];
        this.selectedCuotas = {};
        this.montoPagar = {};
        this.isLoading = false;
        this.showPaidCuotas = this.props.editObject.pagado ? true : false;
        this.showAllPendingCuotas = false;

    }

    loadData = async () => {
        const key_compra_venta = this.props.editObject?.key || '1f30bf00-33ba-4466-813b-2870eec111dd';
        try {
            const registros = await MDL.compra_venta.getCuotasCompras(key_compra_venta);
            return registros;
        } catch (error) {
            console.error('Error in loadData:', error);
            return compraFallback.cuotasDetalle;
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

    selectPreviousCuotas = (selectedCuota) => {
        const compra = this.getCompraData();
        const selectedDate = new SDate(selectedCuota.vencimiento, 'yyyy-MM-dd');
        const newSelectedCuotas = { ...this.selectedCuotas };

        for (let i = 0; i < compra.cuotasDetalle.length; i++) {
            const cuota = compra.cuotasDetalle[i];
            if (cuota.estado !== 'Pagado') {
                const cuotaDate = new SDate(cuota.vencimiento, 'yyyy-MM-dd');
                newSelectedCuotas[cuota.numero] = cuotaDate.isBefore(selectedDate) || cuotaDate.isEqual?.(selectedDate) || cuotaDate.toString('yyyy-MM-dd') === selectedDate.toString('yyyy-MM-dd');
            }
        }

        this.selectedCuotas = newSelectedCuotas;
        this.forceUpdate();
    };

    deselectPreviousCuotas = (selectedCuota) => {
        const compra = this.getCompraData();
        const selectedDate = new SDate(selectedCuota.vencimiento, 'yyyy-MM-dd');
        const newSelectedCuotas = { ...this.selectedCuotas };

        for (let i = 0; i < compra.cuotasDetalle.length; i++) {
            const cuota = compra.cuotasDetalle[i];
            if (cuota.estado !== 'Pagado') {
                const cuotaDate = new SDate(cuota.vencimiento, 'yyyy-MM-dd');
                if (cuotaDate.isBefore(selectedDate) || cuotaDate.isEqual?.(selectedDate) || cuotaDate.toString('yyyy-MM-dd') === selectedDate.toString('yyyy-MM-dd')) {
                    newSelectedCuotas[cuota.numero] = false;
                }
            }
        }

        this.selectedCuotas = newSelectedCuotas;
        this.forceUpdate();
    };

    handlePagarDeuda = async (cuota) => {
        const monto = parseFloat(this.montoPagar[cuota.numero] || '0');
        if (this.isLoading) return;
        if (monto <= 0) {
            SNotification.send({
                title: 'Error',
                body: 'El monto debe ser mayor a cero.',
                time: 3000,
                color: STheme.color.danger,
                position: 'top',
            });
            return;
        }
        if (monto > cuota.monto) {
            SNotification.send({
                title: 'Error',
                body: `El monto no puede exceder el valor de la cuota (${cuota.monto.toFixed(2)}).`,
                time: 3000,
                color: STheme.color.danger,
                position: 'top',
            });
            return;
        }
        this.isLoading = true;
        this.forceUpdate();
        try {
            console.log(
                `Registrando pago: Compra ${this.props.editObject?.id}, Cuota ${cuota.numero}, Monto ${monto}`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            SNotification.send({
                title: 'Éxito',
                body: 'El pago se registró correctamente.',
                time: 3000,
                color: STheme.color.success,
                position: 'top',
            });
            const newMontoPagar = { ...this.montoPagar };
            delete newMontoPagar[cuota.numero];
            this.montoPagar = newMontoPagar;
            this.isLoading = false;
            if (this.props.onSuccess) {
                this.props.onSuccess({ cuota, monto });
            }
        } catch (error) {
            console.error('Error al registrar el pago:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo registrar el pago.',
                time: 3000,
                color: STheme.color.danger,
                position: 'top',
            });
            this.isLoading = false;
        }
        this.forceUpdate();
    };

    getCompraData = () => {
        const ____compra = this.props.editObject || compraFallback;
        let totalCompra = 0;
        if (____compra.detalles?.length) {
            for (let i = 0; i < ____compra.detalles.length; i++) {
                const item = ____compra.detalles[i];
                totalCompra += item.precio_unitario * item.cantidad;
            }
        }
        const estadoCompra = ____compra.cuotas_en_mora?.monto > 0 ? 'Pendiente' : 'Pagado';
        const saldoCompra = ____compra.cuotas_en_mora?.monto || 0;
        const cuotasDetalle = this.cuotasCompras.length > 0 ? this.cuotasCompras : compraFallback.cuotasDetalle;

        return {
            id: ____compra.id || compraFallback.id,
            descripcion: ____compra.descripcion || compraFallback.descripcion,
            estado: estadoCompra,
            fecha: ____compra.fecha_on || compraFallback.fecha,
            total: totalCompra || compraFallback.total,
            cuotasDetalle: cuotasDetalle,
            moneda: ____compra.moneda || compraFallback.moneda,
            cuotas: ____compra.cuotas || { cantidad: 0, total: 0 },
            monto_amortizado: ____compra.monto_amortizado || 0,
            cuotas_en_mora: ____compra.cuotas_en_mora || { cantidad: 0, monto: 0, min_fecha: null },
        };
    };

    Item = ({ cuota, compra }) => {
        const monedaSymbol = compra.moneda;
        const isPaid = cuota.estado === 'Pagado';
        const isVencida = !isPaid && this.isCuotaVencida(cuota.vencimiento);
        const estadoConfig = data.configuracion.estados[isVencida ? 'Vencido' : cuota.estado] || data.configuracion.estados.Pendiente;

        return (
            <SView
                key={`cuota-${cuota.numero}`}
                col={'xs-12'}
                style={{
                    backgroundColor: this.selectedCuotas[cuota.numero] ? STheme.color.card : STheme.color.lightGray + '55',
                    borderColor: this.selectedCuotas[cuota.numero] ? STheme.color.success : STheme.color.success + '55',
                    borderRadius: 8,
                    padding: 16,
                    borderWidth: 1,
                    marginBottom: 12,
                }}
                onPress={() => {
                    if (!isPaid) {
                        const newSelectedCuotas = { ...this.selectedCuotas };
                        if (this.selectedCuotas[cuota.numero]) {
                            this.deselectPreviousCuotas(cuota);
                        } else {
                            newSelectedCuotas[cuota.numero] = true;
                            this.selectedCuotas = newSelectedCuotas;
                            this.selectPreviousCuotas(cuota);
                        }
                    }
                }}
                accessibilityLabel={`Cuota ${cuota.numero} - ${cuota.estado}`}
                activeOpacity={0.7}
            >
                <SView row center style={{ justifyContent: "space-between" }} backgroundColor='transparent'>
                    <SView flex row style={{ paddingTop: 4 }} > <SText fontSize={16} bold color={COLOR_TEXT}>Cuota #{cuota.numero}</SText> </SView>
                    <SView> {this.labelEstado(cuota.estado, isVencida)} </SView>
                </SView>

                <SHr h={4} />
                <SView row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={14} color={COLOR_TEXT}>Vencimiento: <SText bold>{new SDate(cuota.vencimiento, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText></SText>
                    <SText fontSize={16} bold color={COLOR_TEXT}> {monedaSymbol} {parseFloat(cuota.monto).toFixed(2)} </SText>
                </SView>
                {isPaid ? (
                    <SText fontSize={14} color={COLOR_TEXT}>Pagado: <SText bold color={data.configuracion.estados.Pagado.color}>{new SDate(cuota.fechaPago, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText> </SText>
                ) : (
                    <SText fontSize={14} color={COLOR_TEXT}>Estado: <SText bold color={estadoConfig.color}> {isVencida ? 'En mora' : 'Pendiente de pago'} </SText> </SText>
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

    botonEstado = (estado) => {
        const estadoNormalizado = estado?.toLowerCase();
        if (estadoNormalizado !== 'pendiente') return null;

        const compra = this.getCompraData();
        const selectedCuotas = [];
        for (let i = 0; i < compra.cuotasDetalle.length; i++) {
            const c = compra.cuotasDetalle[i];
            if (this.selectedCuotas[c.numero] && c.estado !== 'Pagado') {
                selectedCuotas.push(c);
            }
        }
        const isAnyCuotaSelected = selectedCuotas.length > 0;

        return (
            <SView
                onPress={() => {
                    if (isAnyCuotaSelected) {
                        this.handlePagarDeuda(selectedCuotas[0]);
                    } else {
                        SNotification.send({
                            title: 'Error',
                            time: 3000,
                            color: STheme.color.danger,
                            body: 'Por favor, selecciona al menos una cuota para pagar.',
                        });
                    }
                }}
                activeOpacity={0.7}
                accessibilityLabel="Pagar compra completa"
                style={{ width: 180, height: 40 }}
            >
                <SView
                    row
                    center
                    style={{
                        borderRadius: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        backgroundColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray,
                        borderColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray,
                        height: '100%',
                    }}
                >
                    <SIconApp name='pagotarjeta' width={18} fill={STheme.color.white} />
                    <SView width={8} />
                    <SText fontSize={14} bold color={STheme.color.white}>Pagar Ahora</SText>
                </SView>
            </SView>
        );
    };

    togglePaidCuotas = () => {
        this.showPaidCuotas = !this.showPaidCuotas;
        this.forceUpdate();
    };

    toggleAllPendingCuotas = () => {
        this.showAllPendingCuotas = !this.showAllPendingCuotas;
        this.forceUpdate();
    };

    render() {
        const compra = this.getCompraData();
        const today = new SDate('2025-09-08', 'yyyy-MM-dd');

        // Calculate Monto Seleccionado and Monto Saldo without reduce
        let MontoSeleccionado = 0;
        let MontoSaldo = 0;
        for (let i = 0; i < compra.cuotasDetalle.length; i++) {
            const cuota = compra.cuotasDetalle[i];
            if (cuota.estado !== 'Pagado') {
                MontoSaldo += parseFloat(cuota.monto);
                if (this.selectedCuotas[cuota.numero]) {
                    MontoSeleccionado += parseFloat(cuota.monto);
                }
            }
        }
        MontoSeleccionado = MontoSeleccionado.toFixed(2);
        MontoSaldo = MontoSaldo.toFixed(2);

        // Filter cuotas based on visibility toggles
        const filteredCuotas = [];
        for (let i = 0; i < compra.cuotasDetalle.length; i++) {
            const cuota = compra.cuotasDetalle[i];
            const isPaid = cuota.estado === 'Pagado';
            const isVencida = !isPaid && this.isCuotaVencida(cuota.vencimiento);
            const isFuturePending = !isPaid && !isVencida;

            if (isPaid && this.showPaidCuotas) {
                filteredCuotas.push(cuota);
            } else if (isVencida) {
                filteredCuotas.push(cuota);
            } else if (isFuturePending && (this.showAllPendingCuotas || cuota.numero <= 2)) {
                filteredCuotas.push(cuota);
            }
        }

        // Check for toggle buttons
        let hasPaidCuotas = false;
        let hasMoreThanTwoFuturePending = false;
        for (let i = 0; i < compra.cuotasDetalle.length; i++) {
            const cuota = compra.cuotasDetalle[i];
            if (cuota.estado === 'Pagado') {
                hasPaidCuotas = true;
            }
            if (cuota.estado !== 'Pagado' && !this.isCuotaVencida(cuota.vencimiento) && cuota.numero > 2) {
                hasMoreThanTwoFuturePending = true;
            }
        }

        return (
            <SView col={'xs-12'} flex style={{ flex: 1 }} accessibilityLabel="Contenedor principal de gestión de cuotas">
                <ScrollView
                    style={{ width: '100%' }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 80, // Extra padding to avoid overlap with bottom bar
                    }}
                >
                    {/* Header */}
                    <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}>
                        <SView flex>
                            <SText col={'xs-12'} fontSize={20} bold color={COLOR_TEXT} numberOfLines={1}>
                                Gestión de Cuotas - Compra #{compra.id}
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
                                <SIcon name="Close" fill={COLOR_TEXT} width={24} height={24} />
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
                                    Descripción: {compra.descripcion}
                                </SText>
                                <SHr h={4} />
                                <SText fontSize={14} color={COLOR_TEXT}>
                                    Total: <SText fontSize={16} bold color={COLOR_TEXT}>{compra.moneda} {compra.total.toFixed(2)}</SText>
                                </SText>
                                <SHr h={4} />
                                <SText fontSize={14} color={COLOR_TEXT}>
                                    Fecha: {new SDate(compra.fecha, 'yyyy-MM-dd').toString('dd/MM/yyyy')}
                                </SText>
                                <SHr h={4} />
                                <SText fontSize={14} color={COLOR_TEXT}>
                                    Estado: {this.labelEstado2(compra.estado)}
                                </SText>
                                <SHr h={8} />
                                <SView col={'xs-12'} row>
                                    <SView col={'xs-6'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Saldo Pendiente: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {MontoSaldo}</SText>
                                        </SText>
                                    </SView>
                                    <SView col={'xs-6'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Monto Seleccionado: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {MontoSeleccionado}</SText>
                                        </SText>
                                    </SView>
                                    <SView col={'xs-4'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Cantidad cuotas: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.cuotas?.cantidad ?? 0}</SText>
                                        </SText>
                                    </SView>
                                    <SView col={'xs-4'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Monto Total cuotas: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {compra.cuotas?.total?.toFixed(2) ?? 0}</SText>
                                        </SText>
                                    </SView>
                                    <SView col={'xs-4'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Monto Total pagado: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {compra.monto_amortizado?.toFixed(2) ?? 0}</SText>
                                        </SText>
                                    </SView>
                                    <SView col={'xs-4'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Cant cuotas Pendientes: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.cuotas_en_mora?.cantidad ?? 0}</SText>
                                        </SText>
                                    </SView>
                                    <SView col={'xs-4'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Monto Total cuotas Pendientes: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {compra.cuotas_en_mora?.monto?.toFixed(2) ?? 0}</SText>
                                        </SText>
                                    </SView>
                                    <SView col={'xs-4'}>
                                        <SText fontSize={14} color={COLOR_TEXT}>
                                            Fecha cuotas Pendientes: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.cuotas_en_mora?.min_fecha ? new SDate(compra.cuotas_en_mora.min_fecha).toString('dd/MM/yyyy') : '-'}</SText>
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
                                <SText fontSize={16} bold color={COLOR_TEXT}>{this.props.editObject.pagado ? "Cuotas Pagadas" : "Cuotas Pendientes"}</SText>
                            </SView>
                        </SView>
                    </SView>
                    <SHr h={12} />

                    {/* Cuotas */}
                    <SView col={'xs-12'} style={{ paddingHorizontal: 16 }}>
                        {filteredCuotas.length > 0 ? (
                            filteredCuotas.map((cuota) => (
                                <this.Item
                                    key={`cuota-item-${cuota.numero}`}
                                    cuota={cuota}
                                    compra={compra}
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
                    </SView>
                    <SHr h={16} />
                </ScrollView>

                {/* Bottom Button Bar */}
                <SView
                    col={'xs-12'}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: STheme.color.background,
                        borderTopWidth: 1,
                        borderTopColor: COLOR_BORDER,
                        padding: 12,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <SView row>
                        {hasPaidCuotas && (
                            <SView
                                row
                                center
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: COLOR_ACCENT,
                                    marginRight: 8,
                                    height: 40,
                                }}
                                onPress={this.togglePaidCuotas}
                                activeOpacity={0.7}
                                accessibilityLabel={this.showPaidCuotas ? 'Ocultar anteriores' : 'Ver anteriores'}
                            >
                                <SText fontSize={14} color={COLOR_ACCENT}>
                                    {this.showPaidCuotas ? '- Pagadas' : '+ Pagadas'}
                                </SText>
                            </SView>
                        )}
                        {hasMoreThanTwoFuturePending && (
                            <SView
                                row
                                center
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: COLOR_ACCENT,
                                    height: 40,
                                }}
                                onPress={this.toggleAllPendingCuotas}
                                activeOpacity={0.7}
                                accessibilityLabel="Ver más cuotas pendientes"
                            >
                                <SText fontSize={14} color={COLOR_ACCENT}>+ Pendientes</SText>
                            </SView>
                        )}
                    </SView>
                    {this.botonEstado(compra.estado)}
                </SView>
            </SView>
        );
    }
}