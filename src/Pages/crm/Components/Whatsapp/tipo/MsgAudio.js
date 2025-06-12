import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import { SImage, SText, SView, SIcon } from "servisofts-component";

export default class MsgAudio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            progress: 0,
            duration: 70,
            waveform: Array.from({ length: 25 }, () => Math.random() * 0.8 + 0.2),
        };
        this.interval = null;
    }

    componentWillUnmount() {
        if (this.interval) clearInterval(this.interval);
    }

    togglePlay = () => {
        if (this.state.isPlaying) {
            clearInterval(this.interval);
            this.setState({ isPlaying: false });
        } else {
            this.setState({ isPlaying: true });
            this.interval = setInterval(() => {
                this.setState((prev) => {
                    if (prev.progress >= prev.duration) {
                        clearInterval(this.interval);
                        return { isPlaying: false, progress: 0 };
                    }
                    return { progress: prev.progress + 1 };
                });
            }, 1000);
        }
    };

    renderWaveform = () => {
        const { waveform, progress, duration } = this.state;
        const progressRatio = progress / duration;
        const bars = waveform.map((value, index) => {
            const isActive = index < waveform.length * progressRatio;
            return (
                <View
                    key={index}
                    style={{
                        width: 2,
                        height: value * 20,
                        backgroundColor: isActive ? "white" : "rgba(255,255,255,0.3)",
                        marginRight: 2,
                        borderRadius: 1,
                    }}
                />
            );
        });
        return <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>{bars}</View>;
    };

    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const texto = this.props.mensaje.body;
        const hora = new Date(500 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const { isPlaying } = this.state;

        return (
            <View style={{
                backgroundColor: this.props.color || "#075E54",
                borderRadius: 8,
                padding: 12,
                marginHorizontal: 10,
                width: "80%",
                flexDirection: "row",
                alignItems: "center",
            }}>
                {/* Avatar */}
                <SView width={40} height={40} style={{ borderRadius: 100, overflow: "hidden", marginRight: 8 }}>
                    <SImage
                        enablePreview
                        src="https://avatars.githubusercontent.com/u/69025139?v=4"
                        style={{ resizeMode: "cover" }}
                    />
                </SView>

                {/* Botón Play/Pause */}
                <TouchableOpacity onPress={this.togglePlay}>
                    <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10
                    }}>
                        <SIcon name={isPlaying ? "crmpause" : "crmplay"} fill="white" width={16} height={16} />
                    </View>
                </TouchableOpacity>

                {/* Waveform */}
                {this.renderWaveform()}

                {/* Hora */}
                <SView style={{ marginLeft: 8 }}>
                    <SText color={"rgba(255,255,255,0.7)"} fontSize={10}>{55}</SText>
                </SView>


                {/* Tiempo y checks */}
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 4, alignItems: "center" }}>
                    <SText color="rgba(255,255,255,0.7)" fontSize={11}>
                        {hora}

                        {/* {Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, "0")} */}
                    </SText>
                    <View style={{ width: 8 }} />
                    <SText color="rgba(255,255,255,0.7)" fontSize={11}>
                        {hora}
                    </SText>
                    <View style={{ width: 4 }} />

                </View>

            </View>
        );
    }
}
