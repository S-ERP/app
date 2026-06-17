import React, { Component } from 'react';
import { ScrollView, Animated } from 'react-native';
import { SNotification, SPopup, SText, STheme, SView, SIcon, SHr, SDate, SLoad, SMath } from 'servisofts-component';
import SIconApp from '../../../Assets/SIconApp';
import MDL from '../../../MDL';
// import SelectTipoPago from './SelectTipoPagoVenta';
import SSocket from 'servisofts-socket';
import SelectTipoPagoVenta from './SelectTipoPagoVenta';

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
            showPaidCuotas: props.editObject?.pagado || false,
            showAllPendingCuotas: false,
        };
        this.fadeAnim = new Animated.Value(1);
        this.cuotasCompras = [];
        this.compraData = null;
    }

    loadData = async () => {
        const key_compra_venta = this.props.editObject?.key;
        try {
            const empresa_srl = await MDL.empresa.getFull();
            if (!empresa_srl) console.error("No se pudo cargar la empresa");
            this.empresa_srl = empresa_srl;
            const registros = await MDL.compra_venta.getCuotasCompras(key_compra_venta);
            // dj
            return { empresa_srl, cuotas: registros || [] };
        } catch (error) {
            console.error('Error in loadData:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudieron cargar las cuotas. Intente de nuevo.',
                time: 3000,
                color: STheme.color.danger,
                position: 'top',
            });
            return { empresa_srl: null, cuotas: [] };
        }
    };

    getCompraData = (cuotasCompras, empresa_srl) => {
        if (!empresa_srl || !cuotasCompras?.length) return null;

        const compra = this.props.editObject || {};
        const monedas = empresa_srl.monedas || [];
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
        const cuotasProcesadas = cuotasCompras.map(c => {
            const m = monedas.find(x => x.key === c.key_moneda) || {};
            const tc = m.tipo_cambio || 1;
            const monto = parseFloat(c.monto || 0);
            // const monto_base = 8;
            // const monto_base = c.monto_base || (monto * tc);
            const monto_total = parseFloat(c.monto_total || 0) || monto;
            const monto_total_base = monto_total * tc;

            const fechaVenc = new SDate(c.vencimiento, 'yyyy-MM-dd');
            const esVencida = c.estado !== "Pagado" && fechaVenc.isBefore(hoy);
            const estadoReal = c.estado === "Pagado" ? "Pagado" : (esVencida ? "Vencido" : "Pendiente");

            return {
                ...c,
                estadoReal,
                // monto_base,
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
        this.loadData().then(({ empresa_srl, cuotas }) => {
            this.cuotasCompras = cuotas;
            this.compraData = this.getCompraData(cuotas, empresa_srl);

            console.log("mira esto ❤❤❤❤❤❤❤", JSON.stringify(this.compraData, null, 2));

            this.setState({
                loading: false,
                ...this.compraData?.resumen || {},
                selectedCuotas: {},
                showPaidCuotas: this.props.editObject?.pagado || false,
            });
        }).catch(() => {
            this.setState({ loading: false });
        });
    }

    selectPreviousCuotas = (cuotaSeleccionada) => {
        const fechaSel = new SDate(cuotaSeleccionada.vencimiento, 'yyyy-MM-dd');
        const nuevo = { ...this.state.selectedCuotas };

        this.compraData.cuotasDetalle.forEach(c => {
            if (c.estadoReal !== 'Pagado') {
                const fechaC = new SDate(c.vencimiento, 'yyyy-MM-dd');
                if (fechaC.isBefore(fechaSel) || fechaC == fechaSel) {
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
                if (fechaC.isBefore(fechaSel) || fechaC.isSame(fechaSel)) {
                    nuevo[c.numero] = false;
                }
            }
        });

        this.setState({ selectedCuotas: nuevo });
    };

    Item = ({ cuota }) => {
        const isPaid = cuota.estadoReal === "Pagado";
        const isSelected = this.state.selectedCuotas[cuota.numero];

        const fechaVencimiento = new SDate(cuota.vencimiento, 'yyyy-MM-dd').toString('dd/MM/yyyy');
        const fechaPago = cuota.fechaPago ? new SDate(cuota.fechaPago, 'yyyy-MM-dd').toString('dd/MM/yyyy') : null;

        const monedaBase = this.compraData.moneda_base;
        const monedaCuota = this.compraData.cuotasDetalle.find(m => m.key_moneda === cuota.key_moneda)?.moneda_simbologia || '';

        const cuotaStyle = {
            backgroundColor: isSelected ? STheme.color.card : STheme.color.lightGray + '55',
            borderColor: isSelected ? STheme.color.success : STheme.color.success + '55',
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            marginBottom: 12,
        };

        return (
            <Animated.View style={{ opacity: this.fadeAnim }}>
                <SView
                    col={'xs-12'}
                    style={cuotaStyle}
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
                        <SView flex row><SText fontSize={16} bold color={COLOR_TEXT}>Cuota #{cuota.numero}</SText> </SView>
                        <SView>{this.labelEstadoItem(cuota.estadoReal)}</SView>
                    </SView>
                    <SHr h={4} />

                    <SView row style={{ justifyContent: "space-between" }}>
                        <SView>
                            <SText fontSize={14} color={COLOR_TEXT}>Vencimiento: <SText bold>{fechaVencimiento}</SText> </SText>

                            {isPaid ? (<SText fontSize={14} color={COLOR_TEXT}>Pagado: <SText bold color={data.configuracion.estados.Pagado.color}> {fechaPago}</SText></SText>)
                                : (<SText fontSize={14} color={COLOR_TEXT}><SText bold color={data.configuracion.estados[cuota.estadoReal].color}>{cuota.estadoReal === "Vencido" ? 'En mora' : 'Pendiente de pago'}</SText></SText>)}
                        </SView>

                        <SView col={"xs-8"} style={{ alignItems: 'flex-end' }} border={"transparent"}>
                            {cuota.key_moneda === monedaBase.key ? (
                                <SText fontSize={16} bold color={STheme.color.text}>{monedaBase.observacion} {SMath.formatMoney(cuota.saldo3)}</SText>
                                // <SText fontSize={16} bold color={STheme.color.text}> aaa {monedaBase.observacion} {cuota.estadoReal =="Pagado" ? cuota.monto_total_base : SMath.formatMoney(cuota.monto_base)}</SText>
                                // <SText fontSize={16} bold color={STheme.color.text}> aaa {monedaBase.observacion} {SMath.formatMoney(cuota.monto_base)}</SText>
                                // <SText fontSize={16} bold color={STheme.color.text}>  {monedaBase.observacion} {SMath.formatMoney(cuota.monto_base)}</SText>
                            ) : (
                                <>

                                    <SText fontSize={16} bold color={STheme.color.text}> {monedaCuota} {cuota.saldo}</SText>
                                    {/* <SText fontSize={16} bold color={STheme.color.text}> {monedaCuota} {SMath.formatMoney(cuota.monto)}</SText> */}
                                    <SText fontSize={14} bold color={"#FF7F50"}> T/C({cuota.tipo_cambio})  {monedaBase.observacion} {SMath.formatMoney(cuota.saldo_base)}</SText>
                                    {/* <SText fontSize={14} bold color={"#FF7F50"}> T/C({cuota.tipo_cambio})  {monedaBase.observacion} {SMath.formatMoney(cuota.monto_base)}</SText> */}
                                    {cuota.tipo_cambio !== cuota.moneda_tipo_cambio && (<SText fontSize={13} bold color={"#2bc73bff"} center> <SIconApp name='Reload' width={10} height={10} fill='#2bc73bff' /> Actual T/C({cuota.moneda_tipo_cambio})  {monedaBase.observacion} {SMath.formatMoney(cuota.saldo * cuota.moneda_tipo_cambio)}</SText>)}
                                </>
                            )}
                        </SView>
                    </SView>
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

    cabecera() {
        if (!this.compraData) return null;
        const compra = this.props.editObject;
        // const m = this.compraData.moneda_base;
        const api_empresa = this.empresa_srl?.monedas || [];

        const moneda = api_empresa.find(x => x.key === compra.key_moneda) || {};
        const monedaBase = api_empresa.find(m => m.tipo === "base") || {};

        const estadoReal = compra.pagado === true ? "Pagado" : "Pendiente";

        console.log("mirala todo " + JSON.stringify(monedaBase))


        return (
            <>
                <SView row center style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLOR_BORDER }}>
                    <SView flex>
                        <SText col={'xs-12'} fontSize={20} bold color={COLOR_TEXT} numberOfLines={1}>
                            Gestión de Cuotas - {compra.esCompra ? "Compra a credito" : "Venta a credito"} #{compra.id}
                        </SText>
                    </SView>
                    <SView width={40} style={{ alignItems: "flex-end" }}>
                        <SView width={24} height={24} onPress={this.props.onCancel} style={{ opacity: 0.6 }} activeOpacity={0.7}>
                            <SIcon name="Close" fill={COLOR_TEXT} width={24} height={24} />
                        </SView>
                    </SView>
                </SView>

                <SHr h={16} />
                <SView col={'xs-12'} style={{ paddingHorizontal: 12 }}>
                    <SView col={'xs-12'} style={{ backgroundColor: COLOR_CARD, borderRadius: 8, padding: 12 }}>
                        <SText fontSize={16} bold color={COLOR_TEXT}>Detalles de la {compra.esCompra ? "compra" : "venta"}</SText>
                        <SHr h={4} />

                        <SView col={'xs-12'} row style={{ justifyContent: 'space-between' }}>
                            <SView col={'xs-9'}>
                                <SText fontSize={12} color={COLOR_TEXT}>Total:</SText>

                                <SText fontSize={14} color={COLOR_TEXT}>{moneda?.observacion ?? "Bs"} {SMath.formatMoney(compra.detalle_items?.monto_base ?? 0)} </SText>
                                {/* <SText fontSize={14} color={COLOR_TEXT}> T/C {SMath.formatMoney(compra.detalle_items2?.tipo_cambio ?? 0)} </SText> */}

                                <SText fontSize={12} color={COLOR_TEXT}>Equivalente en {moneda?.observacion ?? "Bs"}:</SText>
                                <SText fontSize={16} bold color={COLOR_TEXT}>
                                    {monedaBase?.observacion ?? "Bs"} {SMath.formatMoney(compra.detalle_items?.monto_base ?? 0)}
                                    {/* <SText fontSize={14} color={COLOR_TEXT}> {moneda.observacion} {SMath.formatMoney(compra.detalle_items2?.monto_total_base ?? 0)} </SText> */}
                                </SText>
                            </SView>
                            <SView col={'xs-3'}  >
                                <SText fontSize={12} color={COLOR_TEXT}>Estado:</SText>
                                {this.labelEstadoHeader(estadoReal)}
                            </SView>
                        </SView>

                        <SHr h={4} />
                        <SView col={'xs-12'}>
                            <SText fontSize={12} color={COLOR_TEXT}>
                                Descripción: <SText bold>{compra.descripcion}</SText>
                            </SText>
                            <SText fontSize={11} color={COLOR_TEXT}>
                                Observación: {compra.detalle_items?.descripcion || 'N/A'}
                            </SText>
                            <SHr h={4} />
                            <SText fontSize={12} color={COLOR_TEXT}>
                                Fecha: <SText bold>{new SDate(compra.fecha_on, 'yyyy-MM-dd').toString('dd/MM/yyyy')}</SText>
                            </SText>
                        </SView>
                        <SHr h={4} />
                        <SView col={'xs-12'} row style={{ flexWrap: 'wrap' }}>
                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pagadas:</SText>
                                {this.state.loading ? (
                                    <SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />
                                ) : (<>

                                    <SView col={'xs-12'} row>
                                        <SView width={14}  >
                                            <SText fontSize={14} color={COLOR_TEXT} bold>{compra.cuotas_en_amortizacion?.cantidad ?? 0}  </SText>
                                        </SView>
                                        <SView flex  >
                                            <SText fontSize={14} color={COLOR_TEXT} bold >({monedaBase.observacion} {SMath.formatMoney(compra.cuotas_en_amortizacion?.monto_base ?? 0)})</SText>
                                            {monedaBase?.observacion !== moneda?.observacion ? <SText fontSize={12} color={COLOR_TEXT}   >({moneda?.observacion ?? "Bs"} {SMath.formatMoney(compra.cuotas_en_amortizacion?.monto ?? 0)})</SText> : null}
                                            {/* <SText fontSize={14} color={COLOR_TEXT} bold >({monedaBase?.observacion ?? "Bs"} {SMath.formatMoney(compra.detalle_items2?.total_amortizado_base ?? 0)})</SText> */}
                                            {/* <SText fontSize={13} color={COLOR_TEXT}   >{moneda.observacion} ({SMath.formatMoney(compra.detalle_items2?.total_amortizado ?? 0)}) </SText> */}
                                        </SView>
                                    </SView>



                                </>
                                )}
                            </SView>
                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas en Mora:</SText>
                                {this.state.loading ? (
                                    <SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />
                                ) : (<>
                                    <SView col={'xs-12'} row>
                                        <SView width={14}  >
                                            <SText fontSize={14} color={COLOR_TEXT} bold>{compra.cuotas_en_mora?.cantidad ?? 0}  </SText>
                                        </SView>
                                        <SView flex  >

                                            <SText fontSize={14} color={COLOR_TEXT} bold >({monedaBase?.observacion ?? "Bs"} {SMath.formatMoney(compra.cuotas_en_mora?.monto_base ?? 0)})</SText>
                                            {monedaBase?.observacion !== moneda?.observacion ? <SText fontSize={12} color={COLOR_TEXT}   >({moneda?.observacion ?? "Bs"} {SMath.formatMoney(compra.cuotas_en_mora?.monto ?? 0)})</SText> : null}
                                            {/* <SText fontSize={14} color={COLOR_TEXT} bold >({monedaBase.observacion} {SMath.formatMoney(compra.detalle_items2?.saldo_base ?? 0)})</SText> */}
                                            {/* <SText fontSize={13} color={COLOR_TEXT}   >{moneda.observacion} ({SMath.formatMoney(compra.detalle_items2?.saldo ?? 0)}) </SText> */}
                                        </SView>
                                    </SView>
                                </>
                                )}
                            </SView>
                            <SView col={'xs-6 sm-4'} style={{ marginBottom: 8 }}>
                                <SText fontSize={12} color={COLOR_TEXT}>Cuotas Pendientes:</SText>
                                {this.state.loading ? (
                                    <SLoad type='skeleton' style={{ width: 100, height: 16, marginTop: 4 }} />
                                ) : (
                                    <>
                                        <SView col={'xs-12'} row>
                                            <SView width={14}  >
                                                <SText fontSize={14} color={COLOR_TEXT} bold>{compra.cuotas_en_pendientes?.cantidad ?? 0}  </SText>
                                            </SView>
                                            <SView flex  >

                                                <SText fontSize={14} color={COLOR_TEXT} bold >({monedaBase?.observacion ?? "Bs"} {SMath.formatMoney(compra.cuotas_en_pendientes?.monto_base ?? 0)})</SText>
                                                {monedaBase?.observacion !== moneda?.observacion ? <SText fontSize={12} color={COLOR_TEXT}>({moneda?.observacion ?? "Bs"} {SMath.formatMoney(compra.cuotas_en_pendientes?.monto ?? 0)})</SText> : null}
                                                {/* <SText fontSize={14} color={COLOR_TEXT} bold >({monedaBase.observacion} {SMath.formatMoney(compra.detalle_items2?.saldo_base ?? 0)})</SText> */}
                                                {/* <SText fontSize={13} color={COLOR_TEXT}   >{moneda.observacion} ({SMath.formatMoney(compra.detalle_items2?.saldo ?? 0)}) </SText> */}
                                            </SView>
                                        </SView>
                                    </>


                                )}
                            </SView>
                        </SView>
                    </SView>
                </SView>
            </>
        );
    }

    togglePaidCuotas = () => {
        this.setState(prev => ({ showPaidCuotas: !prev.showPaidCuotas }));
    };

    toggleAllPendingCuotas = () => {
        this.setState(prev => ({ showAllPendingCuotas: !prev.showAllPendingCuotas }));
    };

    botonFooterPagar = () => {
        if (!this.compraData) return null;
        const { cuotasDetalle, moneda_base } = this.compraData;
        const simboloBase = moneda_base?.observacion || 'BOB';

        let MontoSeleccionado = 0;
        cuotasDetalle.forEach(c => {
            if (this.state.selectedCuotas[c.numero] && c.estadoReal !== 'Pagado') {
                MontoSeleccionado += c.saldo_base;
            }
        });
        MontoSeleccionado = MontoSeleccionado.toFixed(2);

        const selectedCuotas = cuotasDetalle.filter(c => this.state.selectedCuotas[c.numero] && c.estadoReal !== 'Pagado');
        const isAnySelected = selectedCuotas.length > 0;

        // bolivia
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

                            SelectTipoPagoVenta.openPopup({
                                key_punto_venta: activa.key_punto_venta,
                                key_moneda: moneda_base.key,
                                montoMaximo: MontoSeleccionado,
                                monedaSymbol: simboloBase,
                                onSelect: (item) => {
                                    // const cuotasData = selectedCuotas.map(({ key, key_moneda, monto, monto_base }) => ({
                                    //     key,
                                    //     key_moneda,
                                    //     monto_extranjera: monto.toFixed(2),
                                    //     monto_nacional: monto_base.toFixed(2)
                                    // }));
                                    // const cuotasData = selectedCuotas.map(cuota => cuota.key);
                                    const cuotasData = selectedCuotas.map((cuota: any) => cuota.key);
                                    const enviar = { tipos_pago: item, cuotas: cuotasData };

                                    console.log("pintando " + JSON.stringify(enviar))

                                    SSocket.sendPromise({
                                        service: "caja",
                                        component: "caja_detalle",
                                        type: "amortizarCuotaCompra",
                                        data: enviar,
                                        key_usuario: MDL.usuario.session?.key,
                                        key_empresa: MDL.empresa.select?.key,
                                        key_caja: MDL.caja.activa?.key,
                                    }).then(resp => {
                                        if (resp?.estado === "exito") {
                                            SNotification.send({ title: "Éxito", body: "Pago registrado.", color: STheme.color.success, time: 3000 });
                                            // this.props.onSuccess?.();
                                            if (this.props.onSuccess) this.props.onSuccess(resp)
                                            SelectTipoPagoVenta.closePopup();
                                        }
                                    }).catch(err => {
                                        SNotification.send({ title: 'Error', body: "dd" + err?.message || 'Falló el pago.', color: STheme.color.danger });
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

        const { cuotasDetalle } = this.compraData;
        const filteredCuotas = cuotasDetalle.filter(c => {
            if (c.estadoReal === 'Pagado') return this.state.showPaidCuotas;
            if (c.estadoReal === 'Vencido') return true;
            return this.state.showAllPendingCuotas || c.numero <= 2;
        });

        const hasPaidCuotas = cuotasDetalle.some(c => c.estadoReal === 'Pagado');
        const hasMoreThanTwoFuturePending = cuotasDetalle.some(c => c.estadoReal === 'Pendiente' && c.numero > 2);
        const paddingBottom = filteredCuotas.length <= 1 ? 240 : 320;

        return (
            <SView col={'xs-12'} flex>
                <ScrollView style={{ width: '100%' }} contentContainerStyle={{ flexGrow: 1, paddingBottom }}>
                    {this.cabecera()}
                    <SHr h={12} />
                    <SView col={'xs-12'} style={{ paddingHorizontal: 16 }}>
                        {filteredCuotas.length > 0 ? (
                            filteredCuotas.map(cuota => (
                                <this.Item key={`cuota-${cuota.numero}`} cuota={cuota} />
                            ))
                        ) : (
                            <SText center fontSize={14} color={COLOR_TEXT} style={{ padding: 16 }}>
                                No hay cuotas para mostrar.
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
                                    {this.state.showPaidCuotas ? '- Pagadas' : '+ Pagadas'}
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