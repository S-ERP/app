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
            content: <SView style={{ width: 400, maxHeight: "100%", backgroundColor: STheme.color.background, borderRadius: 8, cursor: "default", userSelect: "text", }} withoutFeedback>
                <ScrollView style={{ flex: 1, }}>
                    <SelectTipoPagoVenta {...props} />
                </ScrollView>
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

    componentDidMount() {
        this._mounted = true;
        this.loadData();
    }

    componentWillUnmount() {
        this._mounted = false;
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
        return <SView style={{ padding: 4, maxWidth: 150, }} col={"xs-6 sm-4"} colSquare> <SView style={{
            width: "100%", height: "100%", borderWidth: 1,
            borderColor: select ? STheme.color.success : STheme.color.card,
            borderRadius: 8,
            padding: 4,
            alignItems: "center"
        }} onPress={() => {
            item.__select = !item.__select;
            const selecteds = this.pvtp.filter(a => !!a.__select);
            if (!this.props.montoMaximoPorTipo) {
                let total = 0;
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
                    total += montoNacional;
                    if (pv.__ref) {
                        pv.__ref.setValue(Math.round((montoNacional / (pv.moneda?.tipo_cambio || 1)) * 100) / 100);
                    }
                    pv.monto = montoNacional;
                });
            }
            this.forceUpdate();
        }}>
            {!select && <>
                <View style={{
                    width: "50%",
                    height: "50%",
                    padding: 5
                }}>
                    <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                </View>
                <SView col={"xs-12"} center row backgroundColor={STheme.color.card} padding={2} style={{ bottom: 0, position: "absolute", minHeight: 52, overflow: "hidden", borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }}>
                    <SView col={"xs-12"} backgroundColor={"transparent"}  >
                        <SText key={item.key_tipo_pago} col={"xs-12"} numberOfLines={2} style={{ textAlign: "center" }}>{item?.descripcion}</SText>
                    </SView>
                    <SText key={item.key_tipo_pago} col={"xs-12"} style={{ textAlign: "center", textTransform: "uppercase" }} fontSize={12} color={STheme.color.lightGray}>{(item?.moneda?.descripcion)}</SText>
                </SView>
            </>}
            {select && <>
                <SView row col={"xs-12"} style={{
                    alignItems: "center"
                }}>
                    <View style={{ width: 22, height: 22, }}>
                        <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                    </View>
                    <SView width={4} />
                    <SView flex>
                        <SText key={item.key_tipo_pago} numberOfLines={2} fontSize={12} style={{ textTransform: "uppercase" }} >{item.tipo_pago ? item.descripcion : item.key_tipo_pago}</SText>
                        <SText key={item.key_tipo_pago} fontSize={12} color={STheme.color.lightGray}>{item?.moneda?.descripcion}</SText>
                    </SView>
                </SView>
                <SView flex col={"xs-12"} center >
                    <SView col={"xs-12"} withoutFeedback>
                        <SView width={"100%"} row center style={{ backgroundColor: STheme.color.card, borderRadius: 2, paddingHorizontal: 1, height: 32, justifyContent: "center", }} >
                            <SText style={{ marginRight: 2 }}> {item?.moneda?.observacion ?? "BS"} </SText>
                            <SView flex row>
                                <SInput2 ref={ref => item.__ref = ref} autoFocus name={`monto_${item.key}`} type="money" style={{ width: "100%", textAlign: "right", paddingRight: 0, fontSize: 14, paddingRight: 4 }}
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
                            <SView width={"100%"} row center style={{ backgroundColor: STheme.color.card, borderRadius: 2, paddingHorizontal: 1, height: 32, justifyContent: "center", }} >
                                <SText style={{ marginRight: 2 }}> {this.moneda_base?.observacion} </SText>
                                <SView flex row>
                                    <SInput2 ref={ref => item.__ref_extranjera = ref} autoFocus name={`monto_extranjera_${item.key}`} type="money" style={{ width: "100%", textAlign: "right", paddingRight: 4, fontSize: 14 }}
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

    calcularMontoInsertado() {
        let montoTotal = 0;
        const selecteds = this.pvtp.filter(a => !!a.__select);
        selecteds.forEach(item => {
            montoTotal += parseFloat(item.monto)
        });
        const enMoneda = MDL.contabilidad.round(montoTotal / (this.moneda?.tipo_cambio ?? 1));
        return SMath.formatMoney(enMoneda);
    }

    montoPagar(valor) {
        return SMath.formatMoney(valor);
    }

    render() {
        const montoAPagar =
            Number(this.props.montoMaximo ?? 0) /
            Number(this.moneda?.tipo_cambio ?? 1);
        return <SView col={"xs-12"} padding={6} flex>
            <SView col={"xs-12"} row style={{ padding: 2 }}>
                {this.props.montoMaximo && <>
                    <SView flex padding={4} style={{
                        alignItems: "center",
                    }} card>
                        <SText fontSize={15} color={STheme.color.lightGray}>{"Monto a Pagar: "}</SText>
                        <SView width={4} />
                        <SText bold fontSize={18}>
                            {this.moneda?.observacion} {SMath.formatMoney(montoAPagar)}
                        </SText>
                        <SView width={16} />
                        <SText>{this.moneda?.descripcion}</SText>
                    </SView>
                </>}
                <SView col={"xs-0.5"} />
                <SView flex padding={4} style={{
                    alignItems: "center",
                }} card>
                    <SText fontSize={15} color={STheme.color.lightGray}>{"Monto Insertado: "}</SText>
                    <SView width={4} />
                    <SText bold fontSize={18}>{this.moneda?.observacion} {this.calcularMontoInsertado()}</SText>
                    <SView width={16} />
                    <SText>{this.moneda?.descripcion}</SText>
                </SView>
            </SView>
            <SView flex />
            <SView height={10} style={{ borderBottomWidth: 3, borderBottomColor: STheme.color.gray }} />
            <SHr h={7} />
            {this.state.ready &&
                <SView row style={{
                    justifyContent: "space-around",
                    alignItems: "center"
                }}>
                    {this.pvtp.map((item, index) => this.renderItemTipoPago(item))}
                </SView>
            }
            <SView height={10} style={{ borderBottomWidth: 3, borderBottomColor: STheme.color.gray }} />
            <SHr h={7} />
            <SView row col={"xs-12"} padding={4} style={{
                justifyContent: "flex-end"
            }}>
                <SText padding={16} onPress={() => {
                    if (this.state.loading) return;
                    SelectTipoPagoVenta.closePopup();
                }} backgroundColor={STheme.color.danger} style={{ borderRadius: 4 }} >{"Cancelar"}</SText>
                <SView width={32} />
                <SText padding={16} card onPress={async () => {
                    if (this.state.loading) return;
                    const selecteds = this.pvtp.filter(a => !!a.__select);
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
                    {this.state.loading ? <SLoad /> : "Aceptar"}
                </SText>
            </SView>
            {this.state.loading && <SView style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.25)",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
            }}>
                <SLoad />
            </SView>}
        </SView>
    }
}