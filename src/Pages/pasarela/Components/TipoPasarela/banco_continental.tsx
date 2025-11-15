import React from "react";
import { SHr, SImage, SMath, SPage, SText, STheme, SView } from "servisofts-component";
import { TipoPasarelaProps } from "./index"

export default class banco_continental extends React.Component<TipoPasarelaProps> {
    render() {
        return <SView col={"xs-12"} center padding={15}>
            <SView col={"xs-10"} backgroundColor={STheme.color.white} center
                style={{
                    borderRadius: 25,
                    overflow: "hidden"
                }}>
                <SView col={"xs-12"} backgroundColor={"#19408B"} height={70} width={"100%"}
                    style={{ overflow: "hidden" }}>
                    <SImage src={require("../../../../Assets/img/bancoContinental.jpg")} style={{ resizeMode: "cover" }} />
                </SView>
                <SHr />
                <SView style={{
                    width: 250,
                    height: 250,
                }}>
                    {/* <SImage src={require("../../../../Assets/img/bancoGanaderoQr.jpeg")} /> */}
                </SView>
                 <SHr />
                <SView row>
                    <SText color={"#19408B"} fontSize={22} bold>Gs </SText>
                    <SView width={5} />
                    <SText color={STheme.color.black} fontSize={22} bold>{SMath.formatMoney(this.props.monto)}</SText>
                </SView>
                <SHr height={15}/>
            </SView>
        </SView>
    }
}