import React, { Component } from 'react';
import { SInput, SText, STheme, SView } from 'servisofts-component';
import FotoModelo from '../Foto/FotoModelo';
import SIconApp from '../../../../Assets/SIconApp';

export default class CarritoItem extends Component {


    render() {
        const { item, onAumentar, onDisminuir, onEliminar } = this.props;

        return (

            <SView col={"xs-12"} row style={{ paddingVertical: 4, borderBottomWidth: 0.2, borderBottomColor: STheme.color.text }}>

                <SView col={"xs-1"} center backgroundColor='blue'>

                    <SView center row style={{ width: 30, height: 30, borderRadius: 18, marginRight: (8), overflow: "hidden", }}>

                        {/* <SView center style={{ width: 30, height: 30, borderRadius: 18, margin: 4 }}> */}
                        <FotoModelo data={item} />
                    </SView>
                </SView>



                <SView col={"xs-4.5"}>
                    <SText fontSize={12}>{item.descripcion}</SText>
                    <SText fontSize={12}>Bs {item.precio_venta.toFixed(2)} / Und</SText>
                    <SText fontSize={12}>Stock actual: {item.stock}</SText>
                </SView>

                <SView flex row center>

                    <SView center border={STheme.color.text} style={{ width: 24, height: 24, borderRadius: 12 }} onPress={onDisminuir}>
                        <SText fontSize={18} color={"#EF4444"}>-</SText>
                    </SView>





                    <SView row center style={{ marginHorizontal: 10 }}>
                        <SInput color={STheme.color.text} value={item.cantidad.toString()} border={STheme.color.card} type='number' style={{ width: 40, height: 24, padding: 0, textAlign: "center", fontSize: 12, borderRadius: 4 }}
                        // onChangeText={(text) => this.editarCantidadDirecta(item.key, text)}
                        />
                    </SView>


                    {/* <SInput
                        value={item.cantidad.toString()}
                        type="number"
                        style={{ width: 40, textAlign: "center" }}
                        editable={false}
                    /> */}


                    <SView center border={STheme.color.text} style={{ width: 24, height: 24, borderRadius: 12 }} onPress={onAumentar}>
                        <SText fontSize={18} color={"#10B981"}>+</SText>
                    </SView>


                </SView>


                <SView col={"xs-2"} center onPress={onEliminar}>
                    <SIconApp name="Close" width={24} height={24} fill="red" />
                </SView>
            </SView>
        );
    }
}
