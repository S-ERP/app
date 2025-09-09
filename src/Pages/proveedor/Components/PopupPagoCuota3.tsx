import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SIcon, SHr } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';

// Configuración (mismo objeto que en Pagos para consistencia)
const data = {
    configuracion: {
        estados: {
            pendiente: { label: "Pendiente", color: "#EAB308", bgColor: "#fef8c3", textColor: "#b58940", icon: "history" },
            pagado: { label: "Pagado", color: "#22C55E", bgColor: "#dafce6", textColor: "#42b88f", icon: "Check" },
            vencido: { label: "Vencido", color: "#F97316", bgColor: "#ee343b", textColor: "#eeccda", icon: "AlertOutline" }

        }
    }
};
"15843bf1-0ee2-467d-8052-aa394d2cf477"
// Colores
const COLOR_CARD = STheme.color.lightGray + '44';
const COLOR_TEXT = STheme.color.text;
const COLOR_ACCENT = "#3B82F6";
const COLOR_BORDER = STheme.color.white;

export default class PopupPagoCuota3 extends Component {
    static open(props) {
        SPopup.open({
            key: 'PopupPagoCuota3',
            content: (
                <SView
                    style={{
                        width: "100%",
                        maxWidth: 600,
                        maxHeight: "90%",
                        padding: 8,
                        // padding: 16,
                        overflow: 'hidden',
                        backgroundColor: STheme.color.danger,
                        // backgroundColor: STheme.color.background,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: COLOR_BORDER,
                    }}
                    withoutFeedback
                    closeOnTouchOutside
                    accessibilityLabel="Popup de gestión de cuotas"
                >
                    <PopupPagoCuota3
                        {...props}
                        onCancel={() => {
                            SPopup.close('PopupPagoCuota3');
                            if (props.onCancel) props.onCancel();
                        }}
                        onSuccess={(e) => {
                            SPopup.close('PopupPagoCuota3');
                            if (props.onSuccess) props.onSuccess(e);
                        }}
                    />
                </SView>
            ),
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            montoPagar: {},
            isLoading: false,
            selectedCuotas: {}, // Track selected cuotas by their numero
            showPaidCuotas: false, // Toggle visibility of paid cuotas
            showAllPendingCuotas: false, // Toggle visibility of all future pending cuotas
        };
    }

    getCompraData = () => {
        const { editObject } = this.props;
        return {
            id: editObject?.id || 101,
            descripcion: editObject?.descripcion || 'Productos de limpieza y mantenimiento',
            estado: editObject?.estado || 'Pendiente',
            fecha: editObject?.fecha || '2024-12-01',
            total: editObject?.total || 8500,
            cuotasDetalle: editObject?.cuotasDetalle || [
                { numero: 1, estado: 'Pagado', vencimiento: '2025-01-14', fechaPago: '2025-01-13', monto: 708.33 },
                { numero: 2, estado: 'Pagado', vencimiento: '2025-02-14', fechaPago: '2025-02-13', monto: 708.33 },
                { numero: 3, estado: 'Pagado', vencimiento: '2025-03-14', fechaPago: '2025-03-13', monto: 708.33 },
                { numero: 4, estado: 'Pendiente', vencimiento: '2025-04-14', fechaPago: null, monto: 708.33 }, // Vencida
                { numero: 5, estado: 'Pendiente', vencimiento: '2025-05-14', fechaPago: null, monto: 708.33 }, // Vencida
                { numero: 6, estado: 'Pendiente', vencimiento: '2025-06-14', fechaPago: null, monto: 708.33 }, // Vencida
                { numero: 7, estado: 'Pendiente', vencimiento: '2025-07-14', fechaPago: null, monto: 708.33 }, // Vencida
                { numero: 8, estado: 'Pendiente', vencimiento: '2025-08-14', fechaPago: null, monto: 708.33 }, // Vencida
                { numero: 9, estado: 'Pendiente', vencimiento: '2025-09-14', fechaPago: null, monto: 708.33 }, // Future pending
                { numero: 10, estado: 'Pendiente', vencimiento: '2025-10-14', fechaPago: null, monto: 708.33 }, // Future pending
                { numero: 11, estado: 'Pendiente', vencimiento: '2025-11-14', fechaPago: null, monto: 708.33 }, // Future pending
                { numero: 12, estado: 'Pendiente', vencimiento: '2025-12-14', fechaPago: null, monto: 708.37 }, // Future pending, adjusted for rounding
            ],
            moneda: editObject?.moneda || 'BOB',
        };
    };

    selectPreviousCuotas = (selectedCuota) => {
        const compra = this.getCompraData();
        const selectedDate = new Date(selectedCuota.vencimiento);
        const newSelectedCuotas = { ...this.state.selectedCuotas };

        compra.cuotasDetalle.forEach((cuota) => {
            if (cuota.estado !== 'Pagado') {
                const cuotaDate = new Date(cuota.vencimiento);
                newSelectedCuotas[cuota.numero] = cuotaDate <= selectedDate;
            }
        });

        this.setState({ selectedCuotas: newSelectedCuotas });
    };

    deselectPreviousCuotas = (selectedCuota) => {
        const compra = this.getCompraData();
        const selectedDate = new Date(selectedCuota.vencimiento);
        const newSelectedCuotas = { ...this.state.selectedCuotas };

        compra.cuotasDetalle.forEach((cuota) => {
            if (cuota.estado !== 'Pagado') {
                const cuotaDate = new Date(cuota.vencimiento);
                if (cuotaDate <= selectedDate) {
                    newSelectedCuotas[cuota.numero] = false;
                }
            }
        });

        this.setState({ selectedCuotas: newSelectedCuotas });
    };

    handlePagarDeuda = async (cuota) => {
        const { montoPagar, isLoading } = this.state;
        const monto = parseFloat(montoPagar[cuota.numero] || '0');
        if (isLoading) return;
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
        this.setState({ isLoading: true });
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
            const newMontoPagar = { ...montoPagar };
            delete newMontoPagar[cuota.numero];
            this.setState({ montoPagar: newMontoPagar, isLoading: false });
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
            this.setState({ isLoading: false });
        }
    };

