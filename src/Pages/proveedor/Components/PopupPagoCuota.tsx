import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SInput, SIcon, SHr } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
};
const _estiloBackgroundColor = STheme.color.success + '22';
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
            montoPagar: {},
            isLoading: false,
        };
    }
    Item = ({ cuota, index, onAjuste, compra }) => {
        const { montoPagar, isLoading } = this.state;
        const monedaSymbol = this.props.editObject?.moneda || 'S/';
        const montoInput = montoPagar[cuota.numero] || '';
        const isPaid = cuota.estado === 'Pagado';
        return (<>
            <SView col={"xs-12"} style={{ backgroundColor: _estiloBackgroundColor, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: STheme.color.success + '55', }}>
                <SView row border={"pink"} >
                    <SView width={70} row><SText fontSize={14} bold color={STheme.color.primary}>Cuota #{cuota.numero}</SText></SView>
                    <SView width={70} row   >
                        <SView width={64} center style={{ backgroundColor: cuota.estado === 'Pendiente' ? STheme.color.danger : "#107003ff", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <SText fontSize={10} bold color={STheme.color.text}>{cuota.estado}</SText>
                        </SView>
                    </SView>
                </SView>
                <SHr height={8} />
                <SView row center >
                    <SView flex row  >
                        <SText fontSize={12} color={STheme.color.primary}>Vencimiento: <SText color={STheme.color.primary}>{cuota.vencimiento}</SText></SText>
                    </SView>
                    <SView width={150} row style={{ justifyContent: 'flex-end' }} >
                        <SText fontSize={18} bold color={STheme.color.primary}>{monedaSymbol} {parseFloat(cuota.monto).toFixed(2)}</SText>
                    </SView>
                </SView>
                <SHr height={8} />
                <SView row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <SView flex row  >
                        {isPaid && (<SText fontSize={12} color={STheme.color.primary}>Pagado: <SText color={"#107003ff"}>{cuota.fechaPago}</SText></SText>)}
                    </SView>
                    {!isPaid && (
                        <SView row width={150} center >
                            <SView width={110} center  >
                                <SInput
                                    style={{ height: 36, color: "red", }}
                                    type="money2"
                                    placeholder={`${monedaSymbol} 0.00`}
                                    icon={<SIconApp name='Money' width={24} ></SIconApp>}
                                    value={montoInput}
                                    onChangeText={(value) => {
                                        const newValue = parseFloat(value || '0');
                                        if (newValue <= cuota.monto) {
                                            this.setState({
                                                montoPagar: { ...montoPagar, [cuota.numero]: value },
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
                                />
                            </SView>
                            <SView width={4} />
                            <SView width={36} height={36} center style={{ backgroundColor: STheme.color.primary + '22', borderRadius: 6 }} onPress={() => !isLoading && onAjuste(cuota)} >
                                <SIconApp name="Edit" fill={STheme.color.primary} />
                            </SView>
                        </SView>
                    )}
                </SView>
            </SView >
            <SHr height={12} />
        </>
        );
    };
    handlePagarDeuda = async (cuota) => {
        const { montoPagar, isLoading } = this.state;
        const monto = parseFloat(montoPagar[cuota.numero] || '0');
        if (isLoading) return;
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
            console.log(`Registrando pago: Compra ${this.props.editObject.id}, Cuota ${cuota.numero}, Monto ${monto}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock async call
            SNotification.send({
                title: 'Éxito',
                body: 'Pago registrado correctamente.',
                time: 3000,
                color: STheme.color.success,
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
            });
            this.setState({ isLoading: false });
        }
    };
    render() {
        const { editObject } = this.props;
        const compra = {
            id: editObject?.id || 101,
            descripcion: editObject?.descripcion || 'Productos de limpieza y mantenimiento',
            estado: editObject?.estado || 'Pendiente',
            fecha: editObject?.fecha || '2024-01-14',
            total: editObject?.total || 8500,
            cuotasDetalle: editObject?.cuotasDetalle || [
                { numero: 1, estado: 'Pagado', vencimiento: '2024-02-14', fechaPago: '2024-02-13', monto: 2833.33 },
                { numero: 2, estado: 'Pendiente', vencimiento: '2024-03-14', fechaPago: null, monto: 2833.33 },
                { numero: 3, estado: 'Pendiente', vencimiento: '2024-04-14', fechaPago: null, monto: 2833.34 },
            ],
            moneda: editObject?.moneda || 'S/', // Pass moneda from parent or default
        };
        return (
            <SView col={'xs-12'} style={{ backgroundColor: STheme.color.white }}>
                <SView
                    row
                    style={{
                        padding: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: STheme.color.white,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <SText fontSize={18} bold color={STheme.color.primary}>
                        Registro de Cuotas - Compra #{compra.id}
                    </SText>
                    <SView
                        width={24}
                        height={24}
                        onPress={this.props.onCancel}
                        style={{ opacity: 0.6 }}
                    >
                        <SIcon name="Close" fill={STheme.color.primary} />
                    </SView>
                </SView>
                <ScrollView style={{ maxHeight: '80vh' }}>
                    <SView col={'xs-12'} style={{ padding: 16, gap: 24 }}>
                        <SView
                            style={{
                                backgroundColor: STheme.color.success + '11',
                                borderRadius: 8,
                                padding: 16,
                            }}
                        >
                            <SText fontSize={14} bold color={STheme.color.primary} style={{ marginBottom: 12 }}>
                                Información de la Compra
                            </SText>
                            <SView row style={{ marginBottom: 12, gap: 16 }}>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.primary}>
                                        Descripción:
                                    </SText>
                                    <SText fontSize={14} color={STheme.color.primary}>
                                        {compra.descripcion}
                                    </SText>
                                </SView>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.primary}>
                                        Total:
                                    </SText>
                                    <SText fontSize={14} color={STheme.color.primary}>
                                        {compra.moneda} {compra.total.toFixed(2)}
                                    </SText>
                                </SView>
                            </SView>
                            <SView row style={{ gap: 16 }}>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.primary}>
                                        Fecha:
                                    </SText>
                                    <SText fontSize={14} color={STheme.color.primary}>
                                        {compra.fecha}
                                    </SText>
                                </SView>
                                <SView flex row>
                                    <SView width={50} row center>
                                        <SText fontSize={12} color={STheme.color.primary}>Estado:</SText>
                                    </SView>
                                    <SView width={70} row center>
                                        <SView width={64} center style={{ backgroundColor: compra.estado === 'Pendiente' ? STheme.color.danger : STheme.color.success, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
                                            {}
                                            <SText fontSize={10} bold color={STheme.color.text}>{compra.estado}</SText>
                                        </SView>
                                    </SView>
                                    {/* <SView
                                        style={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 4,
                                            backgroundColor: compra.estado === 'Pendiente' ? STheme.color.danger + '33' : STheme.color.success + '33',
                                        }}
                                    >
                                        <SText fontSize={12} color={compra.estado === 'Pendiente' ? STheme.color.danger : STheme.color.success}>
                                            {compra.estado}
                                        </SText>
                                    </SView> */}
                                </SView>
                            </SView>
                        </SView>
                        <SView>
                            <SText fontSize={14} bold color={STheme.color.primary}>Cuotas de Pago</SText>
                            <SHr height={8} />
                            {compra.cuotasDetalle.length > 0 ? (
                                compra.cuotasDetalle.map((cuota, index) => (
                                    <this.Item
                                        key={cuota.numero}
                                        cuota={cuota}
                                        index={index}
                                        compra={compra}
                                        onAjuste={this.handlePagarDeuda}
                                    />
                                ))
                            ) : (
                                <SText fontSize={14} color={STheme.color.primary} style={{ padding: 16 }}>No hay cuotas asociadas a esta compra.</SText>
                            )}
                        </SView>
                    </SView>
                </ScrollView>
            </SView>
        );
    }
}