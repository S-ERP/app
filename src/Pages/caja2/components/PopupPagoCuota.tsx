import React, { Component } from 'react';
import { ScrollView, Animated } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SIcon, SHr, SDate, SLoad } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import MDL from '../../../MDL';
import SelectTipoPago from './SelectTipoPago';

const data = { configuracion: { estados: { Pendiente: { label: "Pendiente", color: "#EAB308", bgColor: "#fef8c3", textColor: "#b58940", icon: "history" }, Pagado: { label: "Pagado", color: "#22C55E", bgColor: "#dafce6", textColor: "#42b88f", icon: "Check" }, Vencido: { label: "Vencido", color: "#F97316", bgColor: "#ee343b", textColor: "#eeccda", icon: "AlertOutline" } } } };

// Colores
const COLOR_CARD = STheme.color.lightGray + '44';
const COLOR_TEXT = STheme.color.text;
const COLOR_ACCENT = "#3B82F6";
const COLOR_BORDER = STheme.color.white;

export default class PopupPagoCuota extends Component {
    static open(props) {
        SPopup.open({
            key: 'PopupPagoCuota',
            content: (
                <SView style={{ width: "100%", maxWidth: 600, maxHeight: "90%", padding: 8, overflow: 'hidden', backgroundColor: STheme.color.background, borderRadius: 12, borderWidth: 1, borderColor: COLOR_BORDER, }} withoutFeedback >
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
        this.state = { loading: true, cant_pendientes: 0, cant_mora: 0, cant_pagado: 0, montototal_pendientes: 0, montototal_mora: 0, montototal_pagado: 0, };
        this.fadeAnim = new Animated.Value(1);
        this.cuotasCompras = [];
        this.selectedCuotas = {};
        this.montoPagar = {};
        this.isLoading = false;
        this.showPaidCuotas = this.props.editObject?.pagado ? true : false;
        this.showAllPendingCuotas = false;
    }

    loadData = async () => {
        const key_compra_venta = this.props.editObject?.key || '1f30bf00-33ba-4466-813b-2870eec111dd';
        try {
            const registros = await MDL.compra_venta.getCuotasCompras(key_compra_venta);
            return registros || [];
        } catch (error) {
            console.error('Error in loadData:', error);
            SNotification.send({ title: 'Error', body: 'No se pudieron cargar las cuotas. Intente de nuevo.', time: 3000, color: STheme.color.danger, position: 'top', });
            return [];
        }
    };

    calculateCuotaSummary = (cuotas) => {
        const hoy = new SDate();
        let cant_pendientes = 0;
        let cant_mora = 0;
        let cant_pagado = 0;
        let montototal_pendientes = 0;
        let montototal_mora = 0;
        let montototal_pagado = 0;

        for (const item of cuotas) {
            const saldoPendiente = parseFloat(item.monto || 0);
            if (item.estado == "Pagado") {
                cant_pagado++;
                montototal_pagado += parseFloat(item.monto_total || 0);
            } else {
                const fechaVencimiento = new SDate(item.vencimiento, 'yyyy-MM-dd');
                if (fechaVencimiento.isBefore(hoy)) {
                    item.estado = "Vencido";
                    cant_mora++;
                    montototal_mora += saldoPendiente;
                } else {
                    item.estado = "Pendiente";
                    cant_pendientes++;
                    montototal_pendientes += saldoPendiente;
                }
            }
        }

        return { cant_pendientes, cant_mora, cant_pagado, montototal_pendientes: montototal_pendientes.toFixed(2), montototal_mora: montototal_mora.toFixed(2), montototal_pagado: montototal_pagado.toFixed(2), };
    };

    componentDidMount() {
        this.loadData()
            .then((resp) => {
                this.cuotasCompras = resp;
                const summary = this.calculateCuotaSummary(resp);
                Animated.timing(this.fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true, }).start(() => {
                    this.setState({
                        loading: false,
                        ...summary,
                    });
                    this.fadeAnim.setValue(1);
                });
            })
            .catch((error) => {
                console.error('Error loading data:', error);
                this.cuotasCompras = [];
                Animated.timing(this.fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    this.setState({ loading: false });
                    this.fadeAnim.setValue(1);
                });
            });
    }

    isCuotaVencida = (vencimiento) => {
        const today = new SDate();
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
                newSelectedCuotas[cuota.numero] = cuotaDate.isBefore(selectedDate) || cuotaDate == selectedDate;
                // newSelectedCuotas[cuota.numero] = cuotaDate.isBefore(selectedDate) || cuotaDate === selectedDate;
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
                if (cuotaDate.isBefore(selectedDate) || cuotaDate == selectedDate) {
                    newSelectedCuotas[cuota.numero] = false;
                }
            }
        }

        this.selectedCuotas = newSelectedCuotas;
        this.forceUpdate();
    };

    // handlePagarDeuda = async (cuota) => {
    //     const monto = parseFloat(this.montoPagar[cuota.numero] || '0');
    //     if (this.isLoading) return;
    //     if (monto > cuota.monto) {
    //         SNotification.send({
    //             title: 'Error',
    //             body: `El monto no puede exceder el valor de la cuota (${cuota.monto.toFixed(2)}).`,
    //             time: 3000,
    //             color: STheme.color.danger,
    //             position: 'top',
    //         });
    //         return;
    //     }
    //     this.isLoading = true;
    //     this.forceUpdate();
    //     try {
    //         await new Promise((resolve) => setTimeout(resolve, 1000));
    //         SNotification.send({
    //             title: 'Éxito',
    //             body: 'El pago se registró correctamente.',
    //             time: 3000,
    //             color: STheme.color.success,
    //             position: 'top',
    //         });
    //         const newMontoPagar = { ...this.montoPagar };
    //         delete newMontoPagar[cuota.numero];
    //         this.montoPagar = newMontoPagar;
    //         this.isLoading = false;
    //         if (this.props.onSuccess) {
    //             this.props.onSuccess({ cuota, monto });
    //         }
    //         const summary = this.calculateCuotaSummary(this.cuotasCompras);
    //         this.setState(summary);
    //     } catch (error) {
    //         console.error('Error al registrar el pago:', error);
    //         SNotification.send({
    //             title: 'Error',
    //             body: 'No se pudo registrar el pago.',
    //             time: 3000,
    //             color: STheme.color.danger,
    //             position: 'top',
    //         });
    //         this.isLoading = false;
    //     }
    //     this.forceUpdate();
    // };

    getCompraData = () => {
        const compra = this.props.editObject || {};
        let totalCompra = 0;

        if (compra.detalles?.length) {
            for (let i = 0; i < compra.detalles.length; i++) {
                const item = compra.detalles[i];
                totalCompra += (item.precio_unitario || 0) * (item.cantidad || 0);
            }
        }

        const cuotasDetalle = this.cuotasCompras.length > 0 ? this.cuotasCompras : [];

        // const estadoCompra = compra.cuotas_en_mora?.monto > 0 ? 'Pendiente' : 'Pagado';
        let tieneVencidas = false, tienePendientes = false;
        for (let i = 0; i < cuotasDetalle.length; i++) {
            const c = cuotasDetalle[i];
            if (c.estado === "Vencido") tieneVencidas = true;
            else if (c.estado === "Pendiente") tienePendientes = true;
        }

        let estadoCompra = "Pagado";
        if (tieneVencidas || tienePendientes) estadoCompra = "Pendiente";

        return {
            id: compra.id || 'N/A',
            descripcion: compra.descripcion || 'Sin descripción',
            estado: estadoCompra,
            fecha: compra.fecha_on || new SDate().toString('yyyy-MM-dd'),
            total: totalCompra || 0,
            cuotasDetalle: cuotasDetalle,
            moneda: compra.moneda || 'BOB',
            cuotas: compra.cuotas || { cantidad: 0, total: 0 },
            monto_amortizado: compra.monto_amortizado || 0,
            cuotas_en_mora: compra.cuotas_en_mora || { cantidad: 0, monto: 0, min_fecha: null },
        };
    };

    Item = ({ cuota, compra }) => {
        const monedaSymbol = compra.moneda;
        const isPaid = cuota.estado === 'Pagado';
        const isVencida = !isPaid && this.isCuotaVencida(cuota.vencimiento);
        const estadoConfig = data.configuracion.estados[isVencida ? 'Vencido' : cuota.estado] || data.configuracion.estados.Pendiente;

        return (
            <Animated.View style={{ opacity: this.fadeAnim }}>
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
                        <SView flex row style={{ paddingTop: 4 }}> <SText fontSize={16} bold color={COLOR_TEXT}>Cuota #{cuota.numero}</SText> </SView>
                        <SView>{this.labelEstadoItem(cuota.estado, isVencida)}</SView>
                    </SView>
                    <SHr h={4} />
                    <SView row style={{ justifyContent: "space-between" }}>
                        <SText fontSize={14} color={COLOR_TEXT}> Vencimiento: <SText bold>{new SDate(cuota.vencimiento, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText> </SText> <SText fontSize={16} bold color={COLOR_TEXT}> {monedaSymbol} {parseFloat(cuota.monto).toFixed(2)} </SText>
                    </SView>
                    {isPaid ? (
                        <SText fontSize={14} color={COLOR_TEXT}> Pagado: <SText bold color={data.configuracion.estados.Pagado.color}> {new SDate(cuota.fechaPago, 'yyyy-MM-dd').toString('dd/MM/yyyy')} </SText> </SText>
                    ) : (
                        <SText fontSize={14} color={COLOR_TEXT}> Estado: <SText bold color={estadoConfig.color}> {isVencida ? 'En mora' : 'Pendiente de pago'} </SText> </SText>
                    )}
                </SView>
            </Animated.View>
        );
    };

    labelEstadoItem = (estado, isVencida = false) => {
        const estadoNormalizado = isVencida ? 'Vencido' : estado;
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estadoNormalizado] || data.configuracion.estados.Pendiente;
        return (
            <SView width={80} row center accessibilityLabel={`Estado: ${label}`}>
                <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: color }}>
                    <SIconApp name={icon} width={14} height={14} fill={textColor} />
                    <SView width={4} />
                    <SText fontSize={12} bold color={textColor}>{label}</SText>
                </SView>
            </SView>
        );
    };


    labelEstadoHeader = (estado) => {
        const { loading } = this.state;
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estado] || data.configuracion.estados.Pendiente;

        return (
            loading ? (<SLoad type='skeleton' style={{ width: "100%", height: 24 }} />) : (
                <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, padding: 4, borderWidth: 1, borderColor: color }} >
                    <SIconApp name={icon} width={12} height={12} fill={textColor} />
                    <SText fontSize={12} bold color={textColor}> {label}</SText>
                </SView>
            )
        );
    };

    cabecera(compra, MontoSaldo) {
        const { cant_pendientes, cant_mora, cant_pagado, montototal_pendientes, montototal_mora, montototal_pagado } = this.state;

        return (
            <>
                <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}>
                    <SView flex>
                        <SText col={'xs-12'} fontSize={20} bold color={COLOR_TEXT} numberOfLines={1}> Gestión de Cuotas - Compra #{compra.id} </SText>
                    </SView>
                    <SView width={40} style={{ overflow: "hidden", alignItems: "flex-end" }}>
                        <SView width={24} height={24} onPress={this.props.onCancel} style={{ opacity: 0.6 }} accessibilityLabel="Cerrar popup" activeOpacity={0.7} >
                            <SIcon name="Close" fill={COLOR_TEXT} width={24} height={24} />
                        </SView>
                    </SView>
                </SView>
                <SHr h={16} />
                <SView col={'xs-12'} style={{ paddingHorizontal: 12 }}>
                    <SView col={'xs-12'} style={{ backgroundColor: COLOR_CARD, borderRadius: 8, padding: 12, }} >
                        <SText fontSize={16} bold color={COLOR_TEXT}>Detalles de la {this.props?.editObject?.pagado ? "venta" : "compra"}</SText>
                        <SHr h={4} />
                        <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }} backgroundColor='transparent'>
                            <SView col={'xs-9'}>
                                <SText fontSize={12} color={COLOR_TEXT}>Total:</SText>
                                <SText fontSize={16} bold color={COLOR_TEXT}> {compra.moneda} {compra.total.toFixed(2)} </SText>
                            </SView>
                            <SView col={'xs-3'}>
                                <SText fontSize={12} color={COLOR_TEXT}>Estado:</SText> {this.labelEstadoHeader(compra.estado)}
                            </SView>
                        </SView>
                        <SHr h={4} />
                        <SView col={'xs-12'}>
                            <SText fontSize={12} color={COLOR_TEXT}> Descripción: <SText bold>{compra.descripcion}</SText> </SText>
                            <SHr h={4} />
                            <SText fontSize={12} color={COLOR_TEXT}> Fecha: <SText bold>{new SDate(compra.fecha, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText> </SText>
                        </SView>

                        <SHr h={4} />
                        <SView col={'xs-12'} row style={{ flexWrap: 'wrap' }}>
                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pagadas:</SText>
                                {this.state.loading ? (<SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />) : (
                                    <SText fontSize={14} bold color={COLOR_TEXT}> {cant_pagado} ({compra.moneda} {montototal_pagado}) </SText>)}


                            </SView>
                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas en Mora:</SText>

                                {this.state.loading ? (<SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />) : (
                                    <SText fontSize={14} bold color={COLOR_TEXT}> {cant_mora} ({compra.moneda} {montototal_mora}) </SText>
                                )}

                            </SView>
                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pendientes:</SText>

                                {this.state.loading ? (<SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />) : (
                                    <SText fontSize={14} bold color={COLOR_TEXT}> {cant_pendientes} ({compra.moneda} {montototal_pendientes}) </SText>
                                )}

                            </SView>
                        </SView>
                    </SView>
                </SView>
            </>
        );
    }

    botonFooterPagadas() {
        return (
            <SView row center style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.lightGray, marginRight: 8, height: 40, }}
                onPress={this.togglePaidCuotas} activeOpacity={0.7}
                accessibilityLabel={this.showPaidCuotas ? 'Ocultar anteriores' : 'Ver anteriores'}
            >
                <SText fontSize={14} color={STheme.color.lightGray}> {this.showPaidCuotas ? '- Pagadas' : '+ Pagadas'} </SText>
            </SView>
        );
    }

    botonFooterPendientes() {
        return (
            <SView row center style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.lightGray, height: 40, }} onPress={this.toggleAllPendingCuotas}
                activeOpacity={0.7}
                accessibilityLabel="Ver más cuotas pendientes" >
                <SText fontSize={14} color={STheme.color.lightGray}>+ Pendientes</SText>
            </SView>
        );
    }

    botonFooterPagar = (estado, MontoSeleccionado, moneda) => {
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
            <SView col={'xs-12 sm-4'} center>
                <SText fontSize={14} bold color={COLOR_TEXT}> {isAnyCuotaSelected ? `${moneda} ${MontoSeleccionado}` : 'Selecciona una cuota'} </SText>
                <SHr h={8} />
                <SView
                    onPress={async () => {
                        if (!isAnyCuotaSelected) {
                            SNotification.send({ title: 'Error', time: 3000, color: STheme.color.danger, body: 'Por favor, selecciona al menos una cuota para pagar.', });
                            return;
                        }

                        try {
                            const activa = await MDL.caja.getActiva();
                            this.cajaActiva = !!activa;
                            if (!this.cajaActiva) {
                                SNotification.send({ title: 'Caja no aperturada', body: 'Debes abrir la caja antes de continuar con las operaciones.', color: STheme.color.danger, time: 5000, });
                                return;
                            }

                            SelectTipoPago.openPopup({
                                key_punto_venta: activa?.key_punto_venta,
                                key_moneda: compra.moneda,
                                montoMaximo: MontoSeleccionado,
                                monedaSymbol: moneda,
                                onSelect: (item) => {
                                    // esto tengo que verlo
                                    // this.tipos_pago_seleccionado = item;
                                    // this.forceUpdate();
                                    // SelectTipoPago.closePopup();

                                    const cuotaKeys = selectedCuotas.map(cuota => cuota.key);
                                    const hoy = new SDate().toString('yyyy-MM-dd hh:mm:ss');
                                    const keyTipoPago = Object.keys(item)[0];
                                    const monto = item[keyTipoPago];


                                    // Aquí iría el registro real

                                    // Model.cuota_amortizacion.Action.registro({
                                    //     data: {
                                    //         descripcion: "Amortización de cuota desde caja.",
                                    //         observacion: "-ni una-",
                                    //         fecha: hoy,
                                    //         tipo_pago: item,
                                    //         key_cuotas: cuotaKeys,
                                    //         key_caja_detalle: activa?.key_punto_venta
                                    //     },
                                    //     key_usuario: Model.usuario.Action.getKey()
                                    // }).then(e => {
                                    //     const obj = { data: { key_amortizacion: e.data?.key } };
                                    // }).catch(e => {
                                    //     console.error("Error al amortizar:", e);
                                    //     SNotification.send({
                                    //         title: 'Error',
                                    //         body: 'No se pudo registrar el pago.',
                                    //         time: 3000,
                                    //         color: STheme.color.danger,
                                    //         position: 'top',
                                    //     });
                                    // });
                                },
                            });
                        } catch (e) {
                            console.error('Error al obtener estado de caja:', e);
                            SNotification.send({ title: 'Error', body: 'No se pudo verificar el estado de la caja. Intenta de nuevo.', color: STheme.color.danger, time: 5000, });
                        }
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel="Pagar cuotas seleccionadas"
                    style={{ width: 180, height: 40 }}
                >
                    <SView row center style={{ borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, backgroundColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray, borderColor: isAnyCuotaSelected ? COLOR_ACCENT : STheme.color.gray, height: '100%', }} >
                        <SIconApp name="pagotarjeta" width={18} fill={STheme.color.white} />
                        <SView width={8} />
                        <SText fontSize={14} bold color={STheme.color.white}>Pagar Ahora</SText>
                    </SView>
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
        const { loading } = this.state;
        const compra = this.getCompraData();
        // const today = new SDate('2025-09-08', 'yyyy-MM-dd');
        // 
        let MontoSeleccionado = 0;
        let MontoSaldo = 0;
        for (let i = 0; i < compra.cuotasDetalle.length; i++) {
            const cuota = compra.cuotasDetalle[i];
            if (cuota.estado !== 'Pagado') {
                MontoSaldo += parseFloat(cuota.monto || 0);
                if (this.selectedCuotas[cuota.numero]) {
                    MontoSeleccionado += parseFloat(cuota.monto || 0);
                }
            }
        }
        MontoSeleccionado = MontoSeleccionado.toFixed(2);
        MontoSaldo = MontoSaldo.toFixed(2);

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

        const paddingBottom = filteredCuotas.length <= 1 ? 240 : 320;

        return (
            <SView col={'xs-12'} flex style={{ flex: 1 }} accessibilityLabel="Contenedor principal de gestión de cuotas">
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ flexGrow: 1, paddingBottom: paddingBottom, }} >
                    {this.cabecera(compra, MontoSaldo)}
                    <SHr h={12} />


                    <SView col={'xs-12'} style={{ paddingHorizontal: 16, }}>
                        {loading ? (<SLoad type='skeleton' style={{ width: "100%", height: 50 }} />
                        ) : filteredCuotas.length > 0 ? (
                            filteredCuotas.map((cuota) => (
                                <this.Item
                                    key={`cuota-item-${cuota.numero}`}
                                    cuota={cuota}
                                    compra={compra}
                                />
                            ))
                        ) : (
                            <Animated.View style={{ opacity: this.fadeAnim }}>
                                <SText center fontSize={14} color={COLOR_TEXT} style={{ padding: 16 }} accessibilityLabel="Mensaje de cuotas no disponibles" > No hay cuotas asociadas a esta compra. </SText>
                            </Animated.View>
                        )}
                    </SView>
                    <SHr h={16} />
                </ScrollView>
                <SView col={'xs-12'} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: STheme.color.background, borderTopWidth: 1, borderTopColor: COLOR_BORDER, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }} >
                    <SView row>
                        {hasPaidCuotas && this.botonFooterPagadas()}
                        {hasMoreThanTwoFuturePending && this.botonFooterPendientes()}
                    </SView>
                    {this.botonFooterPagar(compra.estado, MontoSeleccionado, compra.moneda)}
                </SView>
            </SView>
        );
    }
}