    isCuotaVencida = (vencimiento) => {
        const today = new Date('2025-09-08'); // Fixed to September 8, 2025
        const vencimientoDate = new Date(vencimiento);
        return vencimientoDate < today;
    };

    Item = ({ cuota, index, compra }) => {
        const { isLoading, selectedCuotas } = this.state;
        const monedaSymbol = compra.moneda || 'BOB';
        const isPaid = cuota.estado === 'Pagado';
        const isVencida = !isPaid && this.isCuotaVencida(cuota.vencimiento);
        const estadoConfig = data.configuracion.estados[isVencida ? 'vencido' : cuota.estado.toLowerCase()];

        return (
            <SView
                key={`cuota-${cuota.numero}`}
                col={'xs-12'}
                style={{
                    backgroundColor: selectedCuotas[cuota.numero] ? STheme.color.card : STheme.color.lightGray + '55',
                    borderColor: selectedCuotas[cuota.numero] ? STheme.color.success : STheme.color.success + '55',
                    borderRadius: 8,
                    padding: 16,
                    borderWidth: 1,
                    marginBottom: 12,
                }}
                onPress={() => {
                    if (!isPaid) {
                        const newSelectedCuotas = { ...this.state.selectedCuotas };
                        if (selectedCuotas[cuota.numero]) {
                            this.deselectPreviousCuotas(cuota);
                        } else {
                            newSelectedCuotas[cuota.numero] = true;
                            this.setState({ selectedCuotas: newSelectedCuotas });
                            this.selectPreviousCuotas(cuota);
                        }
                    }
                }}
                accessibilityLabel={`Cuota ${cuota.numero} - ${cuota.estado}`}
                activeOpacity={0.7}
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
                        Vencimiento: <SText bold>{cuota.vencimiento}</SText>
                    </SText>
                    <SText fontSize={16} bold color={COLOR_TEXT}>
                        {monedaSymbol} {parseFloat(cuota.monto).toFixed(2)}
                    </SText>
                </SView>
                <SHr h={8} />
                {isPaid ? (
                    <SView row>
                        <SText fontSize={14} color={COLOR_TEXT}>
                            Pagado: <SText bold color={data.configuracion.estados.pagado.color}>{cuota.fechaPago}</SText>
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
        const estadoNormalizado = isVencida ? 'vencido' : estado?.toLowerCase();
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estadoNormalizado] || data.configuracion.estados.pendiente;
        return (
            <SView width={80} row center accessibilityLabel={`Estado: ${label}`} >
                <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: color, }} >
                    <SIconApp name={icon} width={14} height={14} fill={textColor} /><SView width={4} /><SText fontSize={12} bold color={textColor}>{label}</SText>
                </SView>
            </SView>
        );
    };

