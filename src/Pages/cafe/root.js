//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SSocket from 'servisofts-socket';
import { SButtom, SHr, SImage, SInput, SList, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import BarraCargando from 'servisofts-component/Component/SLoad/type/bar';
import Model from '../../Model';
import SMD from '../../SMD';
import { Container } from '../../Components';

// create a component
class index extends Component {

  componentDidMount() {
    SSocket.sendPromise({
      component: "solicitud_qr",
      type: "getAll",
      key_empresa: Model.empresa.Action.getKey(),
      tipo: "cafe",
    }).then(e => {
      this.setState({ data: e.data })
    }).catch(e => {

    })
  }
  render() {
    const usuario = Model.usuario?.Action?.getUsuarioLog();
    return (
      <SPage title={"Servisofts Srl"}>
        <Container>
          <SMD>{`

# ¡Gracias por ser parte de nuestra comunidad!

👋📱 Si disfrutas usando nuestra app y valoras el esfuerzo incansable de nuestros desarrolladores voluntarios,
\`¿considerarías invitarnos a un café ☕?\`

        `}</SMD>
          <SHr h={20} />
          <SView center >
            <SInput label={"Nombre"} type={"text"} defaultValue={usuario.Nombres + " " + usuario?.Apellidos} ref={ref => this.nombre = ref} />
            <SHr />
            <SInput label="Monto" type={"money"} center required ref={ref => this.monto = ref} />
            <SHr />
            <SText color={STheme.color.danger}>{this.state?.error}</SText>
            <SHr />
            <SButtom type='outline' style={{
              borderColor: STheme.color.success
            }} onPress={() => {
              if (this.monto.verify()) {
                this.setState({ error: "" })
                let monto = this.monto.getValue();
                SNavigation.navigate("/cafe/qr", { monto: monto, nombre: this.nombre.getValue() })
              } else {
                this.setState({ error: "El monto debe ser mayor a 0." })
              }
            }}>Invitar</SButtom>
          </SView>
          <SHr h={20} />
          <SMD>{`
![Liunk](https://rolespermisos.servisofts.com/http/page/8461328d-5af2-4d60-a1a7-9a61f2d6f45e)
¡Cada taza cuenta y nos llena de energía para seguir adelante!
        `}</SMD>
          <SList
            data={this?.state?.data}
            render={(data) => {
              return <SView col={"xs-12"} padding={8} row center onPress={()=>{
                SNavigation.navigate("/cafe/qr", { nombre: this.nombre.getValue(), qrid: data.qrid })
              }}>
                <SView width={40} height={40}>
                  <SImage src={Model.usuario._get_image_download_path(SSocket.api, data.key_usuario)} />
                </SView>
                <SView width={8} />
                <SText fontSize={18} bold>{data.razon_social}</SText>
                <SView flex />
                <SText fontSize={18} bold>{SMath.formatMoney(data.monto)}</SText>

              </SView>
            }} />
        </Container>
      </SPage>
    );
  }
}


//make this component available to the app
export default index;
