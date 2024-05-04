//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SSocket from 'servisofts-socket';
import { SButtom, SHr, SImage, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import BarraCargando from 'servisofts-component/Component/SLoad/type/bar';
import Model from '../../Model';
import SMD from '../../SMD';
import { Container } from '../../Components';

// create a component
export default class qr extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.monto = SNavigation.getParam("monto");
    this.nombre = SNavigation.getParam("nombre");
    this.qrid = SNavigation.getParam("qrid");

  }
  componentDidMount() {
    if (!this.qrid) {
      if (!this.monto) return;
      this.getQrServer(this.monto)
    } else {
      this.verificarPago(this.qrid);
    }

  }
  getQrServer(monto) {
    SSocket.sendPromise({
      component: "solicitud_qr",
      type: "getQr",
      estado: "cargando",
      version: "V1",
      key_usuario: Model.usuario.Action.getKey(),
      key_empresa: Model.empresa.Action.getKey(),
      monto: monto,
      descripcion: "Invitanos un cafe",
      nit: "nit",
      razon_social: this.nombre,
      correos: [""],
      tipo: "cafe"
    }, 2 * 60 * 1000).then(e => {
      this.setState({ loading: false, dataqr: e.data})
      // this.isRun = true;
      // this.hilo()
      // console.log(e);
    }).catch(e => {
      this.setState({ loading: false, error: e?.error })
      //SPopup.alert(e?.error)
      console.log(e?.error)
      //SNavigation.goBack();
      console.error(e)
    })
  }

  verificarPago = (qrid) => {
    this.setState({ loading: true })
    SSocket.sendPromise({
      component: "solicitud_qr",
      type: "getByQr",
      estado: "cargando",
      qrid: qrid,
    }).then(e => {
      this.setState({ loading: false, dataqr: e.data })
      console.log(e)
      
    }).catch(e => {
      this.setState({ loading: false })
      SNotification.send({
        title: "QR",
        body: "El qr no fue pagado.",
        color: STheme.color.danger,
        time: 5000,
      })

    })
  }

  getQr() {
    var po = this.state?.dataqr
    if (!po) return null;
    return "data:image/jpeg;base64," + po?.qrImage;
  }

  getQRComponent() {
    if (!this.state?.dataqr) {
      return <SView col={"xs-12"} height={300} center >
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
        <Container>
          <SHr h={8} />
          {this.getQRComponent()}
          <SHr h={8} />
          <SButtom
            type={"outline"}
            onPress={this.verificarPago.bind(this)}
            loading={this?.state?.loading}
          >VERIFICAR</SButtom>
        </Container>
      </SPage>
    );
  }
}


//make this component available to the app
