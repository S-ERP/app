import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import { SImage, SText, SView, SIcon, SHr } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";
import Sounds from "../../../../../Components/Sounds";

export default class MsgAudio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            progress: 0,
            duration: this.props.mensaje.duration,
            waveform: Array.from({ length: 25 }, () => Math.random() * 0.8 + 0.2),
        };
        this.interval = null;
    }

    componentWillUnmount() {
        if (this.interval) clearInterval(this.interval);
    }

    togglePlay = () => {

        // console.log("entro " + JSON.stringify(this.props.mensaje.mediaData))

        if (this.state.isPlaying) {
            clearInterval(this.interval);
            this.setState({ isPlaying: false });
            if (this.audioPlay) {
                console.log("detener audio", this.audioPlay);
                this.audioPlay.pause();
            }
        } else {
            if (!this.audioPlay) {
                this.audioPlay = Sounds.play({ src: this.props.mensaje.mediaData });
            }else{
                console.log("reproducir audio", this.audioPlay);
                this.audioPlay.play();
            }

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
        const { isPlaying } = this.state;
        // this.props.mensaje.mediaData; donde iria para que se escuche mi audio
        return (
            <SView row style={{
                backgroundColor: this.props.color || "#075E54",
                borderRadius: 8,
                padding: 8,
                marginHorizontal: 10,
                width: "80%",
            }}>

                <SView col={"xs-12"} row center >
                    <SView width={40} height={40} style={{ borderRadius: 100, overflow: "hidden", marginRight: 8 }}>
                        <SImage
                            enablePreview
                            src="https://avatars.githubusercontent.com/u/69025139?v=4"
                            style={{ resizeMode: "cover" }}
                        />
                    </SView>

                    <SView flex row >

                        <SView style={{ flexDirection: "row", alignItems: "center" }}>

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


                        </SView>

                        {/* Tiempo y checks */}

                    </SView>

                </SView>

                <SHr height={5} />

                {/* Tiempo y checks */}
                <SView col={"xs-12"} row center   >

                    <SView col={"xs-4"}   >
                        <SText color="rgba(255,255,255,0.7)" fontSize={11}>
                            {Math.floor(this.state.progress / 60)}:{(this.state.progress % 60).toString().padStart(2, "0")}
                        </SText>
                    </SView>
                    <SView flex />
                    <SView col={"xs-4"} style={{ alignItems: "flex-end" }}  >
                        <HoraLabel mesaje={this.props.mensaje} />
                    </SView>
                </SView>
            </SView>
        );
    }
}
