import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon, SUuid } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import Typemessage from "./Typemessage";
import { ScrollView } from "react-native-gesture-handler";
import FileChooser from "../../Components/SUpload/FileChooser";

export default class Chatlead extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            mensaje: "",

        };
    }


    async componentDidMount() {
        SSocket.addEventListener("onMessage", this.onMessageSocket)
        this.loadData();
        const dispositivo = await MDL.whatsapp.device.getByKey(this.props.idDevice);
        this.setState({ dispositivo });
    }
    componentWillUnmount() {
        SSocket.removeEventListener("onMessage", this.onMessageSocket);
    }

    onMessageSocket = (data) => {
        if (data.component != "whatsapp") return;
        if (data.type != "event") return;
        if (!["message_create", "message"].includes(data.event)) return;
        this.loadData();

    }
    loadData() {
        const dell = MDL.whatsapp.getAllChatsById({ key_device: this.props.idDevice, idchat: this.props.idchat }).then(e => {

            console.log("si ",e)
            this.setState({
                data: e
            })
        })

    }

    sendMessage = (message) => {
        const telefono = this.props.idchat.split("@")[0];
        if (telefono && message) {

            MDL.whatsapp.send({ key_device: this.props.idDevice, phone: telefono, message }).then(e => {

                this.state.data.push({
                    id: SUuid(),
                    body: message,
                    type: "chat",
                    fromMe: true,
                    timestamp: new Date().getTime() / 1000,
                    mediaData: null,
                    location: null
                })
                this.forceUpdate();
                // this.componentDidMount();
            })

            console.log(`Mensaje enviado a ${telefono}: ${message}`);
            this.campos.setValue("");
        }
    };
    // sendImage = (image) => {
    //     const { telefono } = this.props.data?.cliente || {};
    //     if (telefono && image) {

    //         MDL.whatsapp.send({ phone:  this.props.data?.cliente?.telefono, image:image }).then(e => {

    //             this.state.data.push({
    //                 id: SUuid(),
    //                 body: message,
    //                 type: "image",
    //                 fromMe: true,
    //                 timestamp: new Date().getTime() / 1000,
    //                 mediaData: "data:image/png;base64," + image,
    //                 location: null
    //             })
    //             this.forceUpdate();
    //             // this.componentDidMount();
    //         })

    //         console.log(`Mensaje enviado a ${telefono}: ${message}`);
    //         this.campos.setValue("");
    //     }
    // };

    renderHeader() {
        const { data, idDevice, idchat } = this.props;
        const { dispositivo } = this.state;

        if (!dispositivo) return <SLoad />;

        const lastSeenRaw = dispositivo?.fecha_on;
        const lastSeenDate = lastSeenRaw ? new Date(lastSeenRaw) : null;

        let lastSeenText = "desconocido";
        if (lastSeenDate) {
            const now = new Date();
            const isToday = lastSeenDate.toDateString() === now.toDateString();

            const timeStr = lastSeenDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            const dateStr = lastSeenDate.toLocaleDateString();

            lastSeenText = isToday ? `hoy a la(s) ${timeStr}` : `${dateStr} a la(s) ${timeStr}`;
        }

        return (
            <SView col="xs-12" row style={{ backgroundColor: STheme.color.card, padding: 8 }}>
                <SView col="xs-8" row style={{ justifyContent: "flex-start" }}>
                    <SView width={40} height={40} style={{ borderRadius: 100, overflow: "hidden" }}>
                        <SImage
                            enablePreview
                            src={MDL.whatsapp.device.getUrlImage(idDevice, idchat)}
                            style={{ resizeMode: "cover" }}
                        />
                    </SView>
                    <SView flex row style={{ marginLeft: 16 }} center>
                        <SText col="xs-12" color="white" fontSize={14} bold>{data?.name || "Sin nombre"}</SText>
                        <SText col="xs-12" color="white" fontSize={12} bold>últ. vez {lastSeenText}</SText>
                        <SText col="xs-12" color="white" fontSize={12} bold>En línea</SText>
                    </SView>
                </SView>
                <SView col="xs-4" row center style={{ justifyContent: "flex-end" }}>
                    <SIcon name="drive-menu" fill="white" width={18} height={18} />
                </SView>
            </SView>
        );
    }


    renderFechaSeparador(fecha) {
        let mensage = fecha;
        if (fecha == new SDate().toString("yyyy-MM-dd")) {
            mensage = "Hoy";
        }
        return (
            <SView col="xs-12" center style={{ margin: 10 }}>
                <SView style={{ backgroundColor: "#182229", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}>
                    <SText color="#8696a0" fontSize={12}>{mensage}</SText>
                </SView>
            </SView>
        );
    }




    renderMensaje(mensaje) {
        const isEnviado = mensaje.fromMe;
        const tipoMensaje = mensaje.type;

        return (
            <SView col={"xs-12"} key={mensaje.id} style={{
                alignItems: isEnviado ? "flex-end" : "flex-start",
                marginBottom: 8
            }}>
                <Typemessage mensaje={mensaje}  key_device={this.props.idDevice}></Typemessage>
            </SView>
        );
    }

    renderChat() {
        let fechaActual = "";

        return (this.state.data ?? []).map((mensaje) => {
            const fecha = new SDate(new Date(mensaje.timestamp * 1000)).toString("yyyy-MM-dd");
            const mostrarFecha = fechaActual !== fecha;
            if (mostrarFecha) fechaActual = fecha;
            return (
                <SView col="xs-12" key={`container-${mensaje.id}`} style={{
                    selectable: true, // Evita que el texto sea seleccionable
                    userSelect: "text", // Evita que el texto sea seleccionable
                }}>
                    {mostrarFecha && this.renderFechaSeparador(fecha)}
                    {this.renderMensaje(mensaje)}
                </SView>
            );
        })
    }

    renderBarraEntrada() {
        return (
            <SView col="xs-12" row style={{ backgroundColor: STheme.color.card, padding: 8, bottom: 0, left: 0, right: 0 }}>
                <SView style={{ marginRight: 15 }} onPress={() => {
                    FileChooser({
                        accept: "image/*",

                    }).then((files) => {
                        const reader = new FileReader();
                        const telefono = this.props.idchat.split("@")[0];
                        const INSTANCE = this;
                        reader.onload = function () {
                            const base64Image = reader.result.split(',')[1];
                            // const file = files[0];
                            // this.sendImage(base64Image);
                            MDL.whatsapp.send({ key_device: this.props.idDevice, phone: telefono, message: "", image: base64Image }).then(e => {
                                INSTANCE.state.data.push({
                                    id: SUuid(),
                                    body: "foto",
                                    type: "image",
                                    fromMe: true,
                                    timestamp: new Date().getTime() / 1000,
                                    mediaData: "data:image/png;base64," + base64Image,
                                    location: null
                                })
                                INSTANCE.forceUpdate();
                                // this.componentDidMount();
                            })

                            console.log("file", base64Image);
                        }
                        reader.readAsDataURL(files[0]);
                    })
                }}>
                    <SIcon name="add1" fill="white" width={18} />
                </SView>
                {/* <SView style={{ marginRight: 15 }}>
                    <SIcon name="addTarea" fill="white" width={18} />
                </SView> */}
                <SView flex style={{ marginRight: 15 }}>
                    <SInput multiline={true} ref={(ref) => (this.campos = ref)} placeholder="Escribe un mensaje" placeholderTextColor="#8696a0"
                        style={{
                            paddingTop: 5,
                            backgroundColor: "#2a3942", borderRadius: 20, paddingHorizontal: 20, color: "white", borderWidth: 0,
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                this.sendMessage(this.campos.getValue());
                            }
                        }}
                    />
                </SView>
                <SView onPress={() => this.sendMessage(this.campos.getValue())}>
                    <SIcon name="MessageSend" fill="white" width={18} />
                </SView>
            </SView>
        );
    }
    render() {
        return (
            <SView col="xs-12" flex >
                {/* <SHr height={16} /> */}
                {/* <SHr /> */}
                {this.renderHeader()}

                <ScrollView ref={ref => this.scrollViewRef = ref} style={{ width: "100%", flex: 1, }} onContentSizeChange={(e) => {
                    this.scrollViewRef.scrollToEnd({ animated: false });
                }}>

                    {this.renderChat()}
                </ScrollView>
                {this.renderBarraEntrada()}
                {/* <SHr height={16} /> */}
            </SView>
        );
    }
}
