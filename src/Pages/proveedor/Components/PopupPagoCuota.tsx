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
                        width: "100%",
                        maxWidth: 500,
                        maxHeight: "100%",
                        padding: 4,
                        overflow: 'hidden',
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
                <SView col={"xs-12"}
                    style={{
                        backgroundColor: cuota.__select ? STheme.color.card : STheme.color.lightGray + "55",
                        borderRadius: 8,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: cuota.__select ? STheme.color.success : STheme.color.success + '55',
                    }}
                    onPress={() => {
                        cuota.__select = !cuota.__select
                        this.forceUpdate()
                    }}
                >
                    <SView row>
                        <SView flex row>
                            <SView width={70} row>
                                <SText fontSize={14} bold color={STheme.color.text}>
                                    Cuota #{cuota.numero}
                                </SText>
                            </SView>
                            {this.labelEstado(cuota.estado)}
                        </SView>
                        <SView flex>
                            <SView row style={{ justifyContent: 'space-between', alignItems: 'center' }} >
                                <SView flex row> {isPaid ?
                                    (<SText fontSize={12} color={STheme.color.text}>Pagado: <SText color={STheme.color.success} bold>{cuota.fechaPago}</SText></SText>) :
                                    (<SText fontSize={12} color={STheme.color.text}>Mora: <SText color={STheme.color.warning} bold>{cuota.vencimiento}</SText></SText>)}
                                </SView>
                                {this.labelEstado2(cuota.estado)}
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
                    <SView row style={{ justifyContent: 'space-between', alignItems: 'center' }} >
                        <SView flex row> {isPaid ?
                            (<SText fontSize={12} color={STheme.color.text}>Pagado: <SText color={STheme.color.success} bold>{cuota.fechaPago}</SText></SText>) :
                            (<SText fontSize={12} color={STheme.color.text}>Mora: <SText color={STheme.color.warning} bold>{cuota.vencimiento}</SText></SText>)}
                        </SView>
                        {this.labelEstado2(cuota.estado)}
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
    labelEstado(estado: any) {
        const estadoNormalizado = estado?.toLowerCase();
        const backgroundColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_OSCURO : COLOR_VERDE_OSCURO;
        const texto = estadoNormalizado === 'pendiente' ? 'Pendiente' : 'Pagado';
        return (
            <SView width={70} row center border={"pink"}>
                <SView
                    width={64}
                    center
                    style={{
                        backgroundColor,
                        borderRadius: 2,
                        paddingVertical: 2,
                    }}
                >
                    <SText fontSize={10} bold color={STheme.color.text}>
                        {texto}
                    </SText>
                </SView>
            </SView>
        );
    }
    labelEstado2(estado: any) {
        const estadoNormalizado = estado?.toLowerCase();
        const backgroundColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_CLARO : COLOR_VERDE_CLARO;
        const textoColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_OSCURO : COLOR_VERDE_OSCURO;
        const texto = estadoNormalizado === 'pendiente' ? 'Pendiente' : 'Pagado';
        const icono = estadoNormalizado === 'pendiente' ? 'revertir' : 'tareaclose';
        return (
            <SView width={84} row center>
                <SView row width={80} center style={{ backgroundColor, borderRadius: 2, padding: 2 }}>
                    <SView row>
                        <SView width={18}>
                            <SIconApp name={icono} fill={textoColor} width={14} stroke={backgroundColor} />
                        </SView>
                        <SView width={4} />
                        <SView flex>
                            <SText fontSize={10} color={textoColor}>{texto}</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }
    botonEstado(estado: any) {
        const estadoNormalizado = estado?.toLowerCase();
        if (estadoNormalizado !== 'pendiente') return null;
        const backgroundColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_CLARO : COLOR_VERDE_CLARO;
        const textoColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_OSCURO : COLOR_VERDE_OSCURO;
        const texto = estadoNormalizado === 'pendiente' ? 'Pagar Ahora' : 'Editar';
        const icono = estadoNormalizado === 'pendiente' ? 'pagotarjeta' : 'Pencil';
        return (
            <SView width={160} row center >
                <SView row width={150} center style={{ backgroundColor: COLOR_ROJO_OSCURO, borderRadius: 2, padding: 4 }}>
                    <SView row>
                        <SView width={18}>
                            <SIconApp name={icono} fill={STheme.color.text} width={14} stroke={backgroundColor} />
                        </SView>
                        <SView width={4} />
                        <SView flex>
                            <SText fontSize={16} color={STheme.color.text}>{texto}</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }
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
        const MontoSaldo = "aqui hacer la operacion para luego ,mostrar";
        const MontoSeleccionado = (compra.cuotasDetalle.filter(a => !!a.__select).reduce((sum, line) => sum + line.monto, 0)).toFixed(2);
        return (
            <SView col={"xs-12"}>
                <SView row center>
                    <SView col={"xs-12"} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: STheme.color.white, alignItems: 'center' }} row >
                        <SView flex    >
                            <SText fontSize={18} bold color={STheme.color.text}>Registro de Cuotas - Compra #{compra.id}</SText>
                        </SView>
                        <SView width={50} style={{ alignItems: "flex-end", }}  >
                            <SView width={24} height={24} onPress={this.props.onCancel} style={{ opacity: 0.6 }} >
                                <SIcon name="Close" fill={STheme.color.text} />
                            </SView>
                        </SView>
                    </SView>
                    <SHr height={16} />
                    <SView col={"xs-12"} style={{ padding: 8 }} center>
                        <SView col={"xs-12"} padding={16} style={{ backgroundColor: STheme.color.lightGray + "44", borderRadius: 8 }}  >



                            <SText fontSize={14} bold color={STheme.color.text}   >Información de la Compra </SText>

                            <SView col={"xs-12"} row  >
                                <SView flex>

                                    <SHr height={8} />
                                    <SText fontSize={12} color={STheme.color.text}>Descripción:</SText>
                                    <SText fontSize={14} color={STheme.color.text}>{compra.descripcion}  </SText>

                                    <SHr height={8} />
                                    <SText fontSize={12} color={STheme.color.text}>Total:</SText>
                                    <SText fontSize={14} color={STheme.color.text}>{compra.moneda} {compra.total.toFixed(2)}</SText>

                                    <SHr height={8} />
                                    <SText fontSize={12} color={STheme.color.text}>Fecha:</SText>
                                    <SText fontSize={14} color={STheme.color.text}>{compra.fecha}</SText>

                                    <SHr height={8} />

                                    <SText fontSize={12} color={STheme.color.text}>Estado : {this.labelEstado(compra.estado)} </SText>


                                    <SHr height={8} />

                                    <SView col={"xs-12"} row  >
                                        <SView col={"xs-6"} row  >
                                            <SText fontSize={12} color={STheme.color.text}>Saldo:</SText>
                                            {/* <SText>Monto: {MontoSaldo} </SText> */}
                                        </SView>

                                        <SView col={"xs-6"} row  >
                                            <SText fontSize={12} color={STheme.color.text}>Total a pagar:</SText>
                                            <SText>Monto: {MontoSeleccionado}</SText>
                                        </SView>
                                    </SView>
                                </SView>
                                <SView width={200} backgroundColor='blue'  >
                                    <SView style={{ alignItems: "flex-end" }}   >
                                        {this.botonEstado(compra.estado)}
                                    </SView>
                                </SView>
                            </SView>


                        </SView>
                    </SView>
                    <SHr height={8} />



                    <SView col={"xs-12"} style={{ paddingHorizontal: 8 }}  >
                        <SText fontSize={14} bold color={STheme.color.text}> Cuotas de Pago </SText>
                    </SView>
                    <SHr height={8} />

                    <ScrollView style={{ maxHeight: '70vh' }}>
                        <SView col={"xs-12"} style={{ paddingHorizontal: 8 }}>

                            <SView>
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
                                ) : (<SText center fontSize={14} color={STheme.color.text} style={{ padding: 16 }} > No hay cuotas asociadas a esta compra. </SText>)}
                                <SHr height={8} />
                            </SView>
                        </SView>
                    </ScrollView>
                </SView>
            </SView>
        );
    }
}
