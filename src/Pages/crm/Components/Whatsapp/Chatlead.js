import React, { Component } from "react";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../../MDL";
import Typemessage from "./Typemessage";
import { ScrollView } from "react-native-gesture-handler";

export default class Chatlead extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            mensaje: "",
            chatssssssss: "",

        };
    }


    componentDidMount() {
        const dell = MDL.whatsapp.getAllChatsById({ phone: this.props.data?.cliente?.telefono }).then(e => {

            console.log(e)
            this.setState({
                data: e
            })
        })

        // dell.map((obj) => {
        //     console.log("mernsaje " + obj.body)

        //     const mensaje = obj.body;

        // })


    }

    sendMessage = (message) => {
        const { telefono } = this.props.data?.cliente || {};
        if (telefono && message) {

            MDL.whatsapp.send({ phone: telefono, message });

            console.log(`Mensaje enviado a ${telefono}: ${message}`);
            this.campos.setValue("");
        }
    };

    renderHeader() {
        const { cliente } = this.props.data || {};
        return (
            <SView col="xs-12" row style={{ backgroundColor: STheme.color.card, padding: 8, borderBottomWidth: 1, borderBottomColor: "green" }}>
                <SView col="xs-8" row style={{ justifyContent: "flex-start" }}>
                    <SView width={40} height={40} style={{ borderRadius: 100, overflow: "hidden" }}>
                        <SImage enablePreview src="https://avatars.githubusercontent.com/u/69025139?v=4" style={{ resizeMode: "cover" }} />
                    </SView>
                    <SView flex row style={{ marginLeft: 16 }}>
                        <SText col="xs-12" color="white" fontSize={14} bold>{cliente?.nombres}</SText>
                        <SText col="xs-12" color="white" fontSize={12} bold>{cliente?.telefono}</SText>
                    </SView>
                </SView>
                <SView col="xs-4" row center style={{ justifyContent: "flex-end" }}>
                    <SIcon name="drive-menu" fill="white" width={18} height={18} />
                </SView>
            </SView>
        );
    }

    renderFechaSeparador(fecha) {
        return (
            <SView col="xs-12" center style={{ margin: 10 }}>
                <SView style={{ backgroundColor: "#182229", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 }}>
                    <SText color="#8696a0" fontSize={12}>{fecha}</SText>
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
                marginBottom:8
            }}>
                <Typemessage mensaje={mensaje} ></Typemessage>
            </SView>
        );
    }

    renderChat() {
        let fechaActual = "";

        return (
            <SView col="xs-12" flex style={{ backgroundColor: "#0b141a", paddingBottom: 20 }}>
                {(this.state.data ?? []).map((mensaje) => {
                    const mostrarFecha = fechaActual !== mensaje.fecha;
                    if (mostrarFecha) fechaActual = mensaje.fecha;
                    return (
                        <SView col="xs-12" key={`container-${mensaje.id}`}>
                            {mostrarFecha && this.renderFechaSeparador(mensaje.fecha)}
                            {this.renderMensaje(mensaje)}
                        </SView>
                    );
                })}
            </SView>
        );
    }

    renderBarraEntrada() {
        return (
            <SView col="xs-12" row style={{ backgroundColor: STheme.color.card, padding: 15, bottom: 0, left: 0, right: 0 }}>
                <SView style={{ marginRight: 15 }}>
                    <SIcon name="add1" fill="white" width={18} />
                </SView>
                <SView style={{ marginRight: 15 }}>
                    <SIcon name="addTarea" fill="white" width={18} />
                </SView>
                <SView flex style={{ marginRight: 15 }}>
                    <SInput ref={(ref) => (this.campos = ref)} placeholder="Escribe un mensaje" placeholderTextColor="#8696a0" style={{ backgroundColor: "#2a3942", borderRadius: 20, paddingHorizontal: 20, color: "white", borderWidth: 0 }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
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
            <SView col="xs-12">
                <SHr height={16} />
                <SView col="xs-12" style={{ borderRadius: 16, borderWidth: 2 }} border={STheme.color.card} backgroundColor={STheme.color.card}>
                    {/* <SHr /> */}
                    {this.renderHeader()}

                    <ScrollView ref={ref => this.scrollViewRef = ref} style={{ width: "100%", height: 550 }} onContentSizeChange={(e) => {
                        this.scrollViewRef.scrollToEnd({ animated: false });
                    }}>

                        {this.renderChat()}
                    </ScrollView>
                    {this.renderBarraEntrada()}
                </SView>
                <SHr height={16} />
            </SView>
        );
    }
}
