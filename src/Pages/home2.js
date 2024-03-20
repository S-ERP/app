import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SHr, SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Container from '../Components/Container';
import STextPlay from '../Components/STextPlay';
import Model from '../Model';
import SSocket from 'servisofts-socket';

export default class home2 extends Component {
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

  getSViewstaRetos = () => {
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

  getContent=()=>{
    return <SView flex row>
      <SView style={style.days}>
      <SText>Dom</SText>
      <SText>Lun</SText>
      <SText>Mar</SText>
      <SText>Mie</SText>
      <SText>Jue</SText>
      <SText>Vie</SText>
      <SText>Sav</SText>
    </SView>

    <SView style={style.days}>
      <SText>1</SText>
      <SText>2</SText>
      <SText>3</SText>
      <SText>4</SText>
      <SText>5</SText>
      <SText>6</SText>
      <SText>7</SText>
    </SView>
    
  </SView>

    

  };

  render() {
    return <SPage title="Home">
      <Container>
        
      <SView width={700} style={{
                    overflow: 'scroll',
                }}>

        <SView row col={"xs-12"}>
          <SView width={40}></SView>
          <SText width={50} padding={5}>Ene</SText>
          <SText width={50} padding={5}>Feb</SText>
          <SText width={50} padding={5}>Mar</SText>
          <SText width={50} padding={5}>Abr</SText>
          <SText width={50} padding={5}>May</SText>
          <SText width={50} padding={5}>Jun</SText>
          <SText width={50} padding={5}>Jul</SText>
          <SText width={50} padding={5}>Ago</SText>
          <SText width={50} padding={5}>Sep</SText>
          <SText width={50} padding={5}>Oct</SText>
          <SText width={50} padding={5}>Nov</SText>
          <SText width={50} padding={5}>Dic</SText>
        </SView> 
        {this.getContent()}
       

        <SView  style={style.squares}>
        
        </SView>

      </SView>
        
      
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
        {this.getSViewstaRetos()}
        <SHr h={200} />

      </Container>
    </SPage>
  }  
}

const style = StyleSheet.create({
 
  months: {
    display:'flex',
    flexDirection:'row'
  },
  days: {
    borderColor:"#f00"
  },
  squares: {
    borderColor:"#f00"
  },
});