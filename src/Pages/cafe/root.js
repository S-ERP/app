//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SSocket from 'servisofts-socket';
import { SHr, SImage, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import BarraCargando from 'servisofts-component/Component/SLoad/type/bar';
import Model from '../../Model';

// create a component
class index extends Component {

  constructor(props) {
    super(props);
    this.state = {};

  }

  getQrServer() {
    SSocket.sendPromise({
      component: "solicitud_qr",
      type: "getQr",
      estado: "cargando",
      version: "V1",
      key_usuario: Model.usuario.Action.getKey(),
      key_empresa: Model.empresa.Action.getKey(),
      monto: 0,
      descripcion: "Invitanos un cafe",
      nit: "nit",
      razon_social: "Razon Social",
      correos: [""],

    }, 2 * 60 * 1000).then(e => {
      this.setState({ loading: false, dataqr: e.data })
      this.isRun = true;
      this.hilo()
      console.log(e);
    }).catch(e => {
      this.setState({ loading: false, error: e?.error })
      //SPopup.alert(e?.error)
      console.log(e?.error)
      //SNavigation.goBack();
      console.error(e)
    })
  }


  getQr() {
    var po = this.state?.dataqr
    if (!po) return null;
    return "data:image/jpeg;base64," + po?.qrImage;
  }

  getQRComponent() {
    if (!this.state?.dataqr) {
      this.getQrServer()
      return <SView col={"xs-12"} height={100} center >
        <SText color={STheme.color.gray} col={"xs-10"} center bold>{"Solicitando el código QR al banco.\nEs posible que tome un poco de tiempo."}</SText>
        <SHr h={16} />
        <BarraCargando col={"xs-11"} />
      </SView>
    }
    return <SView col={"xs-12"} height={300} center >
      <SImage src={this.getQr()} height={"100%"}
        enablePreview
        style={{
          // resizeMode: "contain"
          // resizeMode: "cover"
        }} />
    </SView>
  }

  render() {
    return (
      <SPage title={"Servisofts Srl"}>

        <SText center style={{ marginTop: 20 }}>
          ¡Gracias por ser parte de nuestra comunidad!
        </SText>
        <SText center>
          👋📱 Si disfrutas usando nuestra app y valoras el esfuerzo
          incansable de nuestros desarrolladores voluntarios,
        </SText>
        <SText center>
          ¿considerarías invitarnos a un café? 🍵☕
        </SText>
        {this.getQRComponent()}

        <SText center >
          Escanea el código QR para hacer un pequeño depósito y ayudarnos a
          mantener la app activa y mejorando.
        </SText>
        <SText center >
          ¡Cada taza cuenta y nos
          llena de energía para seguir adelante!
        </SText>
      </SPage>
    );
  }
}


//make this component available to the app
export default index;
