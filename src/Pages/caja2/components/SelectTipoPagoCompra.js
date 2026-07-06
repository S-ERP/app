import React, { Component } from 'react';
import { View, SectionList } from 'react-native';
import { SHr, SInput, SLoad, SMath, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';
import PagarConPasarela from '../../pasarela/Components/PagarConPasarela';
import SInput2 from '../../../Components/SForm2/SInput2';
type SelectTipoPagoCompraProps = {
    key_punto_venta: string,
    solo_para_caja: boolean,
    montoMaximo?: Number,
    montoMaximoPorTipo?: { [key: string]: number },
    key_moneda?: string,
    compra?: boolean,
    venta?: boolean,
    color?: string,
    onSelect?: (item: any) => void | Promise<void>
}
// alvaro tengo que trabajar en que no permita 2 bveces registar porque eso es un bug
export default class SelectTipoPagoCompra extends Component<SelectTipoPagoCompraProps> {
    static openPopup(props: SelectTipoPagoCompraProps) {
        SPopup.open({
            key: "SelectTipoPagoCompra",
            type: "1",
            content: <SView style={{
                width: 380,
                maxWidth: "95%",
                height: 600,
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "default",
                userSelect: "text",
            }} withoutFeedback>
                <SelectTipoPagoCompra {...props} />
            </SView>
        })
    }
    static closePopup() { SPopup.close("SelectTipoPagoCompra") }
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            loading: false,
        };
        this._mounted = false;
        this._submitting = false;
        this.pvtp = [];
    }
    handleKeyDown = (e) => {
        if (e.key === "Escape") SPopup.close("SelectTipoPagoCompra");
    }
    componentDidMount() {
        this._mounted = true;
        this.loadData();
        globalThis.document?.addEventListener("keydown", this.handleKeyDown);
    }
    componentWillUnmount() {
        this._mounted = false;
        globalThis.document?.removeEventListener("keydown", this.handleKeyDown);
    }
    async loadData() {
        this.tipo_pago = await MDL.caja.tipo_pago_getAll()
        const data = await MDL.empresa.getFull()
        const cuentas = await MDL.contabilidad.getCuentasCache();
        this.moneda = data.monedas.find(a => a.key == this.props.key_moneda);
        this.moneda_base = data.monedas.find(a => a.tipo == "base");
        const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: this.props.key_punto_venta })
        this.pvtp = Object.values(empresa_tipo_pago)
        if (!this.pvtp) this.pvtp = [];
        this.pvtp = this.pvtp.map(item => {
            item.cuenta = cuentas[item.key_cuenta_contable]
            const moneda = data.monedas.find(a => a.key == item?.cuenta?.key_moneda);
            item.moneda = moneda ?? this.moneda_base;
            item.tipo_pago = this.tipo_pago[item.key_tipo_pago];
            item.monto = MDL.contabilidad.round(this.props.montoMaximo ?? 0)
            if (this.props.montoMaximoPorTipo && this.props.montoMaximoPorTipo[item.key_tipo_pago]) {
                item.monto = this.props.montoMaximoPorTipo[item.key_tipo_pago];
            }
            return { ...item };
        });
        if (this.props.solo_para_caja) {
            this.pvtp = this.pvtp.filter(a => a.tipo_pago?.pasa_por_caja);
        }
        if (this.props.venta) {
            this.pvtp = this.pvtp.filter(a => !!a?.habilita_venta);
        }
        if (this.props.compra) {
            this.pvtp = this.pvtp.filter(a => !!a?.habilita_compra);
        }
        this.pvtp.sort((a, b) => {
            return a.tipo_pago?.orden - b.tipo_pago?.orden
        })
        this.setState({ ready: true });
    }
    renderItemTipoPago(item) {
        const select = item.__select
        return <SView style={{ padding: 4, }} col={"xs-12"}>
            <SView style={{ borderWidth: 1, borderColor: select ? STheme.color.success : STheme.color.card, borderRadius: 8, overflow: "hidden", alignItems: "center" }}
                onPress={() => {
                    item.__select = !item.__select;
                    const selecteds = this.pvtp.filter(a => !!a.__select);
                    if (!this.props.montoMaximoPorTipo) {
                        let remainingCents = Math.round((this.props.montoMaximo || 0) * 100);
                        selecteds.forEach((pv, index) => {
                            let montoCents;
                            if (index === selecteds.length - 1) {
                                montoCents = remainingCents;
                            } else {
                                montoCents = Math.round((this.props.montoMaximo || 0) / selecteds.length * 100);
                                remainingCents -= montoCents;
                            }
                            const montoNacional = montoCents / 100;
                            if (pv.__ref) {
                                pv.__ref.setValue(Math.round((montoNacional / (pv.moneda?.tipo_cambio || 1)) * 100) / 100);
                            }
                            pv.monto = montoNacional;
                        });
                    }
                    this.forceUpdate();
                }} row>
                {!select && <>
                    <View style={{ width: 50, height: 50 }}>
                        <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                    </View>
                    <SView flex center backgroundColor={STheme.color.card} style={{ minHeight: 52, overflow: "hidden", borderBottomRightRadius: 6, paddingStart: 10 }}>
                        <SView col={"xs-12"} backgroundColor={"transparent"}>
                            <SText key={item.key_tipo_pago} col={"xs-12"} numberOfLines={2} style={{ textAlign: "justify" }}>{item?.descripcion}</SText>
                        </SView>
                        <SHr />
                        <SText key={item.key_tipo_pago} col={"xs-12"} style={{ textAlign: "justify", textTransform: "uppercase" }} fontSize={12} color={STheme.color.lightGray}>{item?.moneda?.descripcion}</SText>
                    </SView>
                </>}
                {select && <>
                    <SView row col={"xs-12"} style={{ alignItems: "center", padding: 4 }} flex center>
                        <View style={{ width: 22, height: 22 }}>
                            <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                        </View>
                        <SView width={4} />
                        <SView flex>
                            <SText key={item.key_tipo_pago} numberOfLines={2} fontSize={12} style={{ textTransform: "uppercase" }}>{item.tipo_pago ? item.descripcion : item.key_tipo_pago}</SText>
                            <SText key={item.key_tipo_pago} fontSize={12} color={STheme.color.lightGray}>{item?.moneda?.descripcion}</SText>
                        </SView>
                    </SView>
                    <SView flex col={"xs-12"} center>
                        <SView col={"xs-12"} withoutFeedback center style={{ paddingTop: 5, paddingRight: 2 }}>
                            <SView width={"100%"} row center style={{ backgroundColor: STheme.color.card, borderRadius: 2, paddingHorizontal: 1, height: 32, justifyContent: "center" }}>
                                <SText style={{ marginRight: 2 }}> {item?.moneda?.observacion ?? "BS"} </SText>
                                <SView flex row>
                                    <SInput2 ref={ref => item.__ref = ref} autoFocus name={`monto_${item.key}`} type="money"
                                        style={{ width: "100%", textAlign: "right", fontSize: 14, paddingRight: 4 }}
                                        defaultValue={String(MDL.contabilidad.round(parseFloat(item.monto ?? "0") / parseFloat(item.moneda?.tipo_cambio || 1)))}
                                        onChangeText={(e) => {
                                            const val = parseFloat(e) || 0;
                                            item.monto = val;
                                            if (val > 0) {
                                                item.monto = MDL.contabilidad.round(val * parseFloat(item.moneda?.tipo_cambio || 1))
                                                if (item.__ref_extranjera) {
                                                    item.__ref_extranjera.setValue(item.monto);
                                                }
                                            }
                                            this.forceUpdate();
                                        }}
                                    />
                                </SView>
                                <SView style={{ paddingRight: 8, paddingLeft: 1 }} row center onPress={() => {
                                    const totalSinEste = MDL.contabilidad.round(this.calcularMontoInsertadoBase() - item.monto);
                                    const falta = MDL.contabilidad.round(Number(this.props.montoMaximo ?? 0) - totalSinEste);
                                    item.monto = falta;
                                    if (item.__ref) {
                                        item.__ref.setValue(MDL.contabilidad.round(falta / (item.moneda?.tipo_cambio || 1)));
                                    }
                                    if (item.__ref_extranjera) {
                                        item.__ref_extranjera.setValue(falta);
                                    }
                                    this.forceUpdate();
                                }} >
                                    <SIconApp name='Reload' width={10} height={10} fill={STheme.color.text} />
                                </SView>
                            </SView>
                            <SHr />
                            {(item?.moneda?.tipo_cambio != 1) &&
                                <SView width={"100%"} row center style={{ backgroundColor: STheme.color.card, borderRadius: 2, paddingHorizontal: 1, height: 32, justifyContent: "center" }}>
                                    <SText style={{ marginRight: 2 }}>{this.moneda_base?.observacion}</SText>
                                    <SView flex row>
                                        <SInput2 ref={ref => item.__ref_extranjera = ref} name={`monto_extranjera_${item.key}`} type="money"
                                            style={{ width: "100%", textAlign: "right", fontSize: 14, paddingRight: 4 }}
                                            defaultValue={String(parseFloat(item.monto ?? "0"))}
                                        />
                                    </SView>
                                </SView>
                            }
                            <SHr height={2} />
                            <SView width={"100%"} row center style={{ backgroundColor: STheme.color.card, borderRadius: 2, paddingHorizontal: 1, height: 32, justifyContent: "center" }}>
                                <SText style={{ marginRight: 0, paddingLeft: 2 }} >REF:</SText>
                                <SView flex row center >
                                    <SInput placeholder="Referencia / Descripción"
                                        style={{ height: 32, fontSize: 14, backgroundColor: STheme.color.card + "66", paddingLeft: 2 }}
                                        defaultValue={item.referencia || ""}
                                        onChangeText={(e) => { item.referencia = e; }} />
                                </SView>
                            </SView>
                            {item.key_pasarela_empresa && (
                                <SView style={{ marginTop: 6, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: STheme.color.card, borderRadius: 4, alignSelf: "flex-end" }}
                                    onPress={() => PagarConPasarela.open({ key_pasarela_empresa: item.key_pasarela_empresa, monto: item.monto })}>
                                    <SText fontSize={11} color={STheme.color.lightGray}>{"Pagar con pasarela"}</SText>
                                </SView>
                            )}
                        </SView>
                    </SView>
                </>}
            </SView>
        </SView>
    }
    calcularMontoInsertadoNum() {
        let montoTotal = 0;
        const selecteds = this.pvtp.filter(a => !!a.__select);
        selecteds.forEach(item => { montoTotal += parseFloat(item.monto) });
        return MDL.contabilidad.round(montoTotal / (this.moneda?.tipo_cambio || 1));
    }
    calcularMontoInsertadoBase() {
        let montoTotal = 0;
        const selecteds = this.pvtp.filter(a => !!a.__select);
        selecteds.forEach(item => { montoTotal += parseFloat(item.monto) });
        return MDL.contabilidad.round(montoTotal);
    }
    calcularMontoInsertado() {
        return SMath.formatMoney(this.calcularMontoInsertadoNum());
    }
    agruparPorMoneda(lista) {
        const grupos = {};
        lista.forEach(item => {
            const key = item.key_moneda;
            const descripcion = item.moneda?.descripcion || "Sin moneda";
            if (!grupos[key]) {
                grupos[key] = { title: descripcion, key_moneda: key, data: [] };
            }
            grupos[key].data.push(item);
        });
        return Object.values(grupos);
    }
    render() {

        const a = this.props.key_punto_venta;
        const b = this.props.montoMaximo;
        const c = this.props.key_moneda;
        const d = this.props.solo_para_caja;
        const e = this.props.venta;

        console.log("azuki")
        console.log(a);
        console.log(b);
        console.log(c);
        console.log(d);
        console.log(e);

        const montoAPagar = Number(this.props.montoMaximo ?? 0) / Number(this.moneda?.tipo_cambio || 1);
        const obs = this.moneda?.observacion ?? "Bs";
        const montoInsertadoNum = this.calcularMontoInsertadoNum();
        const selecteds = this.pvtp.filter(a => !!a.__select);
        const nada = selecteds.length === 0;
        const diff = MDL.contabilidad.round(montoInsertadoNum - montoAPagar);
        const puedeConfirmar = !nada && Math.abs(diff) <= 0.001;
        const statusColor = nada ? STheme.color.gray : diff < -0.001 ? "#dc3545" : diff > 0.001 ? "#e6a817" : "#198754";
        const diffBase = MDL.contabilidad.round(this.calcularMontoInsertadoBase() - Number(this.props.montoMaximo ?? 0));
        const obsBase = this.moneda_base?.observacion ?? "Bs";
        const statusMsg = nada ? "Seleccione un tipo de pago" : diffBase < -0.001 ? `Falta: ${obsBase} ${SMath.formatMoney(Math.abs(diffBase))}` : diffBase > 0.001 ? `Vuelto: ${obsBase} ${SMath.formatMoney(diffBase)}` : "✓ Monto exacto";
        const headerColor = this.props.compra ? "#a046e8" : "#198754";
        return (
            <SView col={"xs-12"} height>
                <SView row style={{ backgroundColor: headerColor, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" }}>
                    <SText fontSize={16} bold color={STheme.color.text}>{"Tipo de Pago"}</SText>
                    <SView flex />
                    <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#dc3545", justifyContent: "center", alignItems: "center" }}
                        onPress={() => SelectTipoPagoCompra.closePopup()}>
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>
                {this.props.montoMaximo != null && (
                    <>
                        <SView row style={{ padding: 8, paddingBottom: 4, gap: 8 }}>
                            <SView flex style={{ backgroundColor: STheme.color.card, borderRadius: 8, padding: 10, alignItems: "center" }}>
                                <SText fontSize={12} color={STheme.color.lightGray}>{"Monto a Pagar"}</SText>
                                <SText bold fontSize={16}>{this.moneda_base?.observacion ?? "Bs"}{" "}{SMath.formatMoney(MDL.contabilidad.round(Number(this.props.montoMaximo ?? 0)))}</SText>
                                {this.moneda?.tipo != "base" && (
                                    <SText fontSize={11} color={STheme.color.lightGray}>{obs}{" "}{SMath.formatMoney(montoAPagar)}{" · "}{this.moneda?.descripcion}</SText>
                                )}
                            </SView>
                            <SView flex style={{ backgroundColor: STheme.color.card, borderRadius: 8, padding: 10, alignItems: "center", borderWidth: 2, borderColor: statusColor }}>
                                <SText fontSize={12} color={STheme.color.lightGray}>{"Monto Insertado"}</SText>
                                <SText bold fontSize={16} color={statusColor}>{this.moneda_base?.observacion ?? "Bs"}{" "}{SMath.formatMoney(this.calcularMontoInsertadoBase())}</SText>
                                {this.moneda?.tipo != "base" && (
                                    < SText fontSize={11} color={STheme.color.lightGray}>{obs}{" "}{SMath.formatMoney(montoInsertadoNum)}{" · "}{this.moneda?.descripcion}</SText>
                                )}
                            </SView>
                        </SView>
                        <SView style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
                            <SView style={{ backgroundColor: statusColor + "22", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, alignItems: "center" }}>
                                <SText bold fontSize={13} color={statusColor}>{statusMsg}</SText>
                                {this.moneda?.tipo != "base" && Math.abs(diffBase) > 0.001 && (
                                    <SText fontSize={11} color={statusColor}>{obs}{" "}{SMath.formatMoney(Math.abs(diff))}{" · "}{this.moneda?.descripcion}</SText>
                                )}
                            </SView>
                        </SView>
                    </>
                )}
                <SHr />
                {
                    this.state.ready
                        ? (
                            <SectionList
                                style={{ flex: 1, paddingHorizontal: 4 }}
                                sections={this.agruparPorMoneda(this.pvtp)}
                                keyExtractor={(item, index) => item.key + "_" + index}
                                renderSectionHeader={({ section }) => (
                                    <SView style={{ paddingTop: 8, paddingBottom: 2, paddingLeft: 8, backgroundColor: STheme.color.background }}>
                                        <SText bold fontSize={14} color={STheme.color.lightGray}>{section.title}</SText>
                                    </SView>
                                )}
                                renderItem={({ item }) => this.renderItemTipoPago(item)}
                            />
                        )
                        : (
                            <SView style={{ flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }}>
                                <SLoad />
                            </SView>
                        )
                }
                <SHr />
                <SView style={{ backgroundColor: "#1e222b", borderTopWidth: 1, borderTopColor: "#434c5d", padding: 12 }}>
                    <SView row style={{ gap: 12 }}>
                        <SView flex style={{ backgroundColor: "#dc3545", borderRadius: 6, paddingVertical: 10, alignItems: "center", justifyContent: "center" }}
                            onPress={() => {
                                if (!this.state.loading) SelectTipoPagoCompra.closePopup();
                            }}>
                            <SText bold color={STheme.color.text}>{"Cancelar"}</SText>
                        </SView>
                        <SView flex style={{
                            backgroundColor: headerColor, borderRadius: 6, paddingVertical: 10, alignItems: "center", justifyContent: "center",

                            opacity: (puedeConfirmar && !this.state.loading) ? 1 : 0.45
                        }}
                            onPress={(this.state.loading || !puedeConfirmar) ? undefined : async () => {
                                if (this._submitting) return;
                                this._submitting = true;
                                let montoTotal = 0;
                                const elm = {};
                                selecteds.forEach(item => {
                                    elm[item.key] = {
                                        monto_nacional: MDL.contabilidad.round(parseFloat(item.monto)),
                                        monto_extranjera: MDL.contabilidad.round((parseFloat(item.monto) / parseFloat(item.moneda?.tipo_cambio || 1))),
                                        tipo_pago: item.tipo_pago,
                                        referencia: item.referencia ? "Ref: " + item.referencia : "",
                                        descripcion: item.descripcion || "",
                                    }
                                    montoTotal += parseFloat(item.monto)
                                });

                                this.setState({ loading: true });

                                await new Promise(resolve => requestAnimationFrame(resolve));

                                try {
                                    if (this.props.onSelect) {
                                        await this.props.onSelect(elm);
                                    }
                                } finally {
                                    this._submitting = false;
                                    if (this._mounted) {
                                        this.setState({ loading: false });
                                    }
                                }
                            }}>
                            {this.state.loading ? <SLoad /> : <SText bold color={STheme.color.text}>{"Aceptar"}</SText>}
                        </SView>
                    </SView>
                </SView>
                {
                    this.state.loading && (
                        <SView style={{
                            position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.25)",
                            justifyContent: "center", alignItems: "center", zIndex: 999,
                        }}>
                            <SLoad />
                        </SView>
                    )
                }
            </SView >
        );
    }
}
