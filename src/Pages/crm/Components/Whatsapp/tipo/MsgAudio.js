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

        // Evita división por cero y limita el ratio entre 0 y 1
        const progressRatio = duration > 0 ? Math.min(Math.max(progress / duration, 0), 1) : 0;
        const activeIndex = Math.floor(waveform.length * progressRatio);

        const bars = waveform.map((value, index) => {
            const isActive = index < activeIndex;
            return (
                <SView
                    key={index}
                    style={{
                        width: 2,
                        height: value * 20,
                        backgroundColor: "white",
                        opacity: isActive ? 1 : 0.3,
                        marginRight: 2,
                        borderRadius: 1,
                    }}
                />
            );
        });

        return (
            <SView backgroundColor={"red"} >
                {bars}
            </SView>
        );
    };


    render() {
        const { isPlaying } = this.state;
        // this.props.mensaje.mediaData; donde iria para que se escuche mi audio
        return (
            <SView row style={{
                backgroundColor: "purple",
                // backgroundColor: this.props.color || "#075E54",
                borderRadius: 8,
                padding: 8,
                marginHorizontal: 10,
                width: "80%",
            }}>

                <SView col={"xs-12"} row center backgroundColor="yellow" >
                    <SView width={40} height={40} style={{ borderRadius: 100, overflow: "hidden", marginRight: 8 }}>
                        <SImage
                            enablePreview
                            src="https://avatars.githubusercontent.com/u/69025139?v=4"
                            style={{ resizeMode: "cover" }}
                        />
                    </SView>

                    {/* <SView flex   backgroundColor="yellow" > */}

                        <SView flex backgroundColor="blue" row >

                            {/* Botón Play/Pause */}
                            <TouchableOpacity onPress={this.togglePlay}>
                                <SView style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10
                                }}>
                                    <SIcon name={isPlaying ? "crmpause" : "crmplay"} fill="white" width={16} height={16} />
                                </SView>
                            </TouchableOpacity>

                            {/* Waveform */}
                            {this.renderWaveform()}


                        </SView>

                        {/* Tiempo y checks */}

                    {/* </SView> */}

                </SView>

                <SHr height={5} />

                {/* Tiempo y checks */}
                <SView col={"xs-12"} row center   >

                    <SView col={"xs-4"}   >

                        <SText color="rgba(255,255,255,0.7)" fontSize={11}>
                            {this.state.isPlaying
                                ? `${Math.floor(this.state.progress / 60)}:${(this.state.progress % 60).toString().padStart(2, "0")} `
                                : `${Math.floor(this.state.duration / 60)}:${(this.state.duration % 60).toString().padStart(2, "0")}`
                            }
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
