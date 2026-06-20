import React from "react";
import { SImage, SPage, SText, STheme, SView, SGradient, SHr, SMath, SLoad } from "servisofts-component";
import { TipoPasarelaProps } from "./index"
import SSocket from "servisofts-socket";
import MDL from "../../../../MDL";

export default class banco_economico extends React.Component<TipoPasarelaProps> {
    state = {

    }
    componentDidMount(): void {
        console.log("getQr", this.props)
        SSocket.sendPromise({
            component: "solicitud_qr",
            type: "getQr",
            estado: "cargando",
            version: "V1",
            key_usuario: MDL.usuario.session?.key,
            key_empresa: MDL.empresa.select?.key,
            monto: this.props.monto,
            descripcion: this.props.descripcion || "Pago con QR",
            nit: "nit",
            razon_social: "RICARDO PAZ DEMIQUEL",
            correos: [""],
            tipo: this.props.tipo ?? "pago_caja",
            data: this.props?.data,
            key_bg_profile: this.props.pasarela_empresa?.params?.key_bg_profile
        }, 2 * 60 * 1000).then(e => {
            this.setState({ loading: false, dataqr: e.data })
            // this.isRun = true;
            // this.hilo()
            // console.log(e);
        }).catch(e => {
            this.setState({ loading: false, error: e?.error })
            //SPopup.alert(e?.error)
            console.log(e?.error)
            //SNavigation.goBack();
            console.error(e)
        })
    }
    getQr() {
        // @ts-ignore
        var po = this.state?.dataqr
        if (!po) return null;
        if (!po?.qrImage) return null;
        return "data:image/jpeg;base64," + po?.qrImage;
    }
    render() {
        return <SView col={"xs-12"} center padding={15}>
            <SGradient colors={["#EC2625", "#ffffff"]}  ></SGradient>
            <SView col={"xs-10"} backgroundColor={STheme.color.white} center
                style={{
                    borderRadius: 25,
                    overflow: "hidden"
                }}>
                <SView col={"xs-12"} backgroundColor={"#EC1C26"} height={70} width={"100%"}
                    style={{ overflow: "hidden" }}>
                    <SImage src={require("../../../../Assets/img/bancoEconomico.jpg")} style={{ resizeMode: "cover" }} />
                </SView>
                <SHr />
                <SView style={{
                    width: 250,
                    height: 250,
                }} center>
                    {!this.getQr() && <SLoad color={"#000"} />}
                    {this.getQr() && <SImage src={this.getQr()} height={"100%"}
                        enablePreview
                        style={{

                        }} />
                    }
                </SView>
                <SHr />
                <SView row>
                    {/* <SText color={"#80BB01"} fontSize={22} bold>Bs </SText> */}
                    {/* <SView width={5} /> */}
                    {/* <SText color={STheme.color.black} fontSize={22} bold>{SMath.formatMoney(this.props.monto)}</SText> */}
                </SView>
                <SHr height={15} />
            </SView>
        </SView>
    }
}