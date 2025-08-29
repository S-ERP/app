import React from "react";
import { SHr, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import { Dimensions, ScrollView } from "react-native";

export default class cuentas_t extends React.Component {
    state = {
        data: []
    }
    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        try {
            const data = await MDL.contabilidad.reporte_libro_diario();

            const cuentas = {};
            data.map(det => {
                if (!cuentas[det.key_cuenta_contable]) {
                    cuentas[det.key_cuenta_contable] = []
                }
                cuentas[det.key_cuenta_contable].push(det);
            })
            console.log(cuentas);
            const arr = Object.values(cuentas);
            arr.sort((a, b) => a[0].cuenta_contable.codigo.localeCompare(b[0].cuenta_contable.codigo));
            this.setState({ data: arr });
            return data;
        } catch (error) {
            console.log(error);
            throw error
        }
    }
    render() {
        return <SPage title={"Cuentas T"}>
            <SView col={"xs-12"} row padding={8}>
                {this.state.data.map((detalle, i) => {
                    return <CuentaT detalle={detalle} />
                })}
            </SView>

        </SPage>
    }
}


class CuentaT extends React.Component {

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

        const detalleDebe = detalle.filter(a => a.debe > 0);
        const detalleHaber = detalle.filter(a => a.haber > 0);

        const totalDebe = detalleDebe.reduce((sum, item) => sum + item.debe, 0);
        const totalHaber = detalleHaber.reduce((sum, item) => sum + item.haber, 0);

        const aditionalStyle = {
            borderWidth: 1,
            borderColor: MDL.contabilidad.color_tipo[cuenta.tipo],
            backgroundColor: MDL.contabilidad.color_tipo[cuenta.tipo] + "55",
            padding: 1,
            position: "absolute",
            right: 0,
            top: 0,
            borderRadius: 4,
        };
        return <SView style={{
            width: 150,

            // borderWidth: 1,
            borderRadius: 4,
            backgroundColor: STheme.color.card,
            margin: 2,
            padding: 4
        }}>
            <SView col={"xs-12"} >
                <SView style={aditionalStyle}>
                    <SText fontSize={7} center>{cuenta.tipo}</SText>
                </SView>
                <SHr h={12} />
                <SView col={"xs-12"}>
                    <SText fontSize={10} color={STheme.color.text} numberOfLines={2}>{cuenta.codigo} {cuenta.descripcion}</SText>
                </SView>
                {/* <SText col={"xs-12"} fontSize={10} center color={STheme.color.text} numberOfLines={1}>{cuenta.descripcion}</SText> */}
                {/* <SText fontSize={12} center color={STheme.color.text}>{cuenta.tipo}</SText> */}
            </SView>
            <SHr />
            <SView col={"xs-12"} row >
                <SView flex center>
                    <SText fontSize={10} color={STheme.color.text}>{"D"}</SText>
                </SView>
                <SView style={{
                    width: 1,
                    backgroundColor: STheme.color.card,
                    height: "100%"
                }} />
                <SView flex center >
                    <SText fontSize={10} color={STheme.color.text}>{"H"}</SText>
                </SView>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <ScrollView style={{
                height: 100
            }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    minHeight: "100%"
                }}>
                <SView col={"xs-12"} row flex>
                    <SView flex style={{
                        alignItems: "flex-end",
                        paddingRight: 4,
                    }}>
                        {detalleDebe.map(a => {
                            return <SText fontSize={12} color={STheme.color.lightGray} onPress={(e) => {
                                this.openPopup({ e: e, detalle: a })
                            }}>{SMath.formatMoney(a.debe)}</SText>
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
                            }}>{SMath.formatMoney(a.haber)}</SText>
                        })}
                        <SHr h={50} />

                    </SView>
                </SView>
            </ScrollView>
            <SHr h={1} color={STheme.color.card} />
            <SHr h={2} />
            <SView col={"xs-12"} row >
                <SView flex style={{
                    alignItems: "flex-end",
                    paddingRight: 4,
                }}>
                    <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalDebe)}</SText>
                </SView>
                <SView style={{
                    width: 1,
                    backgroundColor: STheme.color.card,
                    height: "100%"
                }} />
                <SView flex style={{
                    alignItems: "flex-end",
                }} >
                    <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalHaber)}</SText>
                </SView>
            </SView>
            <SHr h={2} />
            <SHr h={1} color={STheme.color.card} />
            <SHr h={2} />
            <SView col={"xs-12"} row >
                <SView flex style={{
                    alignItems: "flex-end",
                    paddingRight: 4,
                }}>
                    {totalDebe > totalHaber && <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalDebe - totalHaber)}</SText>}
                </SView>
                <SView style={{
                    width: 1,
                    backgroundColor: STheme.color.card,
                    height: "100%"
                }} />
                <SView flex style={{
                    alignItems: "flex-end",
                }} >
                    {totalHaber > totalDebe && <SText fontSize={12} color={STheme.color.text}>{SMath.formatMoney(totalHaber - totalDebe)}</SText>}
                </SView>
            </SView>
        </SView>
    }
}