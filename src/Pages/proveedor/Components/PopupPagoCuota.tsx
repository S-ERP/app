import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SImage, SInput, SHr, SIcon } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';
// import Btn from './Btn';
// import SIconApp from '../../../Assets/SIconApp';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
}



export default class PopupPagoCuota extends Component<Props> {




    static open(props: Props) {
        SPopup.open({
            key: 'PopupPagoCuota',
            content: (
                <SView
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        width: 500,
                        borderRadius: 16,
                        borderColor: STheme.color.card + '33',
                        borderWidth: 1,
                        backgroundColor: STheme.color.background,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                    }}
                    withoutFeedback
                >
                    <PopupPagoCuota
                        {...props}
                        onCancel={() => {
                            SPopup.close('PopupPagoCuota');
                            if (props.onCancel) props.onCancel();
                        }}
                        onSuccess={(e: any) => {
                            SPopup.close('PopupPagoCuota');
                            if (props.onSuccess) props.onSuccess(e);
                        }}
                    />
                </SView>
            ),
        });
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            montoPagar: {}, // Stores payment amounts for each installment
            isLoading: false, // Handles loading state for payments
        };
    }

    // Component for each installment (cuota)
    Item = ({ cuota, index, onAjuste, compra }) => {
        const { montoPagar } = this.state;
        const monedaSymbol = compra?.caja?.monedaSymbol || 'S/';
        const montoInput = montoPagar[cuota.key] || 0;
        const isPaid = cuota.estado === 'Pagado';

        return (
            <SView
                style={{
                    backgroundColor: STheme.color.success + '22',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: STheme.color.success + '33',
                }}
            >
                <SView row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                    <SText fontSize={14} fontWeight="bold" color={STheme.color.text}>
                        Cuota #{index + 1}
                    </SText>
                    <SView
                        style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 999,
                            backgroundColor: isPaid ? STheme.color.success + '33' : STheme.color.danger + '33',
                        }}
                    >
                        <SText fontSize={12} color={isPaid ? STheme.color.success : STheme.color.danger}>
                            {cuota.estado}
                        </SText>
                    </SView>
                </SView>
                <SView style={{ marginBottom: 8 }}>
                    <SText fontSize={12} color={STheme.color.lightGray}>
                        Vencimiento: <SText color={STheme.color.text}>{cuota.vencimiento}</SText>
                    </SText>
                    {isPaid && (
                        <SText fontSize={12} color={STheme.color.lightGray}>
                            Pagado: <SText color={STheme.color.success}>{cuota.fecha_pago}</SText>
                        </SText>
                    )}
                </SView>
                <SView row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <SText fontSize={18} fontWeight="bold" color={STheme.color.text}>
                        {monedaSymbol} {parseFloat(cuota.monto).toFixed(2)}
                    </SText>
                    {!isPaid && (
                        <SView row>
                            <SInput
                                type="money2"
                                placeholder={`${monedaSymbol} 0.00`}
                                value={montoInput > 0 ? montoInput.toString() : ''}
                                onChangeText={(value) => {
                                    const newValue = parseFloat(value || '0');
                                    if (newValue <= cuota.monto) {
                                        this.setState({
                                            montoPagar: { ...montoPagar, [cuota.key]: newValue },
                                        });
                                    } else {
                                        SNotification.send({
                                            title: 'Advertencia',
                                            body: `El monto no puede superar ${monedaSymbol} ${cuota.monto.toFixed(2)}.`,
                                            time: 3000,
                                            color: STheme.color.warning,
                                        });
                                    }
                                }}
                                style={{ width: 100, marginRight: 8 }}
                            />
                            <SView
                                width={24}
                                height={24}
                                center
                                style={{ backgroundColor: STheme.color.primary + '22', borderRadius: 6 }}
                                onPress={() => onAjuste(cuota)}
                            >
                                <SIconApp name="Edit" fill={STheme.color.primary} />
                            </SView>
                        </SView>
                    )}
                </SView>
            </SView>
        );
    };

    // Handle payment submission
    handlePagarDeuda = async (cuota) => {
        const { montoPagar } = this.state;
        const monto = parseFloat(montoPagar[cuota.key] || 0);

        if (this.state.isLoading) return;

        if (monto <= 0) {
            SNotification.send({
                title: 'Error',
                body: 'El monto a pagar debe ser mayor a 0.',
                time: 3000,
                color: STheme.color.danger,
            });
            return;
        }

        if (monto > cuota.monto) {
            SNotification.send({
                title: 'Error',
                body: `El monto no puede exceder ${cuota.monto.toFixed(2)}.`,
                time: 3000,
                color: STheme.color.danger,
            });
            return;
        }

        this.setState({ isLoading: true });

        try {
            const response = await MDL.compra_venta.registrarPago({
                key_compra: this.props.editObject.key,
                key_cuota: cuota.key,
                monto: monto,
                key_empresa: this.props.key_empresa,
                key_usuario: MDL.usuario.session?.key,
            });

            SNotification.send({
                title: 'Éxito',
                body: 'Pago registrado correctamente.',
                time: 3000,
                color: STheme.color.success,
            });

            const newMontoPagar = { ...montoPagar };
            delete newMontoPagar[cuota.key];
            this.setState({ montoPagar: newMontoPagar, isLoading: false });

            if (this.props.onSuccess) {
                this.props.onSuccess(response);
            }
        } catch (error) {
            console.error('Error al registrar el pago:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo registrar el pago.',
                time: 3000,
                color: STheme.color.danger,
            });
            this.setState({ isLoading: false });
        }
    };

    render() {
        const { editObject } = this.props;
        const compra = {
            descripcion: editObject?.descripcion || 'Productos de limpieza y mantenimiento',
            estado: editObject?.estado || 'Pendiente',
            fecha: editObject?.fecha || '14/1/2024',
            total: editObject?.total || 8500,
            cuotas: editObject?.cuotas || [
                { key: 'cuota1', estado: 'Pagado', vencimiento: '14/2/2024', fecha_pago: '13/2/2024', monto: 2833.33 },
                { key: 'cuota2', estado: 'Pagado', vencimiento: '14/3/2024', fecha_pago: '15/3/2024', monto: 2833.33 },
                { key: 'cuota3', estado: 'Pendiente', vencimiento: '14/4/2024', monto: 2833.34 },
            ],
        };
        const monedaSymbol = editObject?.caja?.monedaSymbol || 'S/';

        return (
            <SView col={'xs-12'} style={{ backgroundColor: STheme.color.background }}>
                {/* Modal Header */}
                <SView
                    row
                    style={{
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: STheme.color.lightGray + '33',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <SText fontSize={18} fontWeight="bold" color={STheme.color.text}>
                        Registro de Cuotas - Compra #{editObject?.id || 101}
                    </SText>
                    <SView
                        width={24}
                        height={24}
                        onPress={this.props.onCancel}
                        style={{ opacity: 0.6 }}
                    >
                        <SIcon name="Close" fill={STheme.color.text} />
                    </SView>
                </SView>

                {/* Modal Body */}
                <ScrollView style={{ maxHeight: '80vh' }}>
                    <SView col={'xs-12'} style={{ padding: 16, gap: 24 }}>
                        {/* Purchase Information */}
                        <SView
                            style={{
                                backgroundColor: STheme.color.success + '11',
                                borderRadius: 8,
                                padding: 16,
                            }}
                        >
                            <SText fontSize={14} fontWeight="bold" color={STheme.color.text} style={{ marginBottom: 12 }}>
                                Información de la Compra
                            </SText>
                            <SView row style={{ marginBottom: 12, gap: 16 }}>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.lightGray}>
                                        Descripción:
                                    </SText>
                                    <SText fontSize={14} color={STheme.color.text}>
                                        {compra.descripcion}
                                    </SText>
                                </SView>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.lightGray}>
                                        Total:
                                    </SText>
                                    <SText fontSize={14} color={STheme.color.text}>
                                        {monedaSymbol} {compra.total.toFixed(2)}
                                    </SText>
                                </SView>
                            </SView>
                            <SView row style={{ gap: 16 }}>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.lightGray}>
                                        Fecha:
                                    </SText>
                                    <SText fontSize={14} color={STheme.color.text}>
                                        {compra.fecha}
                                    </SText>
                                </SView>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.lightGray}>
                                        Estado:
                                    </SText>
                                    <SView
                                        style={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 999,
                                            backgroundColor: compra.estado === 'Pendiente' ? STheme.color.danger + '33' : STheme.color.success + '33',
                                        }}
                                    >
                                        <SText fontSize={12} color={compra.estado === 'Pendiente' ? STheme.color.danger : STheme.color.success}>
                                            {compra.estado}
                                        </SText>
                                    </SView>
                                </SView>
                            </SView>
                        </SView>

                        {/* Installments (Cuotas) */}
                        <SView>
                            <SText fontSize={14} fontWeight="bold" color={STheme.color.text} style={{ marginBottom: 12 }}>
                                Cuotas de Pago
                            </SText>
                            {compra.cuotas.length > 0 ? (
                                compra.cuotas.map((cuota, index) => (
                                    <this.Item
                                        key={cuota.key}
                                        cuota={cuota}
                                        index={index}
                                        compra={compra}
                                        onAjuste={this.handlePagarDeuda}
                                    />
                                ))
                            ) : (
                                <SText fontSize={14} color={STheme.color.lightGray} style={{ padding: 16 }}>
                                    No hay cuotas asociadas a esta compra.
                                </SText>
                            )}
                        </SView>
                    </SView>
                </ScrollView>
            </SView>
        );
    }
}