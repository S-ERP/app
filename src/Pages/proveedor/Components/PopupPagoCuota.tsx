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
const COLOR_VERDE_CLARO = "#d8edd8";
const COLOR_VERDE_OSCURO = "#107003ff";
const COLOR_NARANJA = "#FF9800";
const COLOR_NARANJA_CLARO = "#eaf4d8";
const COLOR_ROJO = "#F44336";
const COLOR_ROJO_CLARO = "#ece3dd";
const COLOR_ROJO_OSCURO = "#d93145";
const COLOR_GRIS = "#9E9E9E";

const _estiloBackgroundColor = STheme.color.success + '22';


export default class PopupPagoCuota extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: 'PopupPagoCuota',
            content: (
                <SView
                    style={{
                        // Dimensiones
                        width: "100%",
                        maxWidth: 500,
                        maxHeight: "100%",

                        // Layout
                        padding: 4,
                        overflow: 'hidden',

                        // Estilo visual
                        backgroundColor: STheme.color.background,
                        borderColor: STheme.color.background + '33',
                        borderWidth: 1,
                        borderRadius: 8,
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
        const { montoPagar, isLoading } = this.state as any;
        const monedaSymbol = this.props.editObject?.moneda || 'S/';
        const montoInput = montoPagar[cuota.numero] || '';
        const isPaid = cuota.estado === 'Pagado';

        return (
            <>
                <SView
                    col={"xs-12"}
                    style={{
                        backgroundColor: STheme.color.card,
                        borderRadius: 8,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: STheme.color.success + '55',
                    }}
                >
                    <SView row>
                        <SView width={70} row>
                            <SText fontSize={14} bold color={STheme.color.text}>
                                Cuota #{cuota.numero}
                            </SText>
                        </SView>
                        <SView width={70} row>
                            <SView
                                width={64} center
                                style={{
                                    backgroundColor: cuota.estado === 'Pendiente' ? STheme.color.danger : "#107003ff",
                                    borderRadius: 4,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                }}
                            >
                                <SText fontSize={10} bold color={STheme.color.text}>
                                    {cuota.estado}
                                </SText>
                            </SView>
                        </SView>
                    </SView>

                    <SHr height={8} />

                    <SView row center>
                        <SView flex row>
                            <SText fontSize={12} color={STheme.color.text}>
                                Vencimiento:{' '}
                                <SText color={STheme.color.text}>{cuota.vencimiento}</SText>
                            </SText>
                        </SView>
                        <SView width={150} row style={{ justifyContent: 'flex-end' }}>
                            <SText fontSize={18} bold color={STheme.color.text}>
                                {monedaSymbol} {parseFloat(cuota.monto).toFixed(2)}
                            </SText>
                        </SView>
                    </SView>

                    <SHr height={8} />

                    <SView
                        row
                        style={{ justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <SView flex row>
                            {isPaid && (
                                <SText fontSize={12} color={STheme.color.text}>
                                    Pagado:{' '}
                                    <SText color={"#107003ff"}>{cuota.fechaPago}</SText>
                                </SText>
                            )}
                        </SView>
                        {!isPaid && (
                            <SView row width={150} center>
                                <SView width={110} center>
                                    <SInput
                                        style={{ height: 36, color: "red" }}
                                        type="money2"
                                        placeholder={`${monedaSymbol} 0.00`}
                                        icon={<SIconApp name="Money" width={24} />}
                                        value={montoInput}
                                        onChangeText={(value) => {
                                            const newValue = parseFloat(value || '0');
                                            if (newValue <= cuota.monto) {
                                                this.setState({
                                                    montoPagar: {
                                                        ...montoPagar,
                                                        [cuota.numero]: value,
                                                    },
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
                                <SView
                                    width={36}
                                    height={36}
                                    center
                                    style={{
                                        backgroundColor: STheme.color.text + '22',
                                        borderRadius: 6,
                                    }}
                                    onPress={() => !isLoading && onAjuste(cuota)}
                                >
                                    <SIconApp name="Edit" fill={STheme.color.text} />
                                </SView>
                            </SView>
                        )}
                    </SView>
                </SView>
                <SHr height={12} />
            </>
        );
    };

    handlePagarDeuda = async (cuota) => {
        const { montoPagar, isLoading } = this.state as any;
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
            console.log(
                `Registrando pago: Compra ${this.props.editObject.id}, Cuota ${cuota.numero}, Monto ${monto}`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock async call
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
            moneda: editObject?.moneda || 'S/',
        };

        return (
            <SView col={"xs-12"}>
                <SView row center>

                    <SView col={"xs-12"} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: STheme.color.white, alignItems: 'center' }} row >
                        <SView flex border={"blue"}  >
                            <SText fontSize={18} bold color={STheme.color.text}>Registro de Cuotas - Compra #{compra.id}</SText>
                        </SView>
                        <SView width={50} style={{ alignItems: "flex-end", }} border={"red"} >
                            <SView width={24} height={24} onPress={this.props.onCancel} style={{ opacity: 0.6 }} >
                                <SIcon name="Close" fill={STheme.color.text} />
                            </SView>
                        </SView>
                    </SView>
                    <SHr height={16} />


                    <SView col={"xs-12"} style={{ padding: 8 }} center>
                        <SView col={"xs-12"} padding={16} style={{ backgroundColor: STheme.color.card, borderRadius: 8 }}  >
                            <SView row  >
                                <SText fontSize={14} bold color={STheme.color.text}   > Información de la Compra </SText>
                            </SView>
                            <SHr height={16} />
                            <SView row  >
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.text}>Descripción:</SText>
                                    <SText fontSize={14} color={STheme.color.text}>{compra.descripcion}</SText>
                                </SView>
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.text}>Total:</SText>
                                    <SText fontSize={14} color={STheme.color.text}>{compra.moneda} {compra.total.toFixed(2)}</SText>
                                </SView>
                            </SView>
                            <SHr height={16} />
                            <SView row  >
                                <SView flex>
                                    <SText fontSize={12} color={STheme.color.text}>Fecha:</SText>
                                    <SText fontSize={14} color={STheme.color.text}>{compra.fecha}</SText>
                                </SView>

                                <SView flex row border={"yellow"} >
                                    <SView width={50} row border={"blue"}>
                                        <SText center fontSize={12} color={STheme.color.text}>Estado:</SText>
                                    </SView>
                                    <SView width={70} row center border={"pink"}>
                                        <SView width={64} center
                                            style={{
                                                backgroundColor: compra.estado === 'Pendiente' ? COLOR_ROJO_OSCURO : COLOR_VERDE_OSCURO,
                                                borderRadius: 2, paddingVertical: 2
                                            }}
                                        >
                                            <SText fontSize={10} bold color={STheme.color.text}>{compra.estado} </SText>
                                        </SView>
                                    </SView>
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                    <SHr height={16} />

                    {/* Body */}
                    <ScrollView style={{ maxHeight: '70vh' }}>


                        <SView col={"xs-12"} style={{ padding: 8 }}>
                            {/* Info de la compra */}




                            {/* Cuotas */}
                            <SView>
                                <SText fontSize={14} bold color={STheme.color.text}> Cuotas de Pago </SText>

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
                                ) : (<SText  fontSize={14} color={STheme.color.text} style={{ padding: 16 }} > No hay cuotas asociadas a esta compra. </SText>)}
                            </SView>
                        </SView>


                    </ScrollView>
                </SView>
            </SView>
        );
    }
}
