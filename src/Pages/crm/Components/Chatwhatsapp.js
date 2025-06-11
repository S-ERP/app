import React, { Component } from "react";
import {
  SDate,
  SHr,
  SImage,
  SInput,
  SList,
  SLoad,
  SMath,
  SNavigation,
  SText,
  STheme,
  SThread,
  SView,
} from "servisofts-component";
import SSocket from "servisofts-socket";


export default class Chatwhatsapp extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mensaje: "",
            mensajes: [
                {
                    id: 1,
                    texto: "Q dice ps",
                    hora: "4:38 p.m.",
                    enviado: false,
                    fecha: "Ayer",
                },
                {
                    id: 2,
                    texto: "anda de parranda",
                    hora: "6:17 p.m.",
                    enviado: false,
                    fecha: "Ayer",
                },
                {
                    id: 3,
                    texto: "?",
                    hora: "6:17 p.m.",
                    enviado: false,
                    fecha: "Ayer",
                },
                {
                    id: 4,
                    texto: "Profe",
                    hora: "9:54 p.m.",
                    enviado: true,
                    fecha: "Ayer",
                },
                {
                    id: 5,
                    texto: "Estoy en camino",
                    hora: "9:54 p.m.",
                    enviado: true,
                    fecha: "Ayer",
                },
                {
                    id: 6,
                    texto: "delay",
                    hora: "9:55 p.m.",
                    enviado: false,
                    fecha: "Ayer",
                },
                {
                    id: 7,
                    texto:
                        "De acuerdo a lo acordado se pasas la actualización de los nuevos servicios, estos ya están disponibles en el sitio de desarrollo",
                    hora: "2:23 a.m.",
                    enviado: false,
                    fecha: "Hoy",
                    archivo: {
                        nombre: "Servicios_de_Integración.docx",
                        tipo: "DOCX",
                        tamaño: "241 kB",
                    },
                },
            ],
        }
    }

    componentDidMount() {
        // Lógica adicional si es necesaria
    }

    renderHeader() {
        return (
            <SView
                height={500}
                col={"xs-12"}
                row
                style={{
                    backgroundColor: "#202c33",
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#2a3942",
                }}
            >
                <SView col={"xs-8"} row center>
                    <SView
                        style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#667781",
                            borderRadius: 20,
                            marginRight: 15,
                        }}
                        center
                    >
                        <SText color={"white"} fontSize={18}>
                            📱
                        </SText>
                    </SView>
                    <SText color={"white"} fontSize={18} bold>
                        +591 75395848
                    </SText>
                </SView>
                <SView col={"xs-4"} row center style={{ justifyContent: "flex-end" }}>
                    <SText color={"white"} fontSize={18} style={{ marginRight: 20 }}>
                        📹
                    </SText>
                    <SText color={"white"} fontSize={18} style={{ marginRight: 20 }}>
                        🔍
                    </SText>
                    <SText color={"white"} fontSize={18}>
                        ⋮
                    </SText>
                </SView>
            </SView>
        )
    }

    renderNotificacion() {
        return (
            <SView
                col={"xs-12"}
                style={{
                    backgroundColor: "#182229",
                    borderWidth: 1,
                    borderColor: "#2a3942",
                    borderRadius: 8,
                    padding: 15,
                    margin: 20,
                }}
                center
            >
                <SText color={"#8696a0"} fontSize={13} center>
                    🔒 Se activaron los mensajes temporales. Los mensajes nuevos desaparecerán de este chat después de 24 horas de
                    haber sido enviados, a menos que se use la opción para conservarlos. Haz clic para cambiar esto.
                </SText>
            </SView>
        )
    }

    renderFechaSeparador(fecha) {
        return (
            <SView col={"xs-12"} center style={{ margin: 20 }}>
                <SView
                    style={{
                        backgroundColor: "#182229",
                        paddingHorizontal: 15,
                        paddingVertical: 8,
                        borderRadius: 8,
                    }}
                >
                    <SText color={"#8696a0"} fontSize={12}>
                        {fecha}
                    </SText>
                </SView>
            </SView>
        )
    }

    renderMensaje(mensaje) {
        const isEnviado = mensaje.enviado

        return (
            <SView key={mensaje.id} col={"xs-12"} style={{ marginBottom: 10 }}>
                <SView
                    col={"xs-8"}
                    style={{
                        alignSelf: isEnviado ? "flex-end" : "flex-start",
                        backgroundColor: isEnviado ? "#005c4b" : "#202c33",
                        borderRadius: 8,
                        padding: 12,
                        marginHorizontal: 10,
                    }}
                >
                    {mensaje.archivo && this.renderArchivo(mensaje.archivo)}
                    <SText color={"white"} fontSize={14}>
                        {mensaje.texto}
                    </SText>
                </SView>
                <SView
                    style={{
                        alignSelf: isEnviado ? "flex-end" : "flex-start",
                        marginHorizontal: 15,
                        marginTop: 5,
                    }}
                >
                    <SText color={"#8696a0"} fontSize={11}>
                        {mensaje.hora} {isEnviado && <SText color={"#53bdeb"}>✓✓</SText>}
                    </SText>
                </SView>
            </SView>
        )
    }

    renderArchivo(archivo) {
        return (
            <SView
                row
                style={{
                    backgroundColor: "#2a3942",
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 10,
                }}
            >
                <SView
                    style={{
                        width: 40,
                        height: 40,
                        backgroundColor: "#0084ff",
                        borderRadius: 8,
                        marginRight: 15,
                    }}
                    center
                >
                    <SText color={"white"} fontSize={16} bold>
                        W
                    </SText>
                </SView>
                <SView flex>
                    <SText color={"white"} fontSize={14} bold>
                        {archivo.nombre}
                    </SText>
                    <SText color={"#8696a0"} fontSize={12}>
                        {archivo.tipo} • {archivo.tamaño}
                    </SText>
                </SView>
            </SView>
        )
    }

    renderChat() {
        let fechaActual = ""

        return (
            <SView
                col={"xs-12"}
                flex
                style={{
                    backgroundColor: "#0b141a",
                    paddingBottom: 100, // Espacio para la barra de entrada
                }}
            >
                {this.renderNotificacion()}

                {this.state.mensajes.map((mensaje) => {
                    const mostrarFecha = fechaActual !== mensaje.fecha
                    if (mostrarFecha) {
                        fechaActual = mensaje.fecha
                    }

                    return (
                        <SView key={mensaje.id}>
                            {mostrarFecha && this.renderFechaSeparador(mensaje.fecha)}
                            {this.renderMensaje(mensaje)}
                        </SView>
                    )
                })}
            </SView>
        )
    }

    renderBarraEntrada() {
        return (
            <SView
                col={"xs-12"}
                row
                style={{
                    backgroundColor: "#202c33",
                    padding: 15,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                }}
            >
                <SView style={{ marginRight: 15 }}>
                    <SText color={"white"} fontSize={18}>
                        ➕
                    </SText>
                </SView>
                <SView style={{ marginRight: 15 }}>
                    <SText color={"white"} fontSize={18}>
                        😊
                    </SText>
                </SView>
                <SView flex style={{ marginRight: 15 }}>
                    <SInput
                        placeholder="Escribe un mensaje"
                        placeholderTextColor="#8696a0"
                        value={this.state.mensaje}
                        style={{
                            backgroundColor: "#2a3942",
                            borderRadius: 20,
                            paddingHorizontal: 20,
                            paddingVertical: 12,
                            color: "white",
                            borderWidth: 0,
                        }}
                        onChangeText={(mensaje) => {
                            this.setState({ mensaje })
                        }}
                        onSubmitEditing={() => {
                            this.enviarMensaje()
                        }}
                    />
                </SView>
                <SView>
                    <SText color={"white"} fontSize={18}>
                        🎤
                    </SText>
                </SView>
            </SView>
        )
    }

    enviarMensaje() {
        if (this.state.mensaje.trim()) {
            const nuevoMensaje = {
                id: this.state.mensajes.length + 1,
                texto: this.state.mensaje,
                hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                enviado: true,
                fecha: "Hoy",
            }

            this.setState({
                mensajes: [...this.state.mensajes, nuevoMensaje],
                mensaje: "",
            })
        }
    }

    render() {
        return (
            <SView col={"xs-12"}>
            <SView

                col={"xs-12"}
                center
                style={{ padding: 16, borderRadius: 16, borderWidth: 2 }}
                border={STheme.color.card}
                backgroundColor={STheme.color.card}
            >
                {this.renderHeader()}
                {this.renderChat()}




                {this.renderBarraEntrada()}
            </SView>
        </SView>

        )
    }
}
