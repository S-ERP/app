import React, { Component } from 'react';
import { View, Text, ScrollView, SectionList } from 'react-native';
import { SHr, SInput, SMath, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';
import PagarConPasarela from '../../pasarela/Components/PagarConPasarela';

type SelectTipoPagoProps = {
    key_punto_venta: string,
    solo_para_caja: boolean,
    montoMaximo?: Number,
    montoMaximoPorTipo?: { [key: string]: number },
    key_moneda?: string,
    onSelect?: (item: any) => void
}




export default class SelectTipoPago extends Component<SelectTipoPagoProps> {
    static openPopup(props: SelectTipoPagoProps) {
        SPopup.open({
            key: "SelectTipoPago",
            type: "1",
            content: <SView style={{
                width: 400,
                // height: 600,
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                cursor: "default",
                userSelect: "text",

            }} withoutFeedback>
                <ScrollView style={{
                    flex: 1,
                }}>
                    <SelectTipoPago {...props} />
                </ScrollView>
            </SView>
        })
    }
    static closePopup() {
        SPopup.close("SelectTipoPago")
    }
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
        };
        this.pvtp = [];
    }

    componentDidMount() {
        this.loadData();

    }

    async loadData() {
        this.tipo_pago = await MDL.caja.tipo_pago_getAll()
        const data = await MDL.empresa.getFull()
        console.log(data);
        const cuentas = await MDL.contabilidad.getCuentasCache();
        // const suc = data.sucursales.find(suc => suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta));
        // const pv = suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta);
        this.moneda = data.monedas.find(a => a.key == this.props.key_moneda);
        this.moneda_base = data.monedas.find(a => a.tipo == "base");
        const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll({ key_punto_venta: this.props.key_punto_venta })
        this.pvtp = Object.values(empresa_tipo_pago)
        if (!this.pvtp) this.pvtp = [];
        // if (this.pvtp.length <= 0) {
        //si no tiene tipos de pago asignados, asignar todos los tipos de pago
        this.pvtp = this.pvtp.map(item => {
            item.cuenta = cuentas[item.key_cuenta_contable]
            const moneda = data.monedas.find(a => a.key == item?.cuenta?.key_moneda);
            item.moneda = moneda ?? this.moneda_base;
            // item.moneda = data.monedas.find(a => a.key == item.key_moneda)
            item.tipo_pago = this.tipo_pago[item.key_tipo_pago];

            item.monto = MDL.contabilidad.round(this.props.montoMaximo ?? 0)
            if (this.props.montoMaximoPorTipo && this.props.montoMaximoPorTipo[item.key_tipo_pago]) {
                item.monto = this.props.montoMaximoPorTipo[item.key_tipo_pago];
            }
            return { ...item };
        });
        // }
        if (this.props.solo_para_caja) {
            this.pvtp = this.pvtp.filter(a => a.tipo_pago?.pasa_por_caja);
        }
        this.pvtp.sort((a, b) => {
            return a.tipo_pago?.orden - b.tipo_pago?.orden
        })
        this.setState({ ready: true });
    }

    renderItemTipoPago(item) {
        console.log("ITEM: ",item)
        const select = item.__select
        return <SView style={{
            padding: 4,
            //maxWidth: 150,
        }} col={"xs-12"} >
            <SView style={{
                // width: "100%",
                // height: "100%",
                borderWidth: 1,
                borderColor: select ? STheme.color.success : STheme.color.card,
                // backgroundColor: this._select[item.key] ? STheme.color.success + "44" : "transparent",
                borderRadius: 8,
                // padding: 4,
                overflow: "hidden",
                // justifyContent: "center",
                alignItems: "center"
            }} onPress={() => {
                item.__select = !item.__select;
                const selecteds = this.pvtp.filter(a => !!a.__select);
                if (!this.props.montoMaximoPorTipo) {
                    // item.monto = this.props.montoMaximoPorTipo[item.key_tipo_pago];
                    let total = 0;
                    selecteds.forEach(pv => {
                        console.log(pv)
                        pv.monto = Math.round(((this.props.montoMaximo || 0) / selecteds.length) * 100) / 100;
                        total += parseFloat(pv.monto);
                        if (pv.__ref) {
                            pv.__ref.setValue(Math.round((pv.monto / pv.moneda.tipo_cambio) * 100) / 100);
                        }
                    });

                    // if (total != this.props.montoMaximo) {
                    // Ajuste por tipo cambio
                }

                this.forceUpdate();
            }} row>
                {!select && <>
                    <View style={{
                        // width: "50%",
                        // height: "50%",
                        width: 50,
                        height: 50,
                        // justifyContent: "center",
                        // alignItems: "center",
                        // padding: 5

                    }} center>
                        <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                    </View>
                    <SView flex center backgroundColor={STheme.color.card} style={{ minHeight: 52, overflow: "hidden", borderBottomRightRadius: 6, paddingStart: 10 }}>
                        <SView col={"xs-12"} backgroundColor={"transparent"}  >
                            <SText key={item.key_tipo_pago} col={"xs-12"} numberOfLines={2} style={{ textAlign: "justify" }}>{item?.descripcion}</SText>
                        </SView>
                        <SHr />
                        <SText key={item.key_tipo_pago} col={"xs-12"} style={{ textAlign: "justify", textTransform: "uppercase" }} fontSize={12} color={STheme.color.lightGray}>{(item?.moneda?.descripcion)}</SText>
                    </SView>
                </>}
                {select && <>
                    <SView row col={"xs-12"} style={{
                        alignItems: "center",
                        padding: 4
                    }} flex center>
                        <View style={{
                            width: 22,
                            height: 22,

                        }}>
                            <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                        </View>
                        <SView width={4} />
                        <SView flex>
                            <SText key={item.key_tipo_pago} numberOfLines={2} fontSize={12} style={{ textTransform: "uppercase" }} >{item.tipo_pago ? item.descripcion : item.key_tipo_pago}</SText>
                            <SText key={item.key_tipo_pago} fontSize={12} color={STheme.color.lightGray}>{item?.moneda?.descripcion}</SText>
                        </SView>
                    </SView>

                    <SView flex col={"xs-12"} center >

                        <SView col={"xs-12"} withoutFeedback center style={{ paddingTop: 5 }}>
                            <SInput
                                autoFocus
                                ref={ref => item.__ref = ref}
                                type='money2'
                                customStyle={"erp"}
                                decimales={2}
                                icon={<SText fontSize={10}>{item.moneda.observacion}</SText>}
                                defaultValue={MDL.contabilidad.round(parseFloat(item.monto ?? "0") / parseFloat(item.moneda?.tipo_cambio ?? 1))} required
                                style={{ marginBottom: 5 }}
                                onChangeText={(e) => {

                                    item.monto = e;
                                    if (e > 0) {
                                        item.monto = MDL.contabilidad.round(e * parseFloat(item.moneda?.tipo_cambio ?? 1))
                                        if (item.__ref_extranjera) {
                                            item.__ref_extranjera.setValue(item.monto);
                                        }
                                        this.forceUpdate();
                                    }
                                }}
                            />

                            {(item.moneda.tipo_cambio != 1) && < SInput
                                customStyle={"erp"}
                                ref={ref => item.__ref_extranjera = ref} type='money2' decimales={2}
                                defaultValue={parseFloat(item.monto ?? "0")} required
                                style={{ marginBottom: 5 }}
                                icon={<SText fontSize={10}>{this.moneda_base?.observacion}</SText>}

                            />}
                        </SView>
                        {/* <SHr h={4} /> */}
                        {/* <SText fontSize={10} color={STheme.color.lightGray}>{item.monto}</SText> */}
                    </SView>
                    <SView col={"xs-2"} center onPress={() => {
                        PagarConPasarela.open({
                            key_pasarela_empresa: item.key_pasarela_empresa,
                            monto: item.monto,
                        })
                    }}>
                        <SText>AQUÍ</SText>
                    </SView>
                </>}
            </SView>
        </SView>
    }

    calcularMontoInsertado() {
        // ((this.pvtp ?? []).filter(a => a.__select).map(item => parseFloat(item.monto) ?? 0).reduce((a, b) => a + b, 0))
        let montoTotal = 0;
        const selecteds = this.pvtp.filter(a => !!a.__select);
        selecteds.forEach(item => {
            montoTotal += parseFloat(item.monto)
        });
        return MDL.contabilidad.round(montoTotal);
    }

    agruparPorMoneda(lista) {
        const grupos = {};

        lista.forEach(item => {
            const key = item.key_moneda;
            const descripcion = item.moneda?.descripcion || "Sin moneda";

            if (!grupos[key]) {
                grupos[key] = {
                    title: descripcion,
                    key_moneda: key,
                    data: []
                };
            }

            grupos[key].data.push(item);
        });

        // Convertir objeto a array de grupos
        return Object.values(grupos);
    }

    render() {
        return <SView col={"xs-12"} padding={6} flex>
            <SView col={"xs-12"} row style={{ padding: 2 }}>
                {this.props.montoMaximo && <>
                    {/* <SView col={"xs-6"}> */}
                    <SView flex padding={4} style={{
                        alignItems: "center",
                    }} card>
                        <SText fontSize={15} color={STheme.color.lightGray}>{"Monto a Pagar: "}</SText>
                        <SView width={4} />
                        <SText bold fontSize={18}>{this.moneda?.observacion} {(parseFloat(this.props.montoMaximo ?? "0") / parseFloat(this.moneda?.tipo_cambio ?? 1)).toFixed(2)}</SText>
                        <SView width={16} />
                        <SText>{this.moneda?.descripcion}</SText>
                    </SView>
                    {/* </SView> */}
                </>}
                <SView col={"xs-0.5"} />
                {/* <SText bold fontSize={16}>{"Base"} {(parseFloat(this.props.montoMaximo ?? "0")).toFixed(2)}</SText> */}
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
                    {/* {this.pvtp.map((item, index) => this.renderItemTipoPago(item))} */}
                    {/* {this.renderItemTipoPago({ key_tipo_pago: "credito", tipo_pago: { descripcion: "Post Pago", icon: "tarea" }})} */}
                    <SectionList
                        sections={this.agruparPorMoneda(this.pvtp)}
                        keyExtractor={(item, index) => item.key + "_" + index}
                        renderSectionHeader={({ section }) => (
                            <SView style={{ paddingTop: 8, paddingBottom: 2, paddingLeft: 8 }}>
                                <SText bold fontSize={16}>
                                    {section.title}
                                </SText>
                            </SView>
                        )}
                        renderItem={({ item }) => this.renderItemTipoPago(item)}
                    />
                </SView>

            }
            <SView height={10} style={{ borderBottomWidth: 3, borderBottomColor: STheme.color.gray }} />
            <SHr h={7} />
            <SView row col={"xs-12"} padding={4} style={{
                justifyContent: "flex-end"
            }}>
                <SText padding={16} onPress={() => {
                    SelectTipoPago.closePopup();
                }} backgroundColor={STheme.color.danger} style={{ borderRadius: 4 }} >{"Cancelar"}</SText>
                <SView width={32} />
                <SText padding={16} card onPress={() => {
                    let montoTotal = 0;
                    const elm = {};
                    const selecteds = this.pvtp.filter(a => !!a.__select);
                    selecteds.forEach(item => {
                        console.log(item);
                        elm[item.key] = {
                            monto_nacional: MDL.contabilidad.round(parseFloat(item.monto)),
                            monto_extranjera: MDL.contabilidad.round((parseFloat(item.monto) / parseFloat(item.moneda.tipo_cambio ?? 1)))
                        }
                        // montoTotal += SMath.formatMoney((item.monto+2000), 2);
                        montoTotal += parseFloat(item.monto)
                    });
                    // Object.keys(this._select).forEach(key => {
                    //     console.log(this.pvtp)
                    //     const pv = this.pvtp.find(item => item.key === key);
                    //     elm[pv.key_tipo_pago] = pv.monto;
                    //     montoTotal += parseFloat(pv.monto)
                    // })

                    // if (this.props.montoMaximo != montoTotal) {
                    //     SNotification.send({
                    //         title: "El monto total no coincide con el monto máximo",
                    //         message: `Monto Total: ${montoTotal}, Monto Máximo: ${this.props.montoMaximo}`,
                    //         color: STheme.color.danger,
                    //         time: 5000,
                    //     })
                    //     return;
                    // }
                    if (this.props.onSelect) {
                        this.props.onSelect(elm);
                    }
                }}>{"Aceptar"}</SText>
            </SView>
            {/* <SText>{JSON.stringify(this.pvtp)}</SText> */}
        </SView>
    }
}
