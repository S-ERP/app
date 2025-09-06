import React from "react";
import { SHr, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";
import { Dimensions, ScrollView } from "react-native";


export default class CuentaT extends React.Component {

    openPopup({ e, detalle }) {
        const a = detalle
        let left = e.nativeEvent.pageX;
        if (left + 130 > Dimensions.get("window").width) {
            left = Dimensions.get("window").width - 130
        }
        SPopup.open({
            key: "cuenta_detalle",
            type: "2",
            content: <SView style={{
                position: "absolute",
                top: e.nativeEvent.pageY,
                left: left,
                width: 130,
                backgroundColor: STheme.color.background,
                borderRadius: 4,
                padding: 8
            }} withoutFeedback>
                <SText fontSize={12} color={STheme.color.link} underLine onPress={() => {
                    SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: a?.asiento_contable?.key })
                    SPopup.close("cuenta_detalle")
                }}>{a?.asiento_contable?.codigo}</SText>
                <SText fontSize={12} color={STheme.color.text}>{a?.asiento_contable?.descripcion}</SText>
                <SText fontSize={12} color={STheme.color.text}>{a?.descripcion}</SText>
                <SText fontSize={12} color={STheme.color.text}>{a?.asiento_contable?.fecha}</SText>
            </SView>
        })
    }
    render() {
        const { detalle } = this.props;
        const cuenta = detalle[0].cuenta_contable

        const moneda_base = detalle[0].moneda_base
        const moneda = detalle[0].moneda ?? detalle[0].moneda_base

        // const isMe = moneda_base.key == moneda.key

        const detalleDebe = detalle.filter(a => a.debe > 0).sort((a, b) => a.asiento_contable.codigo.localeCompare(b.asiento_contable.codigo));
        const detalleHaber = detalle.filter(a => a.haber > 0).sort((a, b) => a.asiento_contable.codigo.localeCompare(b.asiento_contable.codigo));

        const totalDebe = detalleDebe.reduce((sum, item) => sum + item.debe, 0);
        const totalHaber = detalleHaber.reduce((sum, item) => sum + item.haber, 0);
        const totalDebeME = detalleDebe.reduce((sum, item) => sum + item.debe_me, 0);
        const totalHaberME = detalleHaber.reduce((sum, item) => sum + item.haber_me, 0);


        const aditionalStyle = {
            borderWidth: 1,
            borderColor: MDL.contabilidad.color_tipo[cuenta.tipo],
            backgroundColor: MDL.contabilidad.color_tipo[cuenta.tipo] + "55",
            padding: 1,
            // position: "absolute",
            // right: 0,
            // top: 0,
            borderRadius: 4,
        };

        const saldo = totalDebe - totalHaber;
        const saldoME = totalDebeME - totalHaberME;
        const saldo_correcto = saldoME * moneda.tipo_cambio
        return <SView style={{
            width: saldoME != 0 ? 400 : 300,

            // borderWidth: 1,
            borderRadius: 4,
            backgroundColor: STheme.color.card,
            margin: 4,
            padding: 4
        }}>
            <SView col={"xs-12"} >

                <SView col={"xs-12"} style={{
                    height: 20,
                }} row>
                    <SText clean fontSize={12} color={STheme.color.text} numberOfLines={2}>{cuenta.codigo}  <SText clean fontSize={7} center style={aditionalStyle}>{cuenta.tipo}</SText>  {cuenta.descripcion}</SText>

                    {/* <SView >
                        
                    </SView> */}
                </SView>
                {/* <SText col={"xs-12"} fontSize={10} center color={STheme.color.text} numberOfLines={1}>{cuenta.descripcion}</SText> */}
                {/* <SText fontSize={12} center color={STheme.color.text}>{cuenta.tipo}</SText> */}
            </SView>
            <SHr h={16} />
            <SView col={"xs-12"} row >
                <SView flex>
                    <SText fontSize={10} color={STheme.color.lightGray} center>{"Debe"}</SText>
                    <SView row col={"xs-12"}>
                        {saldoME != 0 && <SView flex center>
                            <SText fontSize={10} color={STheme.color.lightGray} center>{"Extrangera"}</SText>
                        </SView>
                        }
                        <SView flex center>
                            <SText fontSize={10} color={STheme.color.lightGray} center>{"Nacional"}</SText>
                        </SView>
                    </SView>
                </SView>
                <SView style={{
                    width: 1,
                    backgroundColor: STheme.color.card,
                    height: "100%"
                }} />
                <SView flex>
                    <SText fontSize={10} color={STheme.color.lightGray} center>{"Haber"}</SText>
                    <SView row col={"xs-12"}>
                        <SView flex center>
                            <SText fontSize={10} color={STheme.color.lightGray} center>{"Nacional"}</SText>
                        </SView>
                        {saldoME != 0 && <SView flex center>
                            <SText fontSize={10} color={STheme.color.lightGray} center>{"Extranjera"}</SText>
                        </SView>}
                    </SView>
                </SView>
            </SView>
            <SHr h={2} />
            <SHr h={1} color={STheme.color.card} />
            <SHr h={2} />
            <ScrollView style={{
                height: 130
            }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    minHeight: "100%"
                }}>
                <SView col={"xs-12"} row flex>
                    {saldoME != 0 && <SView flex style={{
                        alignItems: "flex-end",

                    }}>
                        {detalleDebe.map(a => {
                            const moneda = a.moneda ?? a.moneda_base

                            return <SText fontSize={12} color={STheme.color.lightGray} onPress={(e) => {
                                this.openPopup({ e: e, detalle: a })
                            }}>{SMath.formatMoney(a.debe_me ?? 0)} {moneda.observacion}</SText>
                        })}
                        <SHr h={50} />
                    </SView>
                    }
                    <SView flex style={{
                        alignItems: "flex-end",
                        paddingRight: 4,
                    }}>
                        {detalleDebe.map(a => {
                            return <SText fontSize={12} color={STheme.color.lightGray} onPress={(e) => {
                                this.openPopup({ e: e, detalle: a })
                            }}>{SMath.formatMoney(a.debe ?? 0)} {a?.moneda_base?.observacion}</SText>
                        })}
                        <SHr h={50} />
                    </SView>
                    <SView style={{
                        width: 1,
                        backgroundColor: STheme.color.card,
                        height: "100%"
                    }} />
                    <SView flex style={{
                        alignItems: "flex-end",

                    }} >
                        {detalleHaber.map(a => {

                            return <SText fontSize={12} color={STheme.color.lightGray} onPress={(e) => {
                                this.openPopup({ e: e, detalle: a })
                            }}>{SMath.formatMoney(a.haber ?? 0)} {a?.moneda_base?.observacion}</SText>
                        })}
                        <SHr h={50} />

                    </SView>
                    {saldoME != 0 && <SView flex style={{
                        alignItems: "flex-end",
                    }} >
                        {detalleHaber.map(a => {
                            const moneda = a.moneda ?? a.moneda_base

                            return <SText fontSize={12} color={STheme.color.lightGray} onPress={(e) => {
                                this.openPopup({ e: e, detalle: a })
                            }}>{SMath.formatMoney(a.haber_me ?? 0)} {moneda?.observacion}</SText>
                        })}
                        <SHr h={50} />

                    </SView>
                    }
                </SView>
            </ScrollView>
            <SHr h={1} color={STheme.color.card} />
            <SHr h={2} />
            <SView col={"xs-12"} row >
                {saldoME != 0 && <SView flex style={{
                    alignItems: "flex-end",
                    // paddingRight: 4,
                }}>
                    <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalDebeME ?? 0)} {moneda?.observacion}</SText>
                </SView>}
                <SView flex style={{
                    alignItems: "flex-end",
                    paddingRight: 4,
                }}>
                    <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalDebe ?? 0)} {moneda_base?.observacion}</SText>
                </SView>
                <SView style={{
                    width: 1,
                    backgroundColor: STheme.color.card,
                    height: "100%"
                }} />
                <SView flex style={{
                    alignItems: "flex-end",
                }} >
                    <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalHaber ?? 0)} {moneda_base?.observacion}</SText>
                </SView>
                {saldoME != 0 && <SView flex style={{
                    alignItems: "flex-end",
                }} >
                    <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalHaberME ?? 0)} {moneda?.observacion}</SText>
                </SView>}
            </SView>
            <SHr h={2} />
            <SHr h={1} color={STheme.color.card} />
            <SHr h={2} />
            <SView col={"xs-12"} row >
                {saldoME != 0 && <SView flex style={{
                    alignItems: "flex-end",
                    // paddingRight: 4,
                }}>
                    {totalDebeME > totalHaberME && <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalDebeME - totalHaberME)} {moneda?.observacion}</SText>}
                </SView>}
                <SView flex style={{
                    alignItems: "flex-end",
                    paddingRight: 4,
                }}>
                    {totalDebe > totalHaber && <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalDebe - totalHaber)} {moneda_base?.observacion}</SText>}
                </SView>
                <SView style={{
                    width: 1,
                    backgroundColor: STheme.color.card,
                    height: "100%"
                }} />
                <SView flex style={{
                    alignItems: "flex-end",
                }} >
                    {totalHaber > totalDebe && <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalHaber - totalDebe)} {moneda_base?.observacion}</SText>}
                </SView>
                <SView style={{
                    width: 1,
                    backgroundColor: STheme.color.card,
                    height: "100%"
                }} />
                {saldoME != 0 && <SView flex style={{
                    alignItems: "flex-end",
                }} >
                    {totalHaberME > totalDebeME && <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalHaberME - totalDebeME)} {moneda?.observacion}</SText>}
                </SView>}
            </SView>
            <SHr h={2} />
            <SHr h={1} color={STheme.color.card} />
            <SHr h={2} />
            {saldo_correcto > 0 && <SView col={"xs-12"} row >
                <SView flex style={{
                    alignItems: "flex-end",
                    // paddingRight: 4,
                }}>
                    <SText fontSize={12} color={STheme.color.text}>{"Saldo Correcto: "} {SMath.formatMoney(saldo_correcto)} {moneda.observacion}</SText>
                    <SText fontSize={12} color={STheme.color.text}>{"( tc. " + moneda.tipo_cambio + " ) Saldo Preliminar: "} {SMath.formatMoney(saldo)} {moneda.observacion}</SText>
                    <SText fontSize={12} color={STheme.color.text}>{"Diferencia: "} {SMath.formatMoney(saldo_correcto - saldo)} {moneda.observacion}</SText>
                </SView>
                {/* <SView flex style={{
                    alignItems: "flex-end",
                    paddingRight: 4,
                }}>
                    {totalDebe > totalHaber && <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalDebe - totalHaber)}</SText>}
                </SView> */}

            </SView>
            }
        </SView>
    }
}