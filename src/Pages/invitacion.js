import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SHr, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Container from '../Components/Container';
import STextPlay from '../Components/STextPlay';
import Model from '../Model';
import SSocket from 'servisofts-socket';

export default class home extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // componentDidMount() {
  //   SSocket.sendPromise({
  //     component: "tarea_usuario",
  //     type: "getTareasAgendadas",
  //     key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
  //     key_empresa: Model.empresa.Action.getSelect()?.key,
  //   }).then(a => {
  //     this.setState({ data: a.data })
  //   })

  //   this.setState({ dataUser: Model.usuario.Action.getUsuarioLog() })
  //   this.setState({ dataUserInvitacion: Model.usuario.Action.getByKey("b2aa9d81-5f63-40ce-ae35-31fbb1417745") })
  // }

  getInvitacion = () => {
    return <SView row col={"xs-12"} card padding={15} border={STheme.color.primary} center>
      <SHr height={20} />
      <SText fontSize={25} onPress={() => SNavigation.reset("/")}>INVITACIÓN</SText>
      <SHr height={20} />
      <SView col={"xs-12"} center>
        <SView width={80} height={80} style={{ padding: 4, borderRadius: 40 }}>
          <SView flex height card style={{
            overflow: 'hidden',
            borderRadius: 40
          }}>
            <SImage src={SSocket.api.root + "usuario/" + this.state.dataUserInvitacion?.key} />
          </SView>
        </SView>
        <SText color={STheme.color.gray} fontSize={12} center >{this.state.dataUserInvitacion?.Correo ?? ""}</SText>
      </SView>
      <SHr height={20} />
      <SView col={"xs-12"} center row>
        <SText fontSize={15} bold center>{this.state.dataUserInvitacion?.Nombres ?? ""} {this.state.dataUserInvitacion?.Apellidos ?? ""}</SText>
        <SText fontSize={15} > te invita a formar parte de la empresa </SText>
        <SText color={STheme.color.gray} fontSize={18} center underLine >SERVISOFTS</SText>
        <SHr height={30} />
        <SView col={"xs-12"} center >

          <SText center fontSize={15} style={{ fontStyle: 'italic' }}> "Ejemplo de descripción de invitación para que sea leìdo por el usuario. Ejemplo de descripción de invitación para que sea leìdo por el usuario" </SText>
        </SView>
      </SView>
      <SHr height={30} />
      <SView col={"xs-12"} center row>
        <SText fontSize={13} center>La invitación tiene un tiempo de validez</SText>
        <SHr width={10} />
        <SText fontSize={13} center>De: </SText>
        <SText fontSize={15} bold center>01/04/24</SText>
        <SView width={10} />
        <SText fontSize={13} center>Hasta: </SText>
        <SText fontSize={15} bold center>03/04/24</SText>

      </SView>
      <SHr height={30} />
      <SView col={"xs-12"} center row>
        <SButtom type={"outline"} >Aceptar</SButtom>
        <SView width={16} />
        <SButtom type={"danger"} >Cancelar</SButtom>
      </SView>
      <SHr height={20} />
    </SView>
  }
  render() {
    console.log('dataUser', this.state.dataUser)
    console.log('dataUserInvitacion', this.state.dataUserInvitacion)
    return <SPage title="Invitación" >
      <Container >
        <SHr />
        {this.getInvitacion()}
        <SHr h={200} />
      </Container>
    </SPage>
  }
}
