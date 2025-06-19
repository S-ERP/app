import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";
import MDL from "../../../MDL";
import QuotedMsg from "../Comp/QuotedMsg";

export default class MsgStiker extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }







    render() {
        return (
            <SView style={{
                alignItems: "center",
                backgroundColor: this.props.mensaje.hasQuotedMsg ? this.props.color:"",
                padding:4,
                borderRadius:8,
            }}>
                {this.props.mensaje.hasQuotedMsg && <QuotedMsg mensaje={this.props.mensaje} key_device={this.props.key_device} />}
                <SView width={130} height={130}>
                    <SImage src={MDL.whatsapp.device.getMedia(this.props.key_device, this.props.mensaje.id._serialized)} />
                </SView>
                <HoraLabel mesaje={this.props.mensaje} style={{
                    position: "absolute",
                    width: 50,
                    bottom: 0, right: 4,
                    backgroundColor: this.props.color,
                    padding: 4,
                    borderRadius: 8
                }} />

            </SView>

        );
    }



}
