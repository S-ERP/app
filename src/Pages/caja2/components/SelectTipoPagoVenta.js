import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import { SHr, SLoad, SMath, SPopup, SText, STheme, SView } from 'servisofts-component';
import SInput2 from '../../../Components/SForm2/SInput2';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';

type SelectTipoPagoVentaProps = {
    key_punto_venta: string,
    solo_para_caja: boolean,
    montoMaximo?: Number,
    montoMaximoPorTipo?: { [key: string]: number },
    key_moneda?: string,
    venta?: boolean,
    compra?: boolean,
    onSelect?: (item: any) => void
}

export default class SelectTipoPagoVenta extends Component<SelectTipoPagoVentaProps> {
    static openPopup(props: SelectTipoPagoVentaProps) {
        SPopup.open({
            key: "SelectTipoPagoVenta",
            type: "1",
            content: <SView style={{
                width: 400,
                maxWidth: "95%",
                // height: "85%",
                // maxHeight: 520,
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "default",
                userSelect: "text",
            }} withoutFeedback>
                <SelectTipoPagoVenta {...props} />
            </SView>
        })
    }

    static closePopup() {
        SPopup.close("SelectTipoPagoVenta")
    }

    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            loading: false,
        };
        this._mounted = false;
        this.pvtp = [];
    }

    handleKeyDown = (e) => {
        if (e.key === "Escape") SPopup.close("SelectTipoPagoVenta");
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
        return <SView style={{ padding: 4, maxWidth: 150, }} col={"xs-6 sm-4"} colSquare>
            <SView style={{
                width: "100%", height: "100%", borderWidth: 1,
                borderColor: select ? STheme.color.success : STheme.color.card,
                borderRadius: 8,
                padding: 4,
                alignItems: "center"
            }} onPress={() => {
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
            }}>
                {!select && <>
                    <View style={{ width: "50%", height: "50%", padding: 5 }}>
                        <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                    </View>
                    <SView col={"xs-12"} center row backgroundColor={STheme.color.card} padding={2}
                        style={{ bottom: 0, position: "absolute", minHeight: 52, overflow: "hidden", borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                        <SView col={"xs-12"} backgroundColor={"transparent"}>
                            <SText key={item.key_tipo_pago} col={"xs-12"} numberOfLines={2} style={{ textAlign: "center" }}>{item?.descripcion}</SText>
                        </SView>
                        <SText key={item.key_tipo_pago} col={"xs-12"} style={{ textAlign: "center", textTransform: "uppercase" }} fontSize={12} color={STheme.color.lightGray}>{item?.moneda?.descripcion}</SText>
                    </SView>
                </>}
                {select && <>
                    <SView row col={"xs-12"} style={{ alignItems: "center" }}>
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
                        <SView col={"xs-12"} withoutFeedback>
                            <SView width={"100%"} row center style={{ backgroundColor: STheme.color.card, borderRadius: 2, paddingHorizontal: 1, height: 32, justifyContent: "center" }}>
                                <SText style={{ marginRight: 2 }}> {item?.moneda?.observacion ?? "BS"} </SText>
                                <SView flex row>
                                    <SInput2 ref={ref => item.__ref = ref} autoFocus name={`monto_${item.key}`} type="money"
                                        style={{ width: "100%", textAlign: "right", paddingRight: 4, fontSize: 14 }}
                                        defaultValue={String(MDL.contabilidad.round(parseFloat(item.monto ?? "0") / parseFloat(item.moneda?.tipo_cambio ?? 1)))}
                                        onChangeText={(e) => {
                                            const val = parseFloat(e) || 0;
                                            item.monto = val;
                                            if (val > 0) {
                                                item.monto = MDL.contabilidad.round(val * parseFloat(item.moneda?.tipo_cambio ?? 1))
                                                if (item.__ref_extranjera) {
                                                    item.__ref_extranjera.setValue(item.monto);
                                                }
                                            }
                                            this.forceUpdate();
                                        }}
                                    />
                                </SView>
                            </SView>
                            <SHr />
                            {(item?.moneda?.tipo_cambio != 1) &&
                                <SView width={"100%"} row center style={{ backgroundColor: STheme.color.card, borderRadius: 2, paddingHorizontal: 1, height: 32, justifyContent: "center" }}>
                                    <SText style={{ marginRight: 2 }}> {this.moneda_base?.observacion} </SText>
                                    <SView flex row>
                                        <SInput2 ref={ref => item.__ref_extranjera = ref} autoFocus name={`monto_extranjera_${item.key}`} type="money"
                                            style={{ width: "100%", textAlign: "right", paddingRight: 4, fontSize: 14 }}
                                            defaultValue={String(parseFloat(item.monto ?? "0"))}
                                        />
                                    </SView>
                                </SView>
                            }
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
        return MDL.contabilidad.round(montoTotal / (this.moneda?.tipo_cambio ?? 1));
    }

    calcularMontoInsertado() {
        return SMath.formatMoney(this.calcularMontoInsertadoNum());
    }

    render() {
        const montoAPagar = Number(this.props.montoMaximo ?? 0) / Number(this.moneda?.tipo_cambio ?? 1);
        const obs = this.moneda?.observacion ?? "Bs";
        const montoInsertadoNum = this.calcularMontoInsertadoNum();
        const selecteds = this.pvtp.filter(a => !!a.__select);
        const nada = selecteds.length === 0;
        const diff = MDL.contabilidad.round(montoInsertadoNum - montoAPagar);
        const puedeConfirmar = !nada && Math.abs(diff) <= 0.001;
        const statusColor = nada ? STheme.color.gray
            : diff < -0.001 ? "#dc3545"
            : diff > 0.001 ? "#e6a817"
            : "#198754";
        const statusMsg = nada
            ? "Seleccione un tipo de pago"
            : diff < -0.001
                ? `Falta: ${obs} ${SMath.formatMoney(Math.abs(diff))}`
                : diff > 0.001
                    ? `Vuelto: ${obs} ${SMath.formatMoney(diff)}`
                    : "✓ Monto exacto";

        return (
            <SView col={"xs-12"} height>
                {/* Header */}
                <SView row style={{ backgroundColor: "#198754", paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" }}>
                    <SText fontSize={16} bold color={STheme.color.text}>{"Tipo de Pago"}</SText>
                    <SView flex />
                    <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#dc3545", justifyContent: "center", alignItems: "center" }}
                        onPress={() => SelectTipoPagoVenta.closePopup()}>
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>

                {/* Monto cards */}
                {this.props.montoMaximo != null && (
                    <>
                        <SView row style={{ padding: 8, paddingBottom: 4, gap: 8 }}>
                            <SView flex style={{ backgroundColor: STheme.color.card, borderRadius: 8, padding: 10, alignItems: "center" }}>
                                <SText fontSize={12} color={STheme.color.lightGray}>{"Monto a Pagar"}</SText>
                                <SText bold fontSize={16}>{obs}{" "}{SMath.formatMoney(montoAPagar)}</SText>
                                <SText fontSize={11} color={STheme.color.lightGray}>{this.moneda?.descripcion}</SText>
                            </SView>
                            <SView flex style={{ backgroundColor: STheme.color.card, borderRadius: 8, padding: 10, alignItems: "center", borderWidth: 2, borderColor: statusColor }}>
                                <SText fontSize={12} color={STheme.color.lightGray}>{"Monto Insertado"}</SText>
                                <SText bold fontSize={16} color={statusColor}>{obs}{" "}{SMath.formatMoney(montoInsertadoNum)}</SText>
                                <SText fontSize={11} color={STheme.color.lightGray}>{this.moneda?.descripcion}</SText>
                            </SView>
                        </SView>
                        <SView style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
                            <SView style={{ backgroundColor: statusColor + "22", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, alignItems: "center" }}>
                                <SText bold fontSize={13} color={statusColor}>{statusMsg}</SText>
                            </SView>
                        </SView>
                    </>
                )}





                <SHr />

                {/* Payment grid */}
                <ScrollView style={{ flex: 1 }}>
                    {this.state.ready
                        ? (
                            <SView row style={{ justifyContent: "space-around", alignItems: "center", flexWrap: "wrap", padding: 8 }}>
                                {this.pvtp.map((item) => this.renderItemTipoPago(item))}
                            </SView>
                        )
                        : (
                            <SView style={{ padding: 32, alignItems: "center", justifyContent: "center" }}>
                                <SLoad />
                            </SView>
                        )
                    }
                </ScrollView>

                <SHr />
                <SHr />
                <SHr />

                {/* Footer */}
                <SView style={{ backgroundColor: "#1e222b", borderTopWidth: 1, borderTopColor: "#434c5d", padding: 12 }}>
                    <SView row style={{ gap: 12 }}>
                        <SView flex style={{ backgroundColor: "#dc3545", borderRadius: 6, paddingVertical: 10, alignItems: "center", justifyContent: "center" }}
                            onPress={() => {
                                if (!this.state.loading) SelectTipoPagoVenta.closePopup();
                            }}>
                            <SText bold color={STheme.color.text}>{"Cancelar"}</SText>
                        </SView>
                        <SView flex style={{ backgroundColor: "#198754", borderRadius: 6, paddingVertical: 10, alignItems: "center", justifyContent: "center", opacity: puedeConfirmar ? 1 : 0.45 }}
                            onPress={async () => {
                                if (this.state.loading || !puedeConfirmar) return;
                                const elm = {};
                                let montoTotal = 0;
                                selecteds.forEach(item => {
                                    elm[item.key] = {
                                        monto_nacional: MDL.contabilidad.round(parseFloat(item.monto)),
                                        monto_extranjera: MDL.contabilidad.round((parseFloat(item.monto) / parseFloat(item.moneda?.tipo_cambio ?? 1))),
                                        tipo_pago: item.tipo_pago
                                    }
                                    montoTotal += parseFloat(item.monto)
                                });
                                this.setState({ loading: true });
                                try {
                                    if (this.props.onSelect) {
                                        await this.props.onSelect(elm);
                                    }
                                } finally {
                                    if (this._mounted) {
                                        this.setState({ loading: false });
                                    }
                                }
                            }}>
                            {this.state.loading ? <SLoad /> : <SText bold color={STheme.color.text}>{"Aceptar"}</SText>}
                        </SView>
                    </SView>
                </SView>

                {this.state.loading && (
                    <SView style={{
                        position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        justifyContent: "center", alignItems: "center", zIndex: 999,
                    }}>
                        <SLoad />
                    </SView>
                )}
            </SView>
        );
    }
}
