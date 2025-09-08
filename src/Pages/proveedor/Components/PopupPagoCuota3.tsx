import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SIcon, SHr } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';

// Configuración (mismo objeto que en Pagos para consistencia)
const data = {
    configuracion: {
        estados: {
            pendiente: { label: "Pendiente", color: "#F97316", bgColor: "#FFF7ED", textColor: "#9A3412", icon: "Clock" },
            pagado: { label: "Pagado", color: "#22C55E", bgColor: "#DCFCE7", textColor: "#166534", icon: "Check" },
            vencido: { label: "Vencido", color: "#EAB308", bgColor: "#FEF9C3", textColor: "#854D0E", icon: "Warning" }
        }
    }
};

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
                        padding: 16,
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
        };
    }

    getCompraData = () => {
        const { editObject } = this.props;
        return {
            id: editObject?.id || 101,
            descripcion: editObject?.descripcion || 'Productos de limpieza y mantenimiento',
            estado: editObject?.estado || 'Pendiente',
            fecha: editObject?.fecha || '2024-01-14',
            total: editObject?.total || 8500,
            cuotasDetalle: editObject?.cuotasDetalle || [
                { numero: 1, estado: 'Pagado', vencimiento: '2024-02-14', fechaPago: '2024-02-13', monto: 2833.33 },
                { numero: 2, estado: 'Pendiente', vencimiento: '2024-03-14', fechaPago: null, monto: 2833.33 },
                { numero: 3, estado: 'Pendiente', vencimiento: '2024-04-14', fechaPago: null, monto: 2833.34 },
                { numero: 4, estado: 'Pendiente', vencimiento: '2025-01-14', fechaPago: null, monto: 2833.34 },
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
        const today = new Date();
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
            <SView
                width={100}
                row
                center
                accessibilityLabel={`Estado: ${label}`}
            >
                <SView
                    row
                    center
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderWidth: 1,
                        borderColor: color,
                    }}
                >
                    <SIconApp name={icon} width={14} height={14} fill={textColor} />
                    <SView width={4} />
                    <SText fontSize={12} bold color={textColor}>{label}</SText>
                </SView>
            </SView>
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
            <SView
                width={160}
                row
                center
                onPress={() => {
                    if (isAnyCuotaSelected) {
                        this.handlePagarDeuda(selectedCuotas[0]);
                    } else {
                        SNotification.send({
                            title: 'Error',
                            body: 'Por favor, selecciona al menos una cuota para pagar.',
                            time: 3000,
                            color: STheme.color.danger,
                            position: 'top',
                        });
                    }
                }}
                activeOpacity={0.7}
                accessibilityLabel="Pagar compra completa"
            >
                <SView
                    flex
                    row
                    center
                    style={{
                        backgroundColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray,
                        borderRadius: 6,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray,
                    }}
                >
                    <SIconApp name='pagotarjeta' width={16} height={16} fill={STheme.color.white} />
                    <SView width={8} />
                    <SText fontSize={14} bold color={STheme.color.white}>Pagar Ahora</SText>
                </SView>
            </SView>
        );
    };

    render() {
        const compra = this.getCompraData();
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
                <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}>
                    <SView flex>
                        <SText fontSize={20} bold color={COLOR_TEXT}>
                            Gestión de Cuotas - Compra #{compra.id}
                        </SText>
                    </SView>
                    <SView width={40}>
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
                        <SText fontSize={16} bold color={COLOR_TEXT}>Detalles de la Compra</SText>
                        <SHr h={12} />
                        <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                            <SView flex>
                                <SText fontSize={14} color={COLOR_TEXT}>Descripción:</SText>
                                <SText fontSize={14} color={COLOR_TEXT} numberOfLines={2} ellipsizeMode="tail">
                                    {compra.descripcion}
                                </SText>
                                <SHr h={8} />
                                <SText fontSize={14} color={COLOR_TEXT}>Total:</SText>
                                <SText fontSize={16} bold color={COLOR_TEXT}>{compra.moneda} {compra.total.toFixed(2)}</SText>
                                <SHr h={8} />
                                <SText fontSize={14} color={COLOR_TEXT}>Fecha:</SText>
                                <SText fontSize={14} color={COLOR_TEXT}>{compra.fecha}</SText>
                                <SHr h={8} />
                                <SView row>
                                    <SText fontSize={14} color={COLOR_TEXT}>Estado:</SText>
                                    <SView width={8} />
                                    {this.labelEstado(compra.estado)}
                                </SView>
                                <SHr h={8} />
                                <SView col={'xs-12'} row>
                                    <SView col={'xs-6'} row>
                                        <SText fontSize={14} color={COLOR_TEXT}>Saldo Pendiente:</SText>
                                        <SView width={8} />
                                        <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {MontoSaldo}</SText>
                                    </SView>
                                    <SView col={'xs-6'} row>
                                        <SText fontSize={14} color={COLOR_TEXT}>Monto Seleccionado:</SText>
                                        <SView width={8} />
                                        <SText fontSize={14} bold color={COLOR_TEXT}>{compra.moneda} {MontoSeleccionado}</SText>
                                    </SView>
                                </SView>
                            </SView>
                            <SView width={160} style={{ alignItems: 'flex-end' }}>
                                {this.botonEstado(compra.estado)}
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SHr h={16} />

                {/* Cuotas Pendientes Header */}
                <SView col={'xs-12'} style={{ paddingHorizontal: 16 }}>
                    <SText fontSize={16} bold color={COLOR_TEXT}>Cuotas Pendientes</SText>
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
                        {compra.cuotasDetalle.length > 0 ? (
                            compra.cuotasDetalle.map((cuota, index) => (
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