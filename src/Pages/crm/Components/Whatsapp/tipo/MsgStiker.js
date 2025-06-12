import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";

export default class MsgStiker extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }







    render() {
        return (
            <SView>
                <SView width={130} height={130}>
                    <SImage src={this.props.mensaje.stickerData} />
                </SView>
                <HoraLabel mesaje={this.props.mensaje} />

            </SView>

        );
    }



}
