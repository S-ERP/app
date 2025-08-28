import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SIconApp from '../../../Assets/SIconApp';

type SelectTipoPagoProps = {
    key_punto_venta: string,
    solo_para_caja: boolean,
    montoMaximo?: Number,
    montoMaximoPorTipo?: { [key: string]: number },
    onSelect?: (item: any) => void
}
export default class SelectTipoPago extends Component<SelectTipoPagoProps> {
    static openPopup(props: SelectTipoPagoProps) {
        SPopup.open({
            key: "SelectTipoPago",
            type: "1",
            content: <SView style={{
                maxWidth: 500,
                width: "100%",
                // height: 500,
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                cursor: "default",
                userSelect: "text",

            }} withoutFeedback>
                <SelectTipoPago {...props} />
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
    }

    componentDidMount() {
        this.loadData();

    }

    async loadData() {
        this.tipo_pago = await MDL.empresa.getTipoPago()
        const data = await MDL.empresa.getFull()
        console.log(data);
        const suc = data.sucursales.find(suc => suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta));
        const pv = suc.puntos_venta.find(pv => pv.key == this.props.key_punto_venta);
        this.pvtp = pv.punto_venta_tipo_pago;
        this.pvtp = this.pvtp.map(item => {
            item.tipo_pago = this.tipo_pago[item.key_tipo_pago];
            item.monto = this.props.montoMaximo ?? 0;
            if (this.props.montoMaximoPorTipo && this.props.montoMaximoPorTipo[item.key_tipo_pago]) {
                item.monto = this.props.montoMaximoPorTipo[item.key_tipo_pago];
            }
            return { ...item };
        });
        if (this.props.solo_para_caja) {
            this.pvtp = this.pvtp.filter(a => a.tipo_pago?.pasa_por_caja);
        }
        this.pvtp.sort((a, b) => {
            return a.tipo_pago?.orden - b.tipo_pago?.orden
        })
        this.setState({ ready: true });
    }

    renderItemTipoPago(item) {
        const select = item.__select
        return <SView style={{
            padding: 4,
            maxWidth: 130,
        }} col={"xs-6 sm-4"} colSquare>
            <SView style={{
                width: "100%",
                height: "100%",
                borderWidth: 1,
                borderColor: select ? STheme.color.success : STheme.color.card,
                // backgroundColor: this._select[item.key] ? STheme.color.success + "44" : "transparent",
                borderRadius: 8,
                padding: 8,
                justifyContent: "center",
                alignItems: "center"
            }} onPress={() => {
                item.__select = !item.__select;
                const selecteds = this.pvtp.filter(a => !!a.__select);
                if (!this.props.montoMaximoPorTipo) {
                    // item.monto = this.props.montoMaximoPorTipo[item.key_tipo_pago];
                    selecteds.forEach(pv => {
                        pv.monto = (this.props.montoMaximo || 0) / selecteds.length;
                        if (pv.__ref) {
                            pv.__ref.setValue(pv.monto.toFixed(2));
                        }
                    });
                }

                this.forceUpdate();
            }}>
                {!select && <>
                    <View style={{
                        width: "70%",
                        height: "70%",
                        // borderWidth: 1,
                        // borderColor: STheme.color.card
                    }}>
                        <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                    </View>
                    <SView flex center>
                        <SText key={item.key_tipo_pago} col={"xs-12"} style={{
                            textAlign: "center",
                        }}>{item.tipo_pago ? item.tipo_pago.descripcion : item.key_tipo_pago}</SText>
                    </SView>
                </>}
                {select && <>
                    <SView row col={"xs-12"} style={{
                        alignItems: "center"
                    }}>
                        <View style={{
                            width: 22,
                            height: 22,
                            // borderWidth: 1,
                            // borderColor: STheme.color.card
                        }}>
                            <SIconApp name={item?.tipo_pago?.icon || "Ajustes"} />
                        </View>
                        <SView width={4} />
                        <SText flex key={item.key_tipo_pago} numberOfLines={1} fontSize={12} >{item.tipo_pago ? item.tipo_pago.descripcion : item.key_tipo_pago}</SText>
                    </SView>
                    {/* <SView flex col={"xs-12"}>
                        <SText>{"100 Bs."}</SText>
                    </SView> */}
                    <SView flex col={"xs-12"} center >

                        <SView col={"xs-12"} withoutFeedback>
                            <SInput autoFocus ref={ref => item.__ref = ref} type='money2' defaultValue={parseFloat(item.monto ?? "0")} required
                                onChangeText={(e) => {
                                    item.monto = e;
                                }}
                            />
                        </SView>
                    </SView>
                </>}
            </SView>
        </SView>
    }

    render() {
        return <SView flex col={"xs-12"} padding={4}>
            {this.props.montoMaximo && <>
                <SView padding={4} row center>
                    <SText color={STheme.color.lightGray}>{"Monto Maximo: "}</SText>
                    <SText bold fontSize={16}>{parseFloat(this.props.montoMaximo ?? "0").toFixed(2)}</SText>
                </SView>
            </>}
            {this.state.ready &&
                <SView row padding={4} style={{
                    justifyContent: "space-around",
                    alignItems: "center"
                }}>
                    {this.pvtp.map((item, index) => this.renderItemTipoPago(item))}
                </SView>
            }
            <SView row col={"xs-12"} padding={4} style={{
                justifyContent: "flex-end"
            }}>
                <SText padding={16} card onPress={() => {
                    SelectTipoPago.closePopup();
                }} >{"Cancelar"}</SText>
                <SView width={32} />
                <SText padding={16} card onPress={() => {
                    let montoTotal = 0;
                    const elm = {};
                    const selecteds = this.pvtp.filter(a => !!a.__select);
                    selecteds.forEach(item => {
                        elm[item.key_tipo_pago] = parseFloat(item.monto);
                        montoTotal += parseFloat(item.monto);
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
