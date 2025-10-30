import React, { Component } from 'react';
import { SHr, SInput, SMath, SText, STheme, SView } from 'servisofts-component';
import FotoModelo from '../Foto/FotoModelo';
import SIconApp from '../../../../Assets/SIconApp';



export default class CarritoItem extends Component {
    inputs = {};
    updatePrecio = (actualizarInput = true) => {
        const { data, selectedMoneda } = this.props;
        const precioBase = data.modelo?.precio_compra || data.precio || 0;
        // const precioConvertido = this.convertPrice(precioBase, data.moneda || selectedMoneda, selectedMoneda) * (data.cantidad || 1);
        const tc = selectedMoneda?.tipo_cambio ?? 1
        data.precioConvertido = precioBase / tc;
        // this.setState({ precioConvertido });
        if (actualizarInput && this.inputs["precio"]) {
            const vl = Math.round((data.precioConvertido * (data.cantidad || 1)) * 100) / 100
            this.inputs["precio"].setValue(vl.toString());
        }
    };
    render() {
        const { item, onAumentar, onDisminuir, onEliminar } = this.props;
        const _simbolo = item.monedaSymbol || 'Bs';
        const _precioMoneda = item.precio_compra_moneda;
        let precio_compra = item.precio_compra * (this.props.selectedMoneda?.tipo_cambio ?? 1)

        console.log("PRO ", item)
        return (
            <SView col={"xs-12"} row style={{ paddingVertical: 4, borderBottomWidth: 0.2, borderBottomColor: STheme.color.card }}>
                <SView width={40} row center>
                    <SView style={{ width: 30, minWidth: 18, height: 30, minHeight: 18, borderRadius: 18, overflow: "hidden", justifyContent: "flex-start", borderRadius: 50, backgroundColor: STheme.color.card }}>
                        <FotoModelo data={item} />
                    </SView>
                </SView>
                <SView flex row center>
                    <SView col={"xs-12"} row>
                        <SText col={"xs-12"} fontSize={12}>{item.descripcion}</SText>
                        {/*<SText col={"xs-12"} fontSize={12}>{_simbolo} {_precioMoneda} /Und</SText> */}
                        <SHr height={8} />
                    </SView>
                    <SView col={"xs-12"} row >
                        <SView flex row center>
                            <SInput
                                ref={ref => (this.inputs["precio"] = ref)}
                                icon={<SText fontSize={10} padding={2} >{_simbolo || ""}</SText>}

                                // placeholder={`Precio`}
                                customStyle={"erp"}
                                label={"Precio"}
                                value={_precioMoneda || "0"}
                                onChangeText={e => {
                                    const nuevoPrecio = parseFloat(e) || 0;
                                    this.props.data.precioConvertido = nuevoPrecio;
                                    const tc = this.props.selectedMoneda?.tipo_cambio ?? 1
                                    this.props.data.precio = nuevoPrecio * tc;
                                }}
                                type="money2"
                                style={{ fontSize: 12 }}
                            />
                        </SView>
                        <SView width={5} />
                        <SView row center>
                            <SView col={"md-4 xl-4"} row center>
                                <SView center border={STheme.color.text} onPress={onDisminuir}
                                    style={{ width: 24, maxWidth: 100, height: 24, borderRadius: 12, opacity: item.cantidad <= 1 ? 0.5 : 1 }}>
                                    <SText fontSize={18} color={"#EF4444"}>-</SText>
                                </SView>
                            </SView>
                            <SView col={"md-4 xl-4"} row center>
                                <SView center style={{ marginHorizontal: 5 }}>
                                    {/* <SInput
                                    color={STheme.color.text}
                                    editable={false}
                                    value={item.cantidad.toString()}
                                    border={STheme.color.card}
                                    type='number'
                                    style={{ width: 35, height: 24, padding: 0, textAlign: "center", fontSize: 12, borderRadius: 4 }}
                                /> */}
                                    <SInput
                                        ref={ref => (this.inputs["cantidad"] = ref)}
                                        style={{ width: 45, padding: 0, textAlign: "center", fontSize: 12, borderRadius: 4 }}
                                        placeholder={`Cant`}
                                        customStyle={"erp"}
                                        label={"Cant"}
                                        defaultValue={item?.cantidad || "1"}
                                        value={item.cantidad}
                                        onChangeText={e => {
                                            item.cantidad = parseFloat(e) || 0;
                                            this.updatePrecio(true); // No actualizar el input, solo recalcular precio interno
                                            this.forceUpdate();
                                        }}
                                        icon={<SView />}
                                        type="money2"
                                    />
                                </SView>
                            </SView>
                            <SView col={"md-4 xl-4"} row center>
                                <SView center
                                    border={STheme.color.text}
                                    style={{ width: 24, height: 24, borderRadius: 12, opacity: item.cantidad >= (item.stock || 120) ? 0.5 : 1 }}
                                    disabled={item.cantidad >= (item.stock || 120)}
                                    onPress={onAumentar}
                                >
                                    <SText fontSize={18} color={"#10B981"}>+</SText>
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SView col={"md-2 xl-2.5"} center>
                    <SView col={"xs-12"} style={{ justifyContent: "flex-start" }}>
                        <SText col={"xs-12"} fontSize={11} bold>{_simbolo} {SMath.formatMoney((item.precio_compra_moneda * item.cantidad), 2)}</SText>
                    </SView>
                </SView>
                <SView width={10} height={"100%"} center onPress={onEliminar}  >
                    <SView style={{ position: "absolute", right: 4, top: 0 }}>
                        <SIconApp name="Close" width={20} height={20} fill="#EF4444" />
                    </SView>
                </SView>
            </SView>
        );
    }
}