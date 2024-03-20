import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
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

  componentDidMount() {
    SSocket.sendPromise({
      component: "tarea_usuario",
      type: "getTareasAgendadas",
      key_usuario: Model.usuario.Action.getUsuarioLog()?.key,
      key_empresa: Model.empresa.Action.getSelect()?.key,
    }).then(a => {
      this.setState({ data: a.data })
    })
  }

  getListaRetos = () => {
    var lbl_mensaje = "";
    if (!this.state.data) {
      lbl_mensaje = "Estamos intentando cargar las tareas del servidor, pero parece que tenemos problemas de conexión, intenta cargar nuevamente la ventana.";
    } else {
      Object.values(this.state.data).map((a, i) => {
        lbl_mensaje += `${i + 1}.- ${a.descripcion}` + "\n"
      })
    }

    if (!lbl_mensaje) return null;
    return <STextPlay
      time={15}
      col={"xs-12"}
      padding={16}
      card
      ref={ref => this.lbl2 = ref}
      autoplay={false}
      fontSize={18}
    >{lbl_mensaje}</STextPlay>
  }
  render() {
    return <SPage title="Home">
      <Container>

        <SHr />
        <SView row col={"xs-12"}>
          <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.reset("/")}>Volver a seleccionar empresa</SText>
          <SView width={8} />
          <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/menu")}>Menu</SText>
          <SView width={8} />
          <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/tarea/reto")}>Retos</SText>
          <SView width={8} />
          <SText padding={16} card border={STheme.color.primary} onPress={() => SNavigation.navigate("/usuario")}>Usuarios</SText>
          <SView width={8} />
        </SView>
        <SHr />
        <STextPlay
          card
          time={15}
          col={"xs-12"}
          padding={16}
          onEnd={() => this.lbl2.start()}
          fontSize={18}
        >{`Bienvenido a la empresa ${Model.empresa.Action.getSelect()?.razon_social}, tienes las siguientes actividades agendadas. `}</STextPlay>
        <SHr />
        {this.getListaRetos()}
        <SHr h={200} />

      </Container>
    </SPage>
  }
}