    labelEstado2 = (estado, isVencida = false) => {
        const estadoNormalizado = isVencida ? 'vencido' : estado?.toLowerCase();
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estadoNormalizado] || data.configuracion.estados.pendiente;
        return (
            // <SView width={80} row center accessibilityLabel={`Estado: ${label}`} >
            <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, padding: 4, borderWidth: 1, borderColor: color, }} >
                <SIconApp name={icon} width={12} height={12} fill={textColor} /><SText fontSize={12} bold color={textColor}> {label}</SText>
            </SView>
            // </SView>
        );
    };

    botonEstado = (estado) => {
        const estadoNormalizado = estado?.toLowerCase();
        if (estadoNormalizado !== 'pendiente') return null;

        const compra = this.getCompraData();
        const selectedCuotas = compra.cuotasDetalle.filter(
            (c) => this.state.selectedCuotas[c.numero] && c.estado !== 'Pagado'
        );
        const isAnyCuotaSelected = selectedCuotas.length > 0;
        return (
            <SView onPress={() => {
                if (isAnyCuotaSelected) {
                    this.handlePagarDeuda(selectedCuotas[0]);
                } else {
                    SNotification.send({ title: 'Error', time: 3000, color: STheme.color.danger, body: 'Por favor, selecciona al menos una cuota para pagar.' });
                }
            }}
            // activeOpacity={0.7}
            // accessibilityLabel="Pagar compra completa"
            >

                <SView row center style={{ borderRadius: 4, paddingVertical: 8, paddingHorizontal: 8, borderWidth: 1, backgroundColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray, borderColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray }}>
                    <SIconApp name='pagotarjeta' width={16} fill={STheme.color.white} /><SText fontSize={12} bold color={STheme.color.white}>  Pagar Ahora</SText>
                </SView>
            </SView>
        );
    };

    togglePaidCuotas = () => {
        this.setState({ showPaidCuotas: !this.state.showPaidCuotas });
    };

    toggleAllPendingCuotas = () => {
        this.setState({ showAllPendingCuotas: !this.state.showAllPendingCuotas });
    };

    render() {
        const compra = this.getCompraData();
        const { showPaidCuotas, showAllPendingCuotas } = this.state;
        const today = new Date('2025-09-08'); // Fixed to September 8, 2025

        // Filter cuotas based on state
        const filteredCuotas = compra.cuotasDetalle.filter((cuota) => {
            const isPaid = cuota.estado === 'Pagado';
            const isVencida = !isPaid && this.isCuotaVencida(cuota.vencimiento);
            const isFuturePending = !isPaid && !isVencida;

            // Show paid cuotas only if showPaidCuotas is true
            if (isPaid) {
                return showPaidCuotas;
            }
            // Always show vencidas cuotas
            if (isVencida) {
                return true;
            }
            // Show future pending cuotas (numero <= 2) unless showAllPendingCuotas is true
            if (isFuturePending) {
                return showAllPendingCuotas || cuota.numero <= 2;
            }
            return false;
        });

        // Check if there are any paid cuotas
        const hasPaidCuotas = compra.cuotasDetalle.some((cuota) => cuota.estado === 'Pagado');
        // Check if there are more than two future pending cuotas
        const hasMoreThanTwoFuturePending = compra.cuotasDetalle.filter(
            (cuota) => cuota.estado !== 'Pagado' && !this.isCuotaVencida(cuota.vencimiento) && cuota.numero > 2
        ).length > 0;

        const MontoSeleccionado = compra.cuotasDetalle
            .filter((cuota) => this.state.selectedCuotas[cuota.numero] && cuota.estado !== 'Pagado')
            .reduce((sum, cuota) => sum + parseFloat(cuota.monto.toString()), 0)
            .toFixed(2);
        const MontoSaldo = compra.cuotasDetalle
            .filter((cuota) => cuota.estado !== 'Pagado')
            .reduce((sum, cuota) => sum + parseFloat(cuota.monto.toString()), 0)
            .toFixed(2);

        return (
            <SView col={'xs-12'} flex style={{ flex: 1 }} accessibilityLabel="Contenedor principal de gestión de cuotas">
                {/* Header */}
                {/* <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}> */}
                <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}>
                    <SView flex>
                        <SText col={'xs-12'} fontSize={20} bold color={COLOR_TEXT} numberOfLines={1}>Gestión de Cuotas - Compra #{compra.id}</SText>
                    </SView>

                    <SView width={40} style={{ overflow: "hidden", alignItems: "flex-end" }}>
                        <SView

                            width={24}
                            height={24}
                            onPress={this.props.onCancel}
                            style={{
                                opacity: 0.6,
                            }}
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
                            padding: 8,
                            // padding: 16,
                            borderWidth: 1,
                            borderColor: COLOR_BORDER,
                        }}
                    >
                        <SView col={'xs-12'} >
                            {/* <SView col={'xs-12'} backgroundColor='red'> */}
                            <SText fontSize={16} bold color={COLOR_TEXT}>Detalles de la Compra</SText>
                        </SView>
                        <SHr h={12} />
                        <SView col={'xs-12'} row  >
                            <SText fontSize={14} color={COLOR_TEXT} numberOfLines={1} ellipsizeMode="tail">Descripción: {compra.descripcion}</SText>
                            <SHr h={4} />
                            <SText fontSize={14} color={COLOR_TEXT}>Total: <SText fontSize={16} bold color={COLOR_TEXT}>{compra.moneda} {compra.total.toFixed(2)}</SText></SText>
                            <SHr h={4} />
                            <SText fontSize={14} color={COLOR_TEXT}>Fecha: {compra.fecha}</SText>
                            <SHr h={4} />
                            <SText fontSize={14} color={COLOR_TEXT}>Estado: {this.labelEstado2(compra.estado)}</SText>
                            <SHr h={8} />
                            <SView col={'xs-12'} row>
                                <SView col={'xs-6'}>
                                    <SText fontSize={14} color={COLOR_TEXT}>Saldo Pendiente: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {MontoSaldo}</SText></SText>
                                </SView>
                                <SView col={'xs-6'} >
                                    <SText fontSize={14} color={COLOR_TEXT}>Monto Seleccionado: <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {MontoSeleccionado}</SText></SText>
                                </SView>
                            </SView>
                        </SView>
                        {/* <SHr h={16} />
                        <SView col={'xs-12'} row center>
                            <SView flex>
                                {this.botonEstado(compra.estado)}
                            </SView>
                        </SView> */}

                        {/* <SView width={120} backgroundColor='yellow' style={{ position: "absolute", top: 16, right: 16 }}>
                            <SView width={120} height={40} backgroundColor='cyan' center >
                                {this.botonEstado(compra.estado)}
                            </SView>
                        </SView> */}
                    </SView>
                </SView>
                <SHr h={16} />

                {/* Cuotas Pendientes Header and Buttons */}
                <SView col={'xs-12'} style={{ paddingHorizontal: 16 }}>
                    <SView row style={{ justifyContent: 'space-between', alignItems: 'center' }}>

                        <SView width={140} row ><SText fontSize={16} bold color={COLOR_TEXT}>Cuotas Pendientes</SText></SView>

                        <SView flex style={{ alignItems: "flex-end" }}>

                            <SView row  >
                                {/* Ver/Ocultar anteriores (only if there are paid cuotas) */}
                                {hasPaidCuotas && (
                                    <SView
                                        row
                                        center
                                        style={{
                                            paddingVertical: 4,
                                            paddingHorizontal: 8,
                                            borderRadius: 4,
                                            borderWidth: 1,
                                            borderColor: COLOR_ACCENT + '80',
                                            marginRight: 8,
                                        }}
                                        onPress={this.togglePaidCuotas}
                                        activeOpacity={0.7}
                                        accessibilityLabel={this.state.showPaidCuotas ? 'Ocultar anteriores' : 'Ver anteriores'}
                                    >
                                        {/* <SIconApp name={this.state.showPaidCuotas ? 'Eyes' : 'history'} width={12} height={12} fill={COLOR_ACCENT} /> */}
                                        {/* <SView width={4} /> */}
                                        <SText fontSize={12} color={COLOR_ACCENT}>
                                            {this.state.showPaidCuotas ? '- Pagadas' : '+ Pagadas'}
                                        </SText>
                                    </SView>
                                )}
                                {/* Ver más cuotas pendientes (only if there are future pending cuotas with numero > 2) */}
                                {hasMoreThanTwoFuturePending && (
                                    <SView
                                        row
                                        center
                                        style={{
                                            paddingVertical: 4,
                                            paddingHorizontal: 8,
                                            borderRadius: 4,
                                            borderWidth: 1,
                                            borderColor: COLOR_ACCENT + '80',
                                        }}
                                        onPress={this.toggleAllPendingCuotas}
                                        activeOpacity={0.7}
                                        accessibilityLabel="Ver más cuotas pendientes"
                                    >
                                        {/* <SIcon name="add1" width={12} height={12} fill={COLOR_ACCENT} /> */}
                                        {/* <SView width={4} /> */}


                                        <SText fontSize={12} color={COLOR_ACCENT}>+ Pendientes</SText>
                                    </SView>
                                )}
                            </SView>
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
                        {filteredCuotas.length > 0 ? (
                            filteredCuotas.map((cuota, index) => (
                                <this.Item
                                    key={`cuota-item-${cuota.numero}`}
                                    cuota={cuota}
                                    index={index}
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
                    </ScrollView>
                </SView>
            </SView>
        );
    }
}