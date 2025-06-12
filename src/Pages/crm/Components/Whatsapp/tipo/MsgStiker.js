import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";

export default class MsgStiker extends Component {
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



            <SView style={{ alignSelf: isEnviado ? "flex-end" : "flex-start", marginHorizontal: 15, width: "auto", maxWidth: "100%", }}>
                <SView width={100} height={100}>
                    <SImage src={this.props.colorado.stickerData} />
                </SView>
            </SView>







        );
    }



}
