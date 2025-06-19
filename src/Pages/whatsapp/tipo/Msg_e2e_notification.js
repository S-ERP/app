import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";

export default class Msg_e2e_notification extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }





    renderSubType() {
        const subType = this.props.mensaje._data.subtype;
        if (subType == "encrypt"){
            return <SView col={"xs-12"} center>
                <SText color={"#FEC966"} center fontSize={12}>Los mensajes y las llamadas están cifrados de extremo a extremo. Solo las personas en este chat pueden leerlos, escucharlos o compartirlos. Obten más información.</SText>
            </SView>
        }
            return <SText color={"white"} fontSize={14}>{subType}</SText>
    }



    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const tipoMensaje = this.props.mensaje.type;
        const id = this.props.mensaje.id;

        const texto = this.props.mensaje.body;
        const hora = this.props.mensaje.time;



        return (

            <SView col={"xs-12"} center>
                <SView style={{ backgroundColor: STheme.color.card, borderRadius: 4, padding: 8, marginHorizontal: 10, width: 300, maxWidth: "80%", alignItems: "center" }}>
                    {this.renderSubType()}
                </SView>
            </SView>







        );
    }



}
