import { FlatList, ScrollView, Text, View } from 'react-native'
import React, { Component } from 'react'
import PButtom2 from '../../../Components/PButtom2'
import { SHr, SIcon, SImage, SInput, SNavigation, SText, STheme, SView } from 'servisofts-component'
import MDL from '../../../MDL';

export default class MensajeDetalle extends Component {

  renderChat() {
    if (!this.props?.data) return <SText>Cargando...</SText>
    if (!this.props?.data?.messages) return <SView center flex col={"xs-12"} height
      style={{
        justifyContent: "center",
        alignItems: "center"
      }} >
      <SHr height={32} />
      <SText>No hay mensajes</SText>
    </SView>

    var colorRedSocial = STheme.color.text;
    switch (this.props?.data?.red_social) {
      case "redesFacebook":
        colorRedSocial = "#0866FF";
        break;
      case "redesInstagram":
        colorRedSocial = "#C837AB";
        break;
      case "redesTwitter":
        colorRedSocial = "#000000"  ;
        break;
      case "redesLinkedIn":
        colorRedSocial = "#0077B5";
        break;
      case "redesWhatsApp":
        colorRedSocial = "#005c4b";
        break;
      case "redesTelegram":
        colorRedSocial = "#0088CC";
        break;
      case "redesSnapchat":
        colorRedSocial = "#6e6d04ff";
        break;
      case "redesTikTok":
        colorRedSocial ="#000000" ;
        break;
      default:
        colorRedSocial = STheme.color.card;
        break;
    }

    return this.props?.data?.messages.map((msg, index) => {

      var isMe = msg.fromMe;
      return (
        <SView key={index} col={"xs-12"} row style={{
          justifyContent: isMe ? "flex-end" : "flex-start", padding: 8,
          selectable: true, // Evita que el texto sea seleccionable
          userSelect: "text", // Evita que el texto sea seleccionable
        }}>
          <SView style={{
            backgroundColor: isMe ? colorRedSocial : STheme.color.card,
            borderTopEndRadius: 10,
            borderTopStartRadius: 10,
            borderBottomEndRadius: isMe ? 0 : 10,
            borderBottomStartRadius: isMe ? 10 : 0,
            padding: 8,
            maxWidth: "80%",
          }}>
            {msg.type === "chat" ? (
              <SText color={isMe ? STheme.color.white : STheme.color.text}>{msg.body}</SText>
            ) : (
              <SView>
                <SImage src={msg.url} style={{ width: 200, height: 200, borderRadius: 8 }} />
                {msg.caption ? <SText color={isMe ? STheme.color.white : STheme.color.text}>{msg.caption}</SText> : null}
              </SView>
            )}
          </SView>
        </SView>
      )
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
          <SIcon name="add1" fill={STheme.color.text} width={18} />
        </SView>
        {/* <SView style={{ marginRight: 15 }}>
                      <SIcon name="addTarea" fill="white" width={18} />
                  </SView> */}
        <SView flex style={{ marginRight: 15 }} >
          <SInput multiline={true} ref={(ref) => (this.campos = ref)} placeholder="Escribe un mensaje" placeholderTextColor="#8696a0"
            style={{
              height: 30,
              paddingTop: 3,
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
          <SIcon name="MessageSend" fill={STheme.color.text} width={18} />
        </SView>
      </SView>
    );
  }

  render() {
    console.log("Data MensajesLista", this.props?.data);
    return (

      <SView col={"xs-12"} style={{ flex: 1, height: "100%" }}>
        <SView col={"xs-12"} row padding={8} style={{
          borderBottomColor: STheme.color.card,
          borderBottomWidth: 1,
          backgroundColor: STheme.color.card,
          height: 50,
          alignItems: "center",
        }} >
          <SText bold fontSize={15} color={STheme.color.text} >Conversación con {this.props?.data?.name}</SText>
        </SView>
        <SView col={"xs-12"} flex>
          <ScrollView ref={ref => this.scrollViewRef = ref} style={{ width: "100%", flex: 1, }} onContentSizeChange={(e) => {
            this.scrollViewRef.scrollToEnd({ animated: false });
          }}>
            {this.renderChat()}
          </ScrollView>
        </SView>
        {this.renderBarraEntrada()}
      </SView >
    )
  }
}
