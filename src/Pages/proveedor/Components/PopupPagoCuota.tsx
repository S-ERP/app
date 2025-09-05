import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SIcon, SHr } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import PageAbstract from 'servisofts-page/PageAbstract';

type Props = {
    key_empresa: string,
    editObject?: any,
    onCancel?: Function,
    onSuccess?: Function,
};

const COLOR_VERDE_CLARO = "#d8edd8";
const COLOR_VERDE_OSCURO = "#107003ff";
const COLOR_ROJO_CLARO = "#ece3dd";
const COLOR_ROJO_OSCURO = "#d93145";

export default class PopupPagoCuota extends Component<Props> {
    // Método estático para abrir el popup
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
                    closeOnTouchOutside
                    accessibilityLabel="Popup de gestión de cuotas"
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

    // Constructor y estado inicial
    constructor(props: Props) {
        super(props);
        this.state = {
            montoPagar: {},
            isLoading: false,
        };
        // Inicializar __select en false para todas las cuotas
        if (this.props.editObject?.cuotasDetalle) {
            this.props.editObject.cuotasDetalle.forEach((cuota) => {
                cuota.__select = false;
            });
        }
    }

    // Obtener datos de la compra
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
                { numero: 4, estado: 'Pendiente', vencimiento: '2025-01-14', fechaPago: null, monto: 2833.34 }, // Cuota posterior añadida
            ],
            moneda: editObject?.moneda || 'S/',
        };
    };

    // Seleccionar cuotas no pagadas con fechas menores o iguales y desmarcar posteriores
    selectPreviousCuotas = (selectedCuota) => {
        const compra = this.getCompraData();
        const selectedDate = new Date(selectedCuota.vencimiento);

        // Marcar como seleccionadas las cuotas no pagadas hasta la fecha seleccionada
        // y desmarcar las posteriores
        compra.cuotasDetalle.forEach((cuota) => {
            if (cuota.estado !== 'Pagado') {
                const cuotaDate = new Date(cuota.vencimiento);
                if (cuotaDate <= selectedDate) {
                    cuota.__select = true;
                } else {
                    cuota.__select = false;
                }
            }
        });

        this.forceUpdate();
    };

    // Desmarcar cuotas no pagadas con fechas menores o iguales
    deselectPreviousCuotas = (selectedCuota) => {
        const compra = this.getCompraData();
        const selectedDate = new Date(selectedCuota.vencimiento);

        // Desmarcar todas las cuotas no pagadas hasta la fecha seleccionada
        compra.cuotasDetalle.forEach((cuota) => {
            if (cuota.estado !== 'Pagado') {
                const cuotaDate = new Date(cuota.vencimiento);
                if (cuotaDate <= selectedDate) {
                    cuota.__select = false;
                }
            }
        });

        this.forceUpdate();
    };

    // Manejar el pago de una cuota
    handlePagarDeuda = async (cuota) => {
        const { montoPagar, isLoading } = this.state as any;
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
                `Registrando pago: Compra ${this.props.editObject.id}, Cuota ${cuota.numero}, Monto ${monto}`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock async call
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
            // Opcional: Navegar a PageAbstract con las cuotas seleccionadas
            const compra = this.getCompraData();
            const selectedCuotas = compra.cuotasDetalle.filter((c) => c.__select && c.estado !== 'Pagado');
            // PageAbstract.navigateToSomePage({ selectedCuotas }); // Descomentar si es necesario
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

    // Componente para renderizar cada cuota
    Item = ({ cuota, index, onAjuste, compra }) => {
        const { isLoading } = this.state as any;
        const monedaSymbol = this.props.editObject?.moneda || 'S/';
        const isPaid = cuota.estado === 'Pagado';

        return (
            <SView
                key={`cuota-${cuota.numero}`}
                col={'xs-12'}
                style={{
                    backgroundColor: cuota.__select ? STheme.color.card : STheme.color.lightGray + '55',
                    borderRadius: 8,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: cuota.__select ? STheme.color.success : STheme.color.success + '55',
                }}
                onPress={() => {
                    if (!isPaid) {
                        if (cuota.__select) {
                            // Si ya está seleccionada, desmarcar todas las cuotas hasta esta fecha
                            this.deselectPreviousCuotas(cuota);
                        } else {
                            // Marcar la cuota y seleccionar cuotas anteriores, desmarcando posteriores
                            cuota.__select = true;
                            this.selectPreviousCuotas(cuota);
                        }
                    }
                }}
                accessibilityLabel={`Cuota ${cuota.numero} - ${cuota.estado}`}
                activeOpacity={0.7}
            >
                <SView row>
                    <SView flex row>
                        <SView width={70} row backgroundColor=''>
                            <SText fontSize={14} bold color={STheme.color.text}>
                                Cuota #{cuota.numero}
                            </SText>
                        </SView>
                        {this.labelEstado(cuota.estado)}
                    </SView>
                    <SView flex style={{ alignItems: "flex-end" }}>
                        {this.labelEstado2(cuota.estado)}
                    </SView>
                </SView>
                <SHr height={8} />
                <SView row center>
                    <SView flex row>
                        <SText fontSize={12} color={STheme.color.text} accessibilityLabel={`Vencimiento cuota ${cuota.numero}`}>
                            Vencimiento: <SText>{cuota.vencimiento}</SText>
                        </SText>
                    </SView>
                    <SView width={150} row style={{ justifyContent: 'flex-end' }}>
                        <SText fontSize={18} bold color={STheme.color.text}>
                            {monedaSymbol} {parseFloat(cuota.monto).toFixed(2)}
                        </SText>
                    </SView>
                </SView>
                {isPaid && (
                    <SView row style={{ justifyContent: 'flex-start' }}>
                        <SText fontSize={12} color={STheme.color.text}>
                            Pagado: <SText color={STheme.color.success} bold>{cuota.fechaPago}</SText>
                        </SText>
                    </SView>
                )}
                {!isPaid && (
                    <>
                        <SView row style={{ justifyContent: 'flex-start' }}>
                            <SText fontSize={12} color={STheme.color.text}>

                                {/* la idea es poner que la fecha se paso o esta en mora, dame consejos para que se vea mejor */}

                                que me sugieres: <SText color={STheme.color.warning} bold>{cuota.fechaPago}</SText>
                            </SText>
                        </SView>
                    </>
                )}
                <SHr height={12} />
            </SView>
        );
    };

    // Etiqueta de estado simple
    labelEstado = (estado: any) => {
        const estadoNormalizado = estado?.toLowerCase();
        const backgroundColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_OSCURO : COLOR_VERDE_OSCURO;
        const texto = estadoNormalizado === 'pendiente' ? 'Pendiente' : 'Pagado';
        return (
            <SView
                width={70}
                row
                center
                accessibilityLabel={`Estado: ${texto}`}
            >
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
    };

    // Etiqueta de estado con ícono
    labelEstado2 = (estado: any) => {
        const estadoNormalizado = estado?.toLowerCase();
        const backgroundColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_CLARO : COLOR_VERDE_CLARO;
        const textoColor = estadoNormalizado === 'pendiente' ? COLOR_ROJO_OSCURO : COLOR_VERDE_OSCURO;
        const texto = estadoNormalizado === 'pendiente' ? 'Pendiente' : 'Pagado';
        const icono = estadoNormalizado === 'pendiente' ? 'revertir' : 'tareaclose';
        return (
            <SView
                width={84}
                row
                center
                accessibilityLabel={`Estado: ${texto}`}
            >
                <SView
                    row
                    width={80}
                    center
                    style={{ backgroundColor, borderRadius: 2, padding: 2 }}
                >
                    <SView row>
                        <SView width={18}>
                            <SIconApp
                                name={icono}
                                fill={textoColor}
                                width={14}
                                height={14}
                                stroke={backgroundColor}
                            />
                        </SView>
                        <SView width={4} />
                        <SView flex>
                            <SText fontSize={10} color={textoColor}>{texto}</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    };

    // Botón para pagar la compra completa
    botonEstado = (estado: any) => {
        const estadoNormalizado = estado?.toLowerCase();
        if (estadoNormalizado !== 'pendiente') return null;
        const texto = 'Pagar Ahora';
        return (
            <SView
                width={160}
                row
                center
                onPress={() => {
                    const compra = this.getCompraData();
                    const selectedCuotas = compra.cuotasDetalle.filter((c) => c.__select && c.estado !== 'Pagado');
                    if (selectedCuotas.length > 0) {
                        this.handlePagarDeuda(selectedCuotas[0]); // Pagar la primera cuota seleccionada como ejemplo
                    }
                }}
                activeOpacity={0.7}
                accessibilityLabel="Pagar compra completa"
            >
                <SView
                    row
                    width={150}
                    center
                    style={{ backgroundColor: COLOR_ROJO_OSCURO, borderRadius: 2, padding: 4 }}
                >
                    <SView row>
                        <SView width={18}>
                            <SIconApp
                                name={'pagotarjeta'}
                                fill={STheme.color.text}
                                width={14}
                                height={14}
                                stroke={COLOR_ROJO_CLARO}
                            />
                        </SView>
                        <SView width={4} />
                        <SView flex>
                            <SText fontSize={16} color={STheme.color.text}>{texto}</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    };

    // Método principal de renderizado
    render() {
        const compra = this.getCompraData();

        // Calcular MontoSeleccionado: suma de montos de cuotas seleccionadas y no pagadas
        const MontoSeleccionado = compra.cuotasDetalle
            .filter((cuota) => cuota.__select && cuota.estado !== 'Pagado')
            .reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0)
            .toFixed(2);

        // Calcular MontoSaldo: suma de montos de cuotas no pagadas
        const MontoSaldo = compra.cuotasDetalle
            .filter((cuota) => cuota.estado !== 'Pagado')
            .reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0)
            .toFixed(2);

        return (
            <SView col={'xs-12'} accessibilityLabel="Contenedor principal de gestión de cuotas">
                <SView row center>
                    <SView
                        col={'xs-12'}
                        style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: STheme.color.white, alignItems: 'center' }}
                        row
                    >
                        <SView flex>
                            <SText
                                fontSize={18}
                                bold
                                color={STheme.color.text}
                                accessibilityLabel="Título de gestión de cuotas"
                            >
                                Gestión de Cuotas - Compra #{compra.id}
                            </SText>
                        </SView>
                        <SView width={50} style={{ alignItems: 'flex-end' }}>
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
                    <SHr height={16} />
                    <SView col={'xs-12'} style={{ padding: 8 }} center>
                        <SView
                            col={'xs-12'}
                            padding={16}
                            style={{ backgroundColor: STheme.color.lightGray + '44', borderRadius: 8 }}
                            accessibilityLabel="Detalles de la compra"
                        >
                            <SText fontSize={14} bold color={STheme.color.text}>
                                Detalles de la Compra
                            </SText>
                            <SView col={'xs-12'} row>
                                <SView flex>
                                    <SHr height={8} />
                                    <SView col={'xs-12'} row  >

                                        <SText fontSize={12} color={STheme.color.text}>
                                            Descripción:
                                        </SText>
                                    </SView>
                                    <SText
                                        fontSize={14}
                                        color={STheme.color.text}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                        accessibilityLabel="Descripción de la compra"
                                    >
                                        {compra.descripcion}
                                    </SText>
                                    <SHr height={8} />
                                    <SText fontSize={12} color={STheme.color.text}>
                                        Total:
                                    </SText>
                                    <SText
                                        fontSize={14}
                                        color={STheme.color.text}
                                        accessibilityLabel="Total de la compra"
                                    >
                                        {compra.moneda} {compra.total.toFixed(2)}
                                    </SText>
                                    <SHr height={8} />
                                    <SText fontSize={12} color={STheme.color.text}>
                                        Fecha:
                                    </SText>
                                    <SText
                                        fontSize={14}
                                        color={STheme.color.text}
                                        accessibilityLabel="Fecha de la compra"
                                    >
                                        {compra.fecha}
                                    </SText>
                                    <SHr height={8} />
                                    <SText fontSize={12} color={STheme.color.text}>
                                        Estado: {this.labelEstado(compra.estado)}
                                    </SText>
                                    <SHr height={8} />
                                    <SView col={'xs-12'} row>
                                        <SView col={'xs-6'} row>
                                            <SText fontSize={12} color={STheme.color.text}>
                                                Saldo Pendiente:
                                            </SText>
                                            <SText
                                                fontSize={14}
                                                color={STheme.color.text}
                                                accessibilityLabel="Saldo pendiente"
                                            >
                                                {compra.moneda} {MontoSaldo}
                                            </SText>
                                        </SView>
                                        <SView col={'xs-6'} row>
                                            <SText fontSize={12} color={STheme.color.text}>
                                                Monto Seleccionado:
                                            </SText>
                                            <SText
                                                fontSize={14}
                                                color={STheme.color.text}
                                                accessibilityLabel="Monto seleccionado"
                                            >
                                                {compra.moneda} {MontoSeleccionado}
                                            </SText>
                                        </SView>
                                    </SView>
                                </SView>
                                {/* <SView width={200} style={{ alignItems: 'flex-end', position: "absolute", right: 66, bottom: 30 }}> */}
                                <SView width={200} style={{ alignItems: 'flex-end', position: "absolute", right: -5, top: -20 }}>
                                    {this.botonEstado(compra.estado)}
                                </SView>

                            </SView>
                        </SView>
                    </SView>
                    <SHr height={8} />
                    <SView col={'xs-12'} style={{ paddingHorizontal: 8 }}>
                        <SText fontSize={14} bold color={STheme.color.text}>
                            Cuotas Pendientes
                        </SText>
                    </SView>
                    <SHr height={8} />
                    <ScrollView style={{ maxHeight: '70vh' }}>
                        <SView col={'xs-12'} style={{ paddingHorizontal: 8 }}>
                            <SView>
                                {compra.cuotasDetalle.length > 0 ? (
                                    compra.cuotasDetalle.map((cuota, index) => (
                                        <this.Item
                                            key={`cuota-item-${cuota.numero}`}
                                            cuota={cuota}
                                            index={index}
                                            compra={compra}
                                            onAjuste={this.handlePagarDeuda}
                                        />
                                    ))
                                ) : (
                                    <SText
                                        center
                                        fontSize={14}
                                        color={STheme.color.text}
                                        style={{ padding: 16 }}
                                        accessibilityLabel="Mensaje de cuotas no disponibles"
                                    >
                                        No hay cuotas asociadas a esta compra.
                                    </SText>
                                )}
                                <SHr height={8} />
                            </SView>
                        </SView>
                    </ScrollView>
                </SView>
            </SView>
        );
    }
}