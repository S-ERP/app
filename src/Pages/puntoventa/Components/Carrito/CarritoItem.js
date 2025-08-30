import React, { Component } from 'react';
import { SInput, SText, STheme, SView } from 'servisofts-component';
import FotoModelo from '../Foto/FotoModelo';
import SIconApp from '../../../../Assets/SIconApp';
export default class CarritoItem extends Component {
    render() {
        const { item, onAumentar, onDisminuir, onEliminar } = this.props;
        return (
            <SView col={"xs-12"} row style={{ paddingVertical: 4, borderBottomWidth: 0.2, borderBottomColor: STheme.color.card }}>
                <SView width={40} row center backgroundColor='transparent'>
                    <SView style={{ width: 30, minWidth: 18, height: 30, minHeight: 18, borderRadius: 18, overflow: "hidden", justifyContent: "flex-start" }}>
                        <FotoModelo data={item} />
                    </SView>
                </SView>
                <SView flex row center border='transparent'>
                    <SView col={"xs-12"} row backgroundColor='transparent'>
                        <SText col={"xs-12"} fontSize={12}>{item.descripcion}</SText>
                        <SText col={"xs-12"} fontSize={12}>Bs {item.precio_venta.toFixed(2)} / Und</SText>
                    </SView>
                </SView>
                <SView col={"md-5.5 lg-4.5 xl-3.5"} row center border='transparent'>
                    <SView col={"xs-12"} row center backgroundColor='transparent'>
                        <SView col={"md-4 xl-4"} row center backgroundColor='transparent' >
                            <SView
                                center
                                border={STheme.color.text}
                                style={{
                                    width: 24,
                                    maxWidth: 100,
                                    height: 24,
                                    borderRadius: 12,
                                    opacity: item.cantidad <= 50 ? 0.5 : 1 // Visual feedback para botón desactivado
                                }}
                                disabled={item.cantidad <= 50} // Deshabilitar si cantidad <= 50
                                onPress={onDisminuir}
                            >
                                <SText fontSize={18} color={"#EF4444"}>-</SText>
                            </SView>
                        </SView>
                        <SView col={"md-4 xl-4"} row center backgroundColor='transparent'  >
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
                        <SView col={"md-4 xl-4"} row center backgroundColor='transparent' >
                            <SView
                                center
                                border={STheme.color.text}
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    opacity: item.cantidad >= 120 ? 0.5 : 1 // Visual feedback para botón desactivado
                                }}
                                disabled={item.cantidad >= 120} // Deshabilitar si cantidad >= 120
                                onPress={onAumentar}
                            >
                                <SText fontSize={18} color={"#10B981"}>+</SText>
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SView col={"md-2 xl-2.5"} center border='transparent'>
                    <SView col={"xs-12"} style={{ justifyContent: "flex-start" }}>
                        <SText col={"xs-12"} fontSize={11} bold> Bs {(item.precio_venta * item.cantidad).toFixed(2)}</SText>
                    </SView>
                </SView>
                <SView width={20} height={20} backgroundColor='transparent' center onPress={onEliminar} style={{ position: "absolute", right: -2, top: -1 }} >
                    <SIconApp name="Close" width={18} height={18} fill="#EF4444" />
                </SView>
            </SView>
        );
    }
}