import React from "react";
import { SPage, SText, SThread, SView } from "servisofts-component";
import SIP from "../../../Components/SIP";
import { RTCSession } from "jssip/lib/RTCSession";

export default class Llamada extends React.Component<{ phone: string }> {
    llamada: RTCSession | null = null;
    handlePress = () => {
        if (!this.llamada) {
            const sip = new SIP();
            this.llamada = sip.call(this.props.phone, (e: any, evt: any) => {
                console.log("Evento de llamada:", e, evt);
            });
            this.forceUpdate();
        } else {
            this.llamada.terminate();
            this.llamada = null;
            this.forceUpdate();
        }
        // console.log(this.llamada?.)

    }
    isRun = true;
    componentDidMount() {
        this.isRun = true;
        this.hilo();
    }
    componentWillUnmount() {
        this.isRun = false;
        if (this.llamada) {
            this.llamada.terminate();
            this.llamada = null;
        }
    }
    hilo() {
        new SThread(1000, "new", false).start(() => {
            if (!this.isRun) return;
            if (this.llamada) {
                this.forceUpdate();
            }
            this.hilo();
        });
    }
    render() {
        return <SView onPress={this.handlePress.bind(this)}>
            {!this.llamada && <SText>{"LLAMAR"}</SText>}
            {this.llamada && <SText>{"COLGAR" + " " + this.llamada?.start_time}</SText>}
            <SText >{this.props.phone}</SText>
        </SView>
    }
}