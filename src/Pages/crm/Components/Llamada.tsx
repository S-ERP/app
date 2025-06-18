import React from "react";
import { SHr, SIcon, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import SIP from "../../../Components/SIP";
import { RTCSession } from "jssip/lib/RTCSession";
import { View } from "react-native";
import DraggableView from "../call/DragableView";
import SIconApp from "../../../Assets/SIconApp";

export default class Llamada extends React.Component<{ phone?: string }> {
    llamada: RTCSession | null = null;
    timer: any = null;
    state = {
        estado: "",
        duracion: 0, // segundos
        evt: null,
    };

    componentWillUnmount() {
        clearInterval(this.timer);
        if (this.llamada && !this.llamada.isEnded()) {
            this.llamada.terminate();
        }
        this.llamada = null;
    }

    startTimer = () => {
        clearInterval(this.timer);
        this.setState({ duracion: 0 });
        this.timer = setInterval(() => {
            this.setState((prev) => ({ duracion: prev.duracion + 1 }));
        }, 1000);
    };

    formatDuracion = () => {
        const { duracion } = this.state;
        const h = Math.floor(duracion / 3600).toString().padStart(2, "0");
        const m = Math.floor((duracion % 3600) / 60).toString().padStart(2, "0");
        const s = (duracion % 60).toString().padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    llamar = (phone: string) => {
        if (this.llamada) return;
        const sip = SIP.getInstance();
        this.llamada = sip.call(phone, (e: string, evt: any) => {
            this.setState({ estado: e, evt });
            if (e === "connecting") {
                this.startTimer(); // Inicia el contador al conectar
            }
            if (e === "ended" || e === "failed") {
                clearInterval(this.timer);
                this.llamada = null;
            }
        });

        this.setState({ estado: "connecting" });
    };

    colgar = () => {
        if (!this.llamada) return;
        this.llamada.terminate();
        this.llamada = null;
        clearInterval(this.timer);
        this.forceUpdate();
    };

    toggleMute = () => {
        if (!this.llamada) return;
        try {
            const muted = this.llamada.isMuted()?.audio;
            if (muted) this.llamada.unmute("audio");
            else this.llamada.mute("audio");
        } catch (err) {
            console.error("Error al mutear/desmutear:", err);
        }
    };

    renderEstadoLlamada = (estado: string, color: string, texto: string) => (
        <View style={{ top: 4, width: 180 }}>
            <DraggableView
                style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: STheme.color.text,
                    backgroundColor: color,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 4,
                }}
            >
                <SView flex>
                    <SText>{texto}</SText>
                    <SText fontSize={8}>{this.formatDuracion()}</SText>
                </SView>
                {estado === "accepted" && (
                    <SView width={20} height={20} onPress={this.toggleMute}>
                        <SIconApp name="microfono" fill={STheme.color.text} />
                    </SView>
                )}
                <SView width={20} height={20} onPress={this.colgar}>
                    <SIconApp name="Close" fill={STheme.color.text} />
                </SView>
            </DraggableView>
        </View>
    );

    renderFailed = () => (
        <View style={{ top: 4, width: 180 }}>
            <DraggableView
                style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: STheme.color.text,
                    backgroundColor: STheme.color.danger,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 4,
                }}
            >
                <SView flex>
                    <SText>{this.state.evt?.cause}</SText>
                    <SText fontSize={8}>{this.state.evt?.message?.reason_phrase}</SText>
                </SView>
                <SView width={20} height={20} onPress={() => this.setState({ estado: "" })}>
                    <SIconApp name="Close" fill={STheme.color.text} />
                </SView>
            </DraggableView>
        </View>
    );

    render() {
        const { estado } = this.state;
        if (!this.llamada) return null;

        if (estado === "failed") return this.renderFailed();
        if (estado === "connecting") return this.renderEstadoLlamada(estado, "#799DF8", "Conectando...");
        if (estado === "accepted") return this.renderEstadoLlamada(estado, "#B0F333", "Cliente en línea");

        return (
            <View style={{ top: 4, width: 180 }}>
                <DraggableView
                    style={{
                        width: "100%",
                        height: 40,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: STheme.color.text,
                        backgroundColor: STheme.color.success,
                    }}
                >
                    <SText>{estado}</SText>
                </DraggableView>
            </View>
        );
    }
}
