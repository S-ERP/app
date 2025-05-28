import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SImage, SMath, SText, STheme, SView } from 'servisofts-component'

export default class Precio extends Component<{ horario: any }> {
    render() {
        let horario = this.props.horario
        return (
            <SView flex height style={{
                alignItems: "flex-end",
                // paddingRight: 8,
                justifyContent: "center",
                ...(this.props.style ?? {})
            }}>
                {!horario.precio_original ? null : <SView width={90} height={20} style={{ alignItems: 'flex-end', }}>
                    <SImage style={{
                        width: 60
                    }} src={require("../../Assets/img/Banner_p_line.png")} />
                    <SView style={{
                        position: "absolute",
                        // right: 15,
                        // top: 2,
                        // transform: [{ rotate: "-3deg" }]
                    }} >
                        <SText font={'Montserrat-SemiBold'} style={{ alignItems: 'flex-end', color: STheme.color.grayThird, fontSize: 13 }} >{"Bs. " + SMath.formatMoney(horario?.precio_original ?? 0)}</SText>
                    </SView>
                </SView>
                }
                <SText font={'Montserrat-SemiBold'} style={{ alignItems: 'flex-end', }}>{"Bs. " + SMath.formatMoney(horario?.precio ?? 0)}</SText>
                {!horario.precio_original ? null : <SView width={90} height={20} style={{ alignItems: 'flex-end', }}>
                    {/* <SIcon name={"PrecioOriginalBottom"} /> */}
                    <SImage src={require("../../Assets/img/Banner_p.png")} />
                    <SView style={{
                        position: "absolute",
                        right: 12,
                        top: 3,
                        transform: [{ rotate: "-3deg" }]
                    }}>
                        <SText font={'Montserrat-SemiBold'} fontSize={9} color={"#fff"} bold>{100 - ((horario?.precio / horario.precio_original) * 100).toFixed(0)} % OFF</SText>
                    </SView>
                </SView>
                }

            </SView>
        )
    }
}