import React, { Component } from 'react';
import { SInput, SText, SView } from 'servisofts-component';
import FotoModelo from '../Foto/FotoModelo';
import SIconApp from '../../../../Assets/SIconApp';

export default class CarritoItem extends Component {


    render() {
        const { item, onAumentar, onDisminuir, onEliminar } = this.props;

        return (

            <SView col={"xs-12"} row style={{ paddingVertical: 4, borderBottomWidth: 0.2 }}>
                <SView col={"xs-1"}>
                    <SView center style={{ width: 30, height: 30, borderRadius: 18, margin: 4 }}>
                        <FotoModelo data={item} />
                    </SView>
                </SView>
                <SView col={"xs-4.5"}>
                    <SText fontSize={12}>{item.descripcion}</SText>
                    <SText fontSize={12}>Bs {item.precio_venta.toFixed(2)} / Und</SText>
                    <SText fontSize={12}>Stock actual: {item.stock}</SText>
                </SView>
                <SView flex row center>
                    <SView onPress={onDisminuir}>
                        <SText fontSize={24} color="#EF4444">-</SText>
                    </SView>
                    <SInput
                        value={item.cantidad.toString()}
                        type="number"
                        style={{ width: 40, textAlign: "center" }}
                        editable={false}
                    />
                    <SView onPress={onAumentar}>
                        <SText fontSize={24} color="#10B981">+</SText>
                    </SView>
                </SView>
                <SView col={"xs-2"} center onPress={onEliminar}>
                    <SIconApp name="Close" width={24} height={24} fill="red" />
                </SView>
            </SView>
        );
    }
}
