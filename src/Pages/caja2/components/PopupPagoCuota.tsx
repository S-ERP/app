import React, { Component } from 'react';
import { ScrollView, Animated } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SIcon, SHr, SDate, SLoad, SMath } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import MDL from '../../../MDL';
import SelectTipoPago from './SelectTipoPago';
import SSocket from 'servisofts-socket';

const data = {
    configuracion: {
        estados: {
            Pendiente: { label: "Pendiente", color: "#EAB308", bgColor: "#fef8c3", textColor: "#b58940", icon: "history" },
            Pagado: { label: "Pagado", color: "#22C55E", bgColor: "#dafce6", textColor: "#42b88f", icon: "Check" },
            Vencido: { label: "Vencido", color: "#F97316", bgColor: "#ee343b", textColor: "#eeccda", icon: "AlertOutline" }
        }
    }
};

const COLOR_CARD = STheme.color.lightGray + '44';
const COLOR_TEXT = STheme.color.text;
const COLOR_ACCENT = "#3B82F6";
const COLOR_BORDER = STheme.color.white;

export default class PopupPagoCuota extends Component {
    static open(props) {
        SPopup.open({
            key: 'PopupPagoCuota',
            content: (
                <SView style={{
                    width: "100%", maxWidth: 600, maxHeight: "90%", padding: 8,
                    overflow: 'hidden', backgroundColor: STheme.color.background,
                    borderRadius: 12, borderWidth: 1, borderColor: COLOR_BORDER,
                }} withoutFeedback>
                    <PopupPagoCuota
                        {...props}
                        onCancel={() => {
                            SPopup.close('PopupPagoCuota');
                            if (props.onCancel) props.onCancel();
                        }}
                        onSuccess={() => {
                            SPopup.close('PopupPagoCuota');
                            if (props.onSuccess) props.onSuccess();
                        }}
                    />
                </SView>
            ),
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            selectedCuotas: {},
            cant_pendientes: 0, cant_mora: 0, cant_pagado: 0,
            montototal_pendientes: 0, montototal_mora: 0, montototal_pagado: 0,
        };
        this.fadeAnim = new Animated.Value(1);
        this.cuotasCompras = [];
        this.compraData = null; // ← Aquí guardamos getCompraData()
        this.showPaidCuotas = this.props.editObject?.pagado ? true : false;
        this.showAllPendingCuotas = false;
    }


    // TODO ricardo me djo que solo use this.props.editObject?.key y haga una consulta para traer todo las cutas con la key nomas
    loadData = async () => {
        const key_compra_venta = this.props.editObject?.key;
        try {
            this.empresa_srl = await MDL.empresa.getFull();
            if (!this.empresa_srl) throw new Error("No se pudo cargar la empresa");
            const registros = await MDL.compra_venta.getCuotasCompras(key_compra_venta);
            return registros || [];
        } catch (error) {
            console.error('Error in loadData:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudieron cargar las cuotas. Intente de nuevo.',
                time: 3000,
                color: STheme.color.danger,
                position: 'top',
            });
            return [];
        }
    };

    getCompraData = () => {
        const compra = this.props.editObject || {};
        const monedas = this.empresa_srl?.monedas || [];
        const monedaBase = monedas.find(m => m.tipo === "base") || { observacion: "BOB", tipo_cambio: 1 };

        // --- Totales de la compra ---
        let totalCompra = 0;
        let totalCompraBase = 0;
        if (compra.detalles?.length) {
            for (const d of compra.detalles) {
                const sub = (d.precio_unitario || 0) * (d.cantidad || 0);
                totalCompra += sub;
                const tc = d.tipo_cambio || compra.tipo_cambio || 1;
                totalCompraBase += sub * tc;
            }
        }

        const hoy = new SDate();
        const cuotasProcesadas = (this.cuotasCompras || []).map(c => {
            const m = monedas.find(x => x.key === c.key_moneda) || {};
            const tc = m.tipo_cambio || 1;
            const monto = parseFloat(c.monto || 0);
            const monto_base = monto * tc;
            const monto_total = parseFloat(c.monto_total || 0) || monto;
            const monto_total_base = monto_total * tc;

            const fechaVenc = new SDate(c.vencimiento, 'yyyy-MM-dd');
            const esVencida = c.estado !== "Pagado" && fechaVenc.isBefore(hoy);
            const estadoReal = c.estado === "Pagado" ? "Pagado" : (esVencida ? "Vencido" : "Pendiente");

            return {
                ...c,
                estadoReal,
                monto_base,
                monto_total_base,
                moneda_simbologia: m.observacion || "",
                moneda_tipo_cambio: tc,
                moneda_tipo: m.tipo || ""
            };
        });

        // --- Resumen de cuotas ---
        let cant_pendientes = 0, cant_mora = 0, cant_pagado = 0;
        let montototal_pendientes = 0, montototal_mora = 0, montototal_pagado = 0;

        cuotasProcesadas.forEach(c => {
            if (c.estadoReal === "Pagado") {
                cant_pagado++;
                montototal_pagado += c.monto_total_base;
            } else if (c.estadoReal === "Vencido") {
                cant_mora++;
                montototal_mora += c.monto_base;
            } else {
                cant_pendientes++;
                montototal_pendientes += c.monto_base;
            }
        });

        const estadoCompra = cant_pagado === cuotasProcesadas.length ? "Pagado" : "Pendiente";

        return {
            id: compra.id || 'N/A',
            descripcion: compra.descripcion || 'Sin descripción',
            estado: estadoCompra,
            fecha: compra.fecha_on || hoy.toString('yyyy-MM-dd'),
            total: totalCompra,
            total_base: totalCompraBase.toFixed(2),
            cuotasDetalle: cuotasProcesadas,
            moneda: compra.moneda || 'BOB',
            moneda_base: monedaBase,
            resumen: {
                cant_pendientes,
                cant_mora,
                cant_pagado,
                montototal_pendientes: SMath.formatMoney(montototal_pendientes),
                montototal_mora: SMath.formatMoney(montototal_mora),
                montototal_pagado: SMath.formatMoney(montototal_pagado)
            }
        };
    };

    componentDidMount() {
        this.loadData().then(resp => {
            this.cuotasCompras = resp;

            this.compraData = this.getCompraData(); // ← UNA SOLA VEZ

            console.log("mira esto ❤❤❤❤❤❤❤ " + JSON.stringify(this.getCompraData))

            this.setState({
                loading: false,
                ...this.compraData.resumen,
                selectedCuotas: {}
            });
        }).catch(() => {
            this.setState({ loading: false });
        });
    }

    isCuotaVencida = (vencimiento) => {
        const today = new SDate();
        const vencimientoDate = new SDate(vencimiento, 'yyyy-MM-dd');
        return vencimientoDate.isBefore(today);
    };

    // if (cuotaDate.isBefore(selectedDate) || cuotaDate == selectedDate) {


    selectPreviousCuotas = (cuotaSeleccionada) => {
        const fechaSel = new SDate(cuotaSeleccionada.vencimiento, 'yyyy-MM-dd');
        const nuevo = { ...this.state.selectedCuotas };

        this.compraData.cuotasDetalle.forEach(c => {
            if (c.estadoReal !== 'Pagado') {
                const fechaC = new SDate(c.vencimiento, 'yyyy-MM-dd');
                if (fechaC.isBefore(fechaSel) || fechaC == (fechaSel)) {
                    nuevo[c.numero] = true;
                }
            }
        });

        this.setState({ selectedCuotas: nuevo });
    };

    deselectPreviousCuotas = (cuotaSeleccionada) => {
        const fechaSel = new SDate(cuotaSeleccionada.vencimiento, 'yyyy-MM-dd');
        const nuevo = { ...this.state.selectedCuotas };

        this.compraData.cuotasDetalle.forEach(c => {
            if (c.estadoReal !== 'Pagado') {
                const fechaC = new SDate(c.vencimiento, 'yyyy-MM-dd');
                if (fechaC.isBefore(fechaSel) || fechaC == (fechaSel)) {
                    nuevo[c.numero] = false;
                }
            }
        });

        this.setState({ selectedCuotas: nuevo });
    };

    Item = ({ cuota, compra }) => {
        const simboloBase = compra.moneda_base?.observacion || 'BOB';
        const isPaid = cuota.estadoReal === 'Pagado';
        const isVencida = cuota.estadoReal === 'Vencido';
        const estadoConfig = data.configuracion.estados[cuota.estadoReal] || data.configuracion.estados.Pendiente;

        return (
            <Animated.View style={{ opacity: this.fadeAnim }}>
                <SView
                    key={`cuota-${cuota.numero}`}
                    col={'xs-12'}
                    style={{
                        backgroundColor: this.state.selectedCuotas[cuota.numero] ? STheme.color.card : STheme.color.lightGray + '55',
                        borderColor: this.state.selectedCuotas[cuota.numero] ? STheme.color.success : STheme.color.success + '55',
                        borderRadius: 8,
                        padding: 16,
                        borderWidth: 1,
                        marginBottom: 12,
                    }}
                    onPress={() => {
                        if (isPaid || this.state.loading) return;
                        const nuevo = { ...this.state.selectedCuotas };
                        if (nuevo[cuota.numero]) {
                            this.deselectPreviousCuotas(cuota);
                        } else {
                            nuevo[cuota.numero] = true;
                            this.setState({ selectedCuotas: nuevo }, () => {
                                this.selectPreviousCuotas(cuota);
                            });
                        }
                    }}
                    activeOpacity={0.7}
                >
                    <SView row center style={{ justifyContent: "space-between" }}>
                        <SView flex row style={{ paddingTop: 4 }}>
                            <SText fontSize={16} bold color={COLOR_TEXT}>Cuota #{cuota.numero}</SText>
                        </SView>
                        <SView>{this.labelEstadoItem(cuota.estadoReal)}</SView>
                    </SView>
                    <SHr h={4} />
                    <SView row style={{ justifyContent: "space-between" }}>
                        <SText fontSize={14} color={COLOR_TEXT}>
                            Vencimiento: <SText bold>{new SDate(cuota.vencimiento, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText>
                        </SText>
                        <SText fontSize={16} bold color={COLOR_TEXT}>
                            {simboloBase} {SMath.formatMoney(cuota.monto_base)}
                        </SText>
                        {cuota.moneda_tipo !== "base" && (
                            <SView style={{ position: "absolute", right: 0, top: 20 }}>
                                <SText fontSize={14} bold color={"orange"}>
                                    {cuota.moneda_simbologia} {SMath.formatMoney(cuota.monto)}
                                </SText>
                            </SView>
                        )}
                    </SView>
                    {isPaid ? (
                        <SText fontSize={14} color={COLOR_TEXT}>
                            Pagado: <SText bold color={data.configuracion.estados.Pagado.color}>
                                {new SDate(cuota.fechaPago, 'yyyy-MM-dd').toString('dd/MM/yyyy')}
                            </SText>
                        </SText>
                    ) : (
                        <SText fontSize={14} color={COLOR_TEXT}>
                            Estado: <SText bold color={estadoConfig.color}>
                                {isVencida ? 'En mora' : 'Pendiente de pago'}
                            </SText>
                        </SText>
                    )}
                </SView>
            </Animated.View>
        );
    };

    labelEstadoItem = (estado) => {
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estado] || data.configuracion.estados.Pendiente;
        return (
            <SView width={80} row center>
                <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: color }}>
                    <SIconApp name={icon} width={14} height={14} fill={textColor} />
                    <SView width={4} />
                    <SText fontSize={12} bold color={textColor}>{label}</SText>
                </SView>
            </SView>
        );
    };

    labelEstadoHeader = (estado) => {
        const { color, bgColor, textColor, label, icon } = data.configuracion.estados[estado] || data.configuracion.estados.Pendiente;
        return this.state.loading ? (
            <SLoad type='skeleton' style={{ width: "100%", height: 24 }} />
        ) : (
            <SView row center style={{ backgroundColor: bgColor, borderRadius: 4, padding: 4, borderWidth: 1, borderColor: color }}>
                <SIconApp name={icon} width={12} height={12} fill={textColor} />
                <SText fontSize={12} bold color={textColor}> {label}</SText>
            </SView>
        );
    };

    cabecera(compra) {
        // const { cant_pendientes, cant_mora, cant_pagado, montototal_pendientes, montototal_mora, montototal_pagado } = this.state;
        // const simboloBase = compra.moneda_base?.observacion || 'BOB';
        // const { cant_pendientes, cant_mora, cant_pagado, montototal_pendientes, montototal_mora, montototal_pagado } = this.pr;
        const _________compra = this.props.editObject;
        console.log("💢💢💢 " + JSON.stringify(_________compra))
        const monedas = this.empresa_srl?.monedas || [];
        const m = monedas.find(x => x.key === _________compra.key_moneda) || {};
        const monedaBase = monedas.find(m => m.tipo === "base") || { observacion: "BOB", tipo_cambio: 1 };
        return (
            <>
                <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}>
                    <SView flex>
                        <SText col={'xs-12'} fontSize={20} bold color={COLOR_TEXT} numberOfLines={1}> Gestión de Cuotas - Compra #{_________compra.id} </SText>
                    </SView>

                    <SView width={40} style={{ overflow: "hidden", alignItems: "flex-end" }}> <SView width={24} height={24} onPress={this.props.onCancel} style={{ opacity: 0.6 }} activeOpacity={0.7}> <SIcon name="Close" fill={COLOR_TEXT} width={24} height={24} /> </SView> </SView>
                </SView>

                <SHr h={16} />
                <SView col={'xs-12'} style={{ paddingHorizontal: 12 }}>
                    <SView col={'xs-12'} style={{ backgroundColor: COLOR_CARD, borderRadius: 8, padding: 12 }}>
                        <SText fontSize={16} bold color={COLOR_TEXT}>
                            {/* Detalles de la {this.props?.editObject?.pagado ? "venta" : "compra"} */}
                            Detalles de la compra
                        </SText>
                        <SHr h={4} />

                        <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                            <SView col={'xs-9'}>
                                <SText fontSize={12} color={COLOR_TEXT}>Total ({_________compra.cuotas_total.monto}) {monedaBase.observacion}:</SText>
                                <SText fontSize={14} color={COLOR_TEXT}>{m.observacion} {SMath.formatMoney(_________compra.informacion.precio_unitario)}</SText>
                                <SText fontSize={12} color={COLOR_TEXT}>Equivalente en {monedaBase.observacion}:</SText>
                                <SText fontSize={16} bold color={COLOR_TEXT}>
                                    {monedaBase.observacion} {SMath.formatMoney(_________compra.cuotas_total.monto)}
                                </SText>
                            </SView>
                            <SView col={'xs-3'}>
                                <SText fontSize={12} color={COLOR_TEXT}>Estado:</SText>
                                {this.labelEstadoHeader(compra.estado)}
                                {/* tengo que verlo???? colo sale1 */}
                            </SView>
                        </SView>

                        <SHr h={4} />
                        <SView col={'xs-12'}>
                            <SText fontSize={12} color={COLOR_TEXT}>Descripción: <SText bold>{_________compra.descripcion}</SText> </SText>
                            <SText fontSize={12} color={COLOR_TEXT}>Obs: <SText bold>{_________compra.observacion}</SText> </SText>
                            <SHr h={4} />
                            <SText fontSize={12} color={COLOR_TEXT}>Fecha: <SText bold>{new SDate(_________compra.fecha_on, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText> </SText>
                        </SView>
                        <SHr h={4} />
                        <SView col={'xs-12'} row style={{ flexWrap: 'wrap' }}>
                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pagadas:</SText>
                                {this.state.loading ? (<SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />) : (<SText fontSize={14} bold color={COLOR_TEXT}> {_________compra.cuotas_en_amortizacion.cantidad} ({monedaBase.observacion} {SMath.formatMoney(_________compra.cuotas_en_amortizacion.monto ?? 0)}) </SText>)}
                            </SView>



                            {/* <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pagadas:</SText>
                                {this.state.loading ? (<SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />) : (
                                    <SText fontSize={14} bold color={COLOR_TEXT}>
                                        {cant_pagado} ({simboloBase} {montototal_pagado})
                                    </SText>
                                )}
                            </SView> */}


                            {/* _________compra.cuotas_en_mora.monto */}

                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas en Mora:</SText>
                                {this.state.loading ? (<SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />) : (<SText fontSize={14} bold color={COLOR_TEXT}> {_________compra.cuotas_en_mora.cantidad} ({monedaBase.observacion} {SMath.formatMoney(_________compra.cuotas_en_mora.monto ?? 0)}) </SText>)}
                            </SView>


                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pendientes:</SText>
                                {this.state.loading ? (<SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />) : (<SText fontSize={14} bold color={COLOR_TEXT}> {_________compra.cuotas_en_pendientes.cantidad} ({monedaBase.observacion} {SMath.formatMoney(_________compra.cuotas_en_pendientes.monto ?? 0)}) </SText>)}
                            </SView>


                            {/* <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pendientes:</SText>
                                {this.state.loading ? (
                                    <SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />
                                ) : (
                                    <SText fontSize={14} bold color={COLOR_TEXT}>
                                        {cant_pendientes} ({simboloBase} {montototal_pendientes})
                                    </SText>
                                )}
                            </SView> */}
                        </SView>
                    </SView>
                </SView>
            </>
        );
    }

    togglePaidCuotas = () => {
        this.showPaidCuotas = !this.showPaidCuotas;
        this.forceUpdate();
    };

    toggleAllPendingCuotas = () => {
        this.showAllPendingCuotas = !this.showAllPendingCuotas;
        this.forceUpdate();
    };

    botonFooterPagar = () => {
        if (!this.compraData) return null;
        const compra = this.compraData;
        const simboloBase = compra.moneda_base?.observacion || 'BOB';

        let MontoSeleccionado = 0;
        compra.cuotasDetalle.forEach(c => {
            if (this.state.selectedCuotas[c.numero] && c.estadoReal !== 'Pagado') {
                MontoSeleccionado += c.monto_base;
            }
        });
        MontoSeleccionado = MontoSeleccionado.toFixed(2);

        const selectedCuotas = compra.cuotasDetalle.filter(c => this.state.selectedCuotas[c.numero] && c.estadoReal !== 'Pagado');
        const isAnySelected = selectedCuotas.length > 0;

        return (
            <SView col={'xs-12 sm-4'} center>
                <SText fontSize={14} bold color={COLOR_TEXT}>
                    {isAnySelected ? `${simboloBase} ${MontoSeleccionado}` : 'Selecciona una cuota'}
                </SText>
                <SHr h={8} />
                <SView
                    onPress={async () => {
                        if (!isAnySelected) {
                            SNotification.send({ title: 'Error', body: 'Selecciona al menos una cuota.', color: STheme.color.danger, time: 3000 });
                            return;
                        }
                        try {
                            const activa = await MDL.caja.getActiva();
                            if (!activa) {
                                SNotification.send({ title: 'Caja no aperturada', body: 'Abre la caja primero.', color: STheme.color.danger, time: 5000 });
                                return;
                            }

                            SelectTipoPago.openPopup({
                                key_punto_venta: activa.key_punto_venta,
                                key_moneda: compra.moneda_base.key,
                                montoMaximo: MontoSeleccionado,
                                monedaSymbol: simboloBase,
                                onSelect: (item) => {
                                    const cuotasData = selectedCuotas.map(({ key, key_moneda, monto, monto_base }) => ({
                                        key,
                                        key_moneda,
                                        monto_extranjera: monto.toFixed(2),
                                        monto_nacional: monto_base.toFixed(2)
                                    }));
                                    const enviar = { tipos_pago: item, cuotas: cuotasData };

                                    SSocket.sendPromise({
                                        service: "caja",
                                        component: "caja",
                                        type: "amortizarCuotaCompra",
                                        data: enviar,
                                        key_usuario: MDL.usuario.session?.key,
                                        key_empresa: MDL.empresa.select?.key,
                                        key_caja: MDL.caja.activa?.key,
                                    }).then(resp => {
                                        if (resp?.estado === "exito") {
                                            SNotification.send({ title: "Éxito", body: "Pago registrado.", color: STheme.color.success, time: 3000 });
                                            this.props.onSuccess?.();
                                        }
                                    }).catch(err => {
                                        SNotification.send({ title: 'Error', body: err?.message || 'Falló el pago.', color: STheme.color.danger });
                                    });
                                }
                            });
                        } catch (e) {
                            SNotification.send({ title: 'Error', body: 'No se pudo verificar la caja.', color: STheme.color.danger, time: 5000 });
                        }
                    }}
                    style={{ width: 180, height: 40 }}
                    activeOpacity={0.7}
                >
                    <SView row center style={{
                        borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12,
                        borderWidth: 1, backgroundColor: isAnySelected ? COLOR_ACCENT : STheme.color.gray,
                        borderColor: isAnySelected ? COLOR_ACCENT : STheme.color.gray, height: '100%',
                    }}>
                        <SIconApp name="pagotarjeta" width={18} fill={STheme.color.white} />
                        <SView width={8} />
                        <SText fontSize={14} bold color={STheme.color.white}>Pagar Ahora</SText>
                    </SView>
                </SView>
            </SView>
        );
    };

    render() {
        if (this.state.loading || !this.compraData) {
            return <SView col={'xs-12'} flex center><SLoad /></SView>;
        }
        const compra = this.compraData;

        const filteredCuotas = compra.cuotasDetalle.filter(c => {
            if (c.estadoReal === 'Pagado') return this.showPaidCuotas;
            if (c.estadoReal === 'Vencido') return true;
            return this.showAllPendingCuotas || c.numero <= 2;
        });

        const hasPaidCuotas = compra.cuotasDetalle.some(c => c.estadoReal === 'Pagado');
        const hasMoreThanTwoFuturePending = compra.cuotasDetalle.some(c => c.estadoReal === 'Pendiente' && c.numero > 2);

        const paddingBottom = filteredCuotas.length <= 1 ? 240 : 320;

        return (
            <SView col={'xs-12'} flex>
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ flexGrow: 1, paddingBottom }}>
                    {this.cabecera(compra)}
                    <SHr h={12} />
                    <SView col={'xs-12'} style={{ paddingHorizontal: 16 }}>
                        {filteredCuotas.length > 0 ? (
                            filteredCuotas.map(cuota => (
                                <this.Item key={`cuota-${cuota.numero}`} cuota={cuota} compra={compra} />
                            ))
                        ) : (
                            <SText center fontSize={14} color={COLOR_TEXT} style={{ padding: 16 }}>
                                No hay cuotas asociadas.
                            </SText>
                        )}
                    </SView>
                    <SHr h={16} />
                </ScrollView>

                <SView col={'xs-12'} style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    backgroundColor: STheme.color.background, borderTopWidth: 1, borderTopColor: COLOR_BORDER,
                    padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <SView row>
                        {hasPaidCuotas && (
                            <SView row center style={{
                                paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
                                borderWidth: 1, borderColor: STheme.color.lightGray, marginRight: 8, height: 40,
                            }} onPress={this.togglePaidCuotas} activeOpacity={0.7}>
                                <SText fontSize={14} color={STheme.color.lightGray}>
                                    {this.showPaidCuotas ? '- Pagadas' : '+ Pagadas'}
                                </SText>
                            </SView>
                        )}
                        {hasMoreThanTwoFuturePending && (
                            <SView row center style={{
                                paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
                                borderWidth: 1, borderColor: STheme.color.lightGray, height: 40,
                            }} onPress={this.toggleAllPendingCuotas} activeOpacity={0.7}>
                                <SText fontSize={14} color={STheme.color.lightGray}>+ Pendientes</SText>
                            </SView>
                        )}
                    </SView>
                    {this.botonFooterPagar()}
                </SView>
            </SView>
        );
    }
}