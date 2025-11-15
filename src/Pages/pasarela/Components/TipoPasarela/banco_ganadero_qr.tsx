import React from "react";
import { SImage, SPage, SText, STheme, SView, SGradient, SHr, SMath } from "servisofts-component";
import { TipoPasarelaProps } from "./index"

export default class banco_ganadero_qr extends React.Component<TipoPasarelaProps> {
    render() {
        return <SView col={"xs-12"} center padding={15}>
            <SGradient colors={["#075018", "#80BB01"]}  ></SGradient>
            <SView col={"xs-10"} backgroundColor={STheme.color.white} center
                style={{
                    borderRadius: 25,
                    overflow: "hidden"
                }}>
                <SView col={"xs-12"} backgroundColor={"#024C01"} height={70} width={"100%"}
                    style={{ overflow: "hidden" }}>
                    <SImage src={require("../../../../Assets/img/bancoGanadero2.jpg")} style={{ resizeMode: "cover" }} />
                </SView>
                <SHr />
                <SView style={{
                    width: 250,
                    height: 250,
                }}>
                    <SImage src={require("../../../../Assets/img/bancoGanaderoQr.jpeg")} />
                </SView>
                 <SHr />
                <SView row>
                    <SText color={"#80BB01"} fontSize={22} bold>Bs </SText>
                    <SView width={5} />
                    <SText color={STheme.color.black} fontSize={22} bold>{SMath.formatMoney(this.props.monto)}</SText>
                </SView>
                <SHr height={15}/>
            </SView>
        </SView>
    }
}