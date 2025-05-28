import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SButtom, SHr, SImage, SInput, SList, SMath, SPopup, SText, STheme, SView, Upload } from 'servisofts-component'
import SSocket from 'servisofts-socket'
import Cantidad from '../../../Components/Cantidad'
import { Restaurante } from '../../../Components'
import Model from '../../../Model'

export default class Tapeke extends Component {
    render() {
        


        const { restaurante } = this.props
        if (!restaurante) return null;
        const horario = restaurante.horario;
        console.log(restaurante)
        const cantidad_disponible = !!restaurante.tapeke_deshabilitado ? 0 : (horario.cantidad - restaurante.cantidad_pedidos)


        

        // const carrito = Model?.carrito?.Action.getState().productos ?? {};
        // if (carrito?.tapeke && cantidad_disponible <= 0) {
        //     Model.carrito.Action.removeItem("tapeke")
        //     SPopup.open({
        //         key: "tapeke",
        //         content: <SView width={300} padding={32} backgroundColor='#fff' style={{ borderRadius: 8 }} row center>
        //             <SView width={50} height={50} card style={{
        //                 overflow: "hidden",
        //                 borderRadius: 8
        //             }}>
        //                 <SImage enablePreview src={require("../../../Assets/img/bolsa_tapeke.png")} style={{
        //                     resizeMode: "cover"
        //                 }} />
        //             </SView>
        //             <SView width={8} />
        //             <SText flex>El Tapeke fue removido del carrito por que ya no esta disponible.</SText>
        //         </SView>
        //     })
        // }
        return (
            <SView col={"xs-12"} backgroundColor={"#fff"} center padding={4}>
                <SHr />
                <SView col={"xs-12"} >
                    <SText font='Montserrat-Bold' fontSize={20} color={STheme.color.primary}>{"PEDÍ TU TAPEKE"}</SText>
                    <SText fontSize={10} color={STheme.color.gray}>{""}</SText>
                </SView>
                <SHr height={12} />
                <SView col={"xs-12"} row center  >
                    <SView flex height>
                        <SView col={"xs-12"} height={50}>
                            <SView width={90} height>
                                <Restaurante.Precio horario={horario} />
                            </SView>
                        </SView>
                        {/* <SText flex bold fontSize={16} >Bs. {SMath.formatMoney(horario.precio)}</SText> */}
                        <SHr />
                        <SText font='Montserrat-Bold' fontSize={16}>{`Tapeke "${restaurante.nombre}"`}</SText>
                        <SText font={"Montserrat"} fontSize={10} color={STheme.color.gray}>{"Dejá que tu pedido te sorprenda"}</SText>
                        {/* <SText fontSize={10} color={STheme.color.gray}>{restaurante.descripcion}</SText> */}
                    </SView>
                    <SView center width={100}>

                        <SView width={70} height={70} card style={{
                            overflow: 'hidden',
                        }}>
                            <SImage enablePreview src={require("../../../Assets/img/bolsa_tapeke.png")} style={{
                                resizeMode: "cover"
                            }} />
                        </SView>
                        <SView style={{
                            position: "absolute",
                            top: -10,
                            width: 130,
                            height: 25,
                            transform: [{
                                translateX: -10
                            }]
                        }} center >
                            <SImage src={require("../../../Assets/img/BARRA_DISPONIBLES.png")} />
                            <SText style={{
                                position: "absolute",
                                width: "100%",
                                // backgroundColor:"#f0f",
                                transform: [{
                                    translateX: 7,
                                }, { rotate: "-2deg", }]
                            }} fontSize={10} color={"#fff"} bold center  >  {cantidad_disponible} DISPONIBLES</SText>
                        </SView>

                        <SHr h={4} />

                        {/* <SHr h={4} /> */}
                        <Cantidad
                            pendiente={this.props.pendiente}
                            limit={horario.cantidad - restaurante.cantidad_pedidos}
                            disabled={!!restaurante.tapeke_deshabilitado || horario.cantidad - restaurante.cantidad_pedidos <= 0}
                            data={{
                                key: "tapeke",
                                precio: horario.precio,
                                key_restaurante: restaurante.key
                            }}
                            onChange={e => {

                            }} />
                    </SView>

                </SView>
                <SHr h={20} />
            </SView>
        )
    }
}