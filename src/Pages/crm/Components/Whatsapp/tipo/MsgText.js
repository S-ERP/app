import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";

export default class MsgText extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }







    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const tipoMensaje = this.props.mensaje.type;
        const id = this.props.mensaje.id;

        const texto = this.props.mensaje.body;
        const hora = this.props.mensaje.time;

        return (

            <SView style={{ backgroundColor: this.props.color, borderRadius: 8, padding: 8, marginHorizontal: 10, width: "auto", maxWidth: "80%" , alignItems:"flex-end"}}>
                <SText color={"white"} fontSize={14}>{texto}</SText>
                <HoraLabel mesaje={this.props.mensaje} />
            </SView>







        );
    }



}
