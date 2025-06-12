import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";

export default class MsgImg extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }







    render() {
        const isEnviado = this.props.colorado.fromMe;
        const tipoMensaje = this.props.colorado.type;
        const id = this.props.colorado.id;

        const texto = this.props.colorado.body;
        const hora = this.props.colorado.time;

        return (


            <SView style={{ alignSelf: isEnviado ? "flex-end" : "flex-start", backgroundColor: isEnviado ? "#005c4b" : "#202c33", borderRadius: 8, padding: 12, marginHorizontal: 10, width: "auto", maxWidth: "100%" }}>

                <SView width={150} height={150}>
                    <SImage src={this.props.colorado.mediaData} />
                </SView>




            </SView>





        );
    }



}
