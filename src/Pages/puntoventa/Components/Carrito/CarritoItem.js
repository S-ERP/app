import React, { Component } from 'react';
import { SInput, SMath, SText, STheme, SView } from 'servisofts-component';
import FotoModelo from '../Foto/FotoModelo';
import SIconApp from '../../../../Assets/SIconApp';



export default class CarritoItem extends Component {
    render() {
        const { item, onAumentar, onDisminuir, onEliminar } = this.props;
        const _simbolo = item.monedaSymbol || 'Bs';
        const _precioMoneda = item.precio_venta_moneda;
        // const _precioMoneda = SMath.formatMoney(item.precio_venta_moneda, 2);
        return (
            <SView col={"xs-12"} row style={{ paddingVertical: 4, borderBottomWidth: 0.2, borderBottomColor: STheme.color.card }}>
                <SView width={40} row center>
                    <SView style={{ width: 30, minWidth: 18, height: 30, minHeight: 18, borderRadius: 18, overflow: "hidden", justifyContent: "flex-start" }}>
                        <FotoModelo data={item} />
                    </SView>
                </SView>
                <SView flex row center>
                    <SView col={"xs-12"} row>
                        <SText col={"xs-12"} fontSize={12}>{item.descripcion}</SText>
                        <SText col={"xs-12"} fontSize={12}>{_simbolo} {_precioMoneda} /Und</SText>
                    </SView>
                </SView>
                <SView col={"md-5.5 lg-4.5 xl-3.5"} row center>
                    <SView col={"xs-12"} row center>
                        <SView col={"md-4 xl-4"} row center>
                            <SView center border={STheme.color.text} onPress={onDisminuir}
                                style={{ width: 24, maxWidth: 100, height: 24, borderRadius: 12, opacity: item.cantidad <= 1 ? 0.5 : 1 }}>
                                <SText fontSize={18} color={"#EF4444"}>-</SText>
                            </SView>
                        </SView>
                        <SView col={"md-4 xl-4"} row center>
                            <SView center style={{ marginHorizontal: 5 }}>
                                <SInput
                                    color={STheme.color.text}
                                    editable={false}
                                    value={item.cantidad.toString()}
                                    border={STheme.color.card}
                                    type='number'
                                    style={{ width: 35, height: 24, padding: 0, textAlign: "center", fontSize: 12, borderRadius: 4 }}
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
                <SView col={"md-2 xl-2.5"} center>
                    <SView col={"xs-12"} style={{ justifyContent: "flex-start" }}>
                        <SText col={"xs-12"} fontSize={11} bold>{_simbolo} {(item.precio_venta_moneda * item.cantidad)}</SText>
                        {/* <SText col={"xs-12"} fontSize={11} bold>{_simbolo} {SMath.formatMoney(item.precio_venta_moneda * item.cantidad, 2)}</SText> */}
                    </SView>
                </SView>
                <SView width={10} height={"100%"} center onPress={onEliminar}  >
                    <SView style={{ position: "absolute", right: 4, marginTop: 0 }}>
                        <SIconApp name="Close" width={20} height={20} fill="#EF4444" />
                    </SView>
                </SView>
            </SView>
        );
    }
}