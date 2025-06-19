import React, { Component } from "react";
import { TouchableOpacity, View } from "react-native";
import { SImage, SText, SView, SIcon, SHr, STheme } from "servisofts-component";
import HoraLabel from "../Comp/HoraLabel";
import Sounds from "../../../Components/Sounds";
import MDL from "../../../MDL";

// corlor

export default class MsgAudio extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPlaying: false,
            progress: 0,
            duration: this.props.mensaje.duration,
            waveform: Array.from({ length: 30 }, () => Math.random() * 0.8 + 0.2),
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
                this.audioPlay = Sounds.play({ src: MDL.whatsapp.device.getMedia(this.props.key_device, this.props.mensaje.id._serialized) });
            } else {
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
                        width: 1.5,
                        height: value * 10,
                        backgroundColor: "white",
                        opacity: isActive ? 1 : 0.3,
                        marginRight: 2.5,
                        borderRadius: 1,
                    }}
                />
            );
        });

        return (
            <SView flex row  style={{ flexDirection: "row", alignItems: "center", }}>
                {bars}
            </SView>
        );
    };


    render() {
        const { isPlaying, progress, duration } = this.state;
        const { mensaje, color } = this.props;
        const isEnviado = mensaje.fromMe;

        const playButton = (
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
        );

        const userIcon = (
            <SView col={"xs-3"} row center backgroundColor={"transparent"}>
                <SView width={40} height={40} border={"transparent"} style={{ borderRadius: 100, overflow: "hidden", marginRight: 8 }}>
                    <SImage
                        enablePreview
                        src="https://us.123rf.com/450wm/belopoppa/belopoppa1809/belopoppa180900002/109693900-profile-placeholder-image-gray-silhouette-no-photo-of-a-person-on-the-avatar-the-default-pic-is.jpg"
                        style={{ resizeMode: "cover" }}
                    />
                </SView>
                <SView col={"xs-12"} row center style={{ position: "absolute", top: 16, left: isEnviado ? 12 : -12 }}>
                    <SIcon name="crmmicrofono" width={42} fill={isEnviado ? STheme.color.lightGray : "#43ABCD"} stroke={color} />
                </SView>
            </SView>
        );

        const waveformSection = (
            <SView flex row center backgroundColor={"transparent"}>
                <SView col={"xs-3"} row center backgroundColor={"transparent"}>
                    {playButton}
                </SView>

                <SView flex row center backgroundColor={"transparent"}>
                    <SView flex  row >
                        {this.renderWaveform()}
                    </SView>

                    <SView col={"xs-12"} row center style={{ position: "absolute", top: 20 }}>
                        <SView col={"xs-4"} center>
                            <SText color="rgba(255,255,255,0.7)" fontSize={11}>
                                {isPlaying
                                    ? `${Math.floor(progress / 60)}:${(progress % 60).toString().padStart(2, "0")}`
                                    : `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`}
                            </SText>
                        </SView>
                        <SView flex />
                        <SView col={"xs-4"} border={"transparent"} style={{ alignItems: "flex-end" }}>
                            <HoraLabel mesaje={mensaje} />
                        </SView>
                    </SView>
                </SView>
            </SView>
        );


        return (
            <View style={{ backgroundColor: this.props.color, borderRadius: 8, padding: 8, marginHorizontal: 10, width: "60%" }}>


                <SView col={"xs-12"} row center   >
                    {isEnviado ? (
                        <>
                            {userIcon}
                            {waveformSection}
                        </>
                    ) : (
                        <>
                            {waveformSection}
                            {userIcon}
                        </>
                    )}
                </SView>
            </View>
        );
    }

}
