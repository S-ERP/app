import React, { Component } from 'react';
import { SInput, SText, STheme, SView } from 'servisofts-component';
import FotoModelo from '../Foto/FotoModelo';
import SIconApp from '../../../../Assets/SIconApp';
export default class CarritoItem extends Component {
    render() {
        const { item, onAumentar, onDisminuir, onEliminar } = this.props;
        return (
            <SView col={"xs-12"} row style={{ paddingVertical: 4, borderBottomWidth: 0.2, borderBottomColor: STheme.color.text }}>
                <SView col={"xs-2 md-1.5 lg-1.8 "} row center backgroundColor='transparent'>
                    <SView style={{ width: 30, minWidth: 18, height: 30, minHeight: 18, borderRadius: 18, overflow: "hidden", justifyContent: "flex-start" }}>
                        <FotoModelo data={item} />
                    </SView>
                </SView>
                <SView col={"xs-4 md-4 lg-4.5"} backgroundColor='transparent'>
                    <SText fontSize={12}>{item.descripcion}</SText>
                    <SText fontSize={12}>Bs {item.precio_venta.toFixed(2)} / Und</SText>
                    <SText fontSize={12}>stock actual: {item.stock}</SText>
                </SView>
                <SView col={"xs-5 md-5.2 lg-4.5"} flex row center backgroundColor='transparent'>
                    <SView center border={STheme.color.text} style={{ width: 24, height: 24, borderRadius: 12 }} onPress={onDisminuir}>
                        <SText fontSize={18} color={"#EF4444"}>-</SText>
                    </SView>
                    <SView row center style={{ marginHorizontal: 10 }}>
                        <SInput color={STheme.color.text} editable={false} value={item.cantidad.toString()} border={STheme.color.card} type='number' style={{ width: 40, height: 24, padding: 0, textAlign: "center", fontSize: 12, borderRadius: 4 }} />
                    </SView>
                    <SView center border={STheme.color.text} style={{ width: 24, height: 24, borderRadius: 12 }} onPress={onAumentar}>
                        <SText fontSize={18} color={"#10B981"}>+</SText>
                    </SView>
                </SView>
                <SView col={"xs-1 md-1 lg-1"} backgroundColor='transparent' center onPress={onEliminar}>
                    <SIconApp name="Close" width={24} height={24} fill="#EF4444" />
                </SView>
            </SView >
        );
    }
}