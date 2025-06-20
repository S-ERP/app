import React, { Component } from "react";
import { Linking, View } from "react-native";
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView, SIcon } from "servisofts-component";
import SSocket from "servisofts-socket";
import HoraLabel from "../Comp/HoraLabel";
import SIconApp from "../../../Assets/SIconApp";

export default class MsgDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    icono_documento(documento_type = "") {
        if (!documento_type) return null;

        // Normaliza a minúsculas y quita espacios
        const tipo = documento_type.toLowerCase().trim();

        // Verifica por extensión
        if (tipo.endsWith(".pdf") || tipo.endsWith("/pdf")) {
            return <SIconApp name="crmpdf" fill="#FF0000" />;
        }

        if (tipo.endsWith(".documento") || tipo.endsWith(".docx") || tipo.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
            return <SIconApp name="crmword" fill="#2F6AC4" />;
        }

        if (tipo.endsWith(".sheet") || tipo.endsWith(".xlsx") || tipo.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            return <SIconApp name="crmexcel" fill="#208D50" />;
        }

        if (tipo.endsWith(".presentation") || tipo.endsWith(".pptx") || tipo.includes("presentationml.presentation")) {
            return <SIconApp name="crmpresentacion" fill="#CA5131" />;
        }

        // Por defecto, genérico
        return <SIconApp name="crmpdarchivo" fill="#121514" />;
    }



    render() {
        const isEnviado = this.props.mensaje.fromMe;
        const tipoMensaje = this.props.mensaje.type;
        const tipoDocumento = this.props.mensaje._data.mimetype;
        const id = this.props.mensaje.id;
        const nombre_Documento = this.props.mensaje.body;
        const hora = this.props.mensaje.time;

        return (
            <View
                style={{
                    width: 350,
                    maxWidth: "80%",
                    marginHorizontal: 10,
                    backgroundColor: this.props.color,
                    borderRadius: 12,
                    padding: 6,
                    overflow: "hidden",
                }}>
                <SView height={this.props.mensaje._data.body ? 150 : 5} style={{ width: "100%", overflow: "hidden", backgroundColor: STheme.color.card }} onPress={(e) => {

                    const url = this.props.mensaje?.mediaData;
                    if (url) {
                        Linking.openURL(url).catch(err => {
                            console.warn("No se pudo abrir el documento:", err);
                        });
                    }
                    Linking.openURL("https://example.com/documento.pdf");
                }}>
                    {/* {this.props.mensaje._data.body ? */}
                    <SImage src={`data:img/png;base64,${this.props.mensaje._data.body}`} style={{
                        width: "100%",
                        height: "100%",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        resizeMode: "cover",
                    }} />
                    {/* : ""} */}
                </SView>

                <SView col={"xs-12"} row>
                    <SView col={"xs-12"} row backgroundColor={STheme.color.card} style={{
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        padding: 12
                    }}>
                        <SHr height={4} />
                        <SView width={32} height={32}  >
                            {this.icono_documento(tipoDocumento)}
                        </SView>
                        <SView width={4} />
                        <SView flex>
                            <SText color={"white"} fontSize={14}>{nombre_Documento}</SText>
                            <SText color={"white"} fontSize={10}>15 kps</SText>
                        </SView>

                        {!this.props.mensaje._data.body ? <SView width={32}><SIconApp name="crmpdescargararchivo" stroke={STheme.color.lightBlack} /></SView> : null}

                    </SView>
                    <SHr height={8} />
                    <SView col={"xs-12"}>
                        <SView style={{ alignItems: "flex-end" }}>
                            <HoraLabel style={{}} mesaje={this.props.mensaje} />
                        </SView>
                    </SView>
                </SView>
            </View>
        );
    }
}