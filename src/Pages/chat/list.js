import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { SComponentContainer, SDate, SHr, SImage, SList, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { Container } from '../../Components';
import SC, { Chat } from 'servisofts-rn-chat';
import { connect } from 'react-redux';

class list extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    this.key_usuario = Model.usuario.Action.getKey();
    //   SSocket.sendPromise({
    //     service: "chat",
    //     component: "chat",
    //     type: "getAll",
    //     key_usuario: Model.usuario.Action.getKey()
    //   }).then(e => {
    //     Model.chat.Action._dispatch(e);
    //     this.state.select = Object.values(e.data)[0];
    //     this.setState({ data: e.data, })
    //   }).catch(e => {

    //   })
  }

  menu() {
    return <SView col={"xs-12"} row  >
      <SText padding={8} card onPress={() => {
        SNavigation.navigate("/usuario/list", {
          onSelect: (e) => {
            let myKey = Model.usuario.Action.getKey();
            let keyUsuario2 = e.key;
            Model.chat.Action.registro({
              data: {
                // key: key,
                descripcion: e.Nombres + " " + e.Apellidos,
                observacion: "--",
                color: "#000000",
                tipo: "usuario",
              },
              users: [
                { key_usuario: myKey, tipo: "admin", },
                { key_usuario: keyUsuario2, tipo: "admin", },
              ],
              key_usuario: Model.usuario.Action.getKey()
            }).then((resp) => {
              this.setState({ select: resp.data })
              console.log(resp);
            }).catch(e => {
              console.error(e);
            })
          }
        })
      }}>Nuevo</SText>
    </SView>
  }


  renderComponent(obj) {
    let isSelect = (obj.key == this.state?.select?.key)
    return <SView col={"xs-12"} onPress={() => {
      // SNavigation.navigate("/chat/chat", { pk: obj.key })
      this.state.click = true;
      this.setState({ select: obj })
    }} card={isSelect ? true : false} >
      <SHr h={8} />
      <SView row col={"xs-12"} center>
        <SView width={50} height={50} padding={4}>
          <SView col={"xs-12"} flex style={{ borderRadius: 100, }} card>
            <SImage src={""} />
          </SView>
        </SView>
        <SView flex >
          <SView row col={"xs-12"}>
            <SText flex bold fontSize={16}>{obj.descripcion}</SText>
            <SText color={STheme.color.lightGray}>{new SDate(obj?.ultimo_mensaje?.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}</SText>
          </SView>
          <SText color={STheme.color.lightGray} >{((obj?.ultimo_mensaje?.descripcion + "").split("\n")[0]).substring(0, 40)}</SText>
        </SView>
      </SView>
      <SHr h={8} />
    </SView>
  }


  renderChat() {
    if (!this.state.select) return null;
    return <Chat
      onBack={() => {
        this.setState({ click: false })
      }}
      onPressHeader={a => {
        SNavigation.navigate("/chat/profile", { pk: this.state?.select?.key })
      }}
      // background={require("../../Assets/img/chat.jpg")}
      background={require("../../Assets/img/chat2.jpg")}
      colors={{
        // emisor: "#f0f",
        // text:"#ff0"
      }}
      // background={SSocket.api.empresa + "empresa_background/" + Model.empresa.Action.getKey()+"?time="+new SDate().toString("yyyy-MM-ddThh:mm")}
      key_chat={this.state?.select?.key}
      key_usuario={Model.usuario.Action.getKey()}
    />
  }
  render() {
    this.key_usuario = Model.usuario.Action.getKey();
    if(!this.key_usuario) return null;
    console.log(SComponentContainer.getCurrentCol());
    if (["xs"].indexOf(SComponentContainer.getCurrentCol()) > -1) {
      if (this.state.select && this.state.click) {
        return this.renderChat()
      }
    }
    let chats = Model.chat.Action.getAll({
      key_usuario: this.key_usuario
    })
    // if(SComponentContainer)
    return <SPage disableScroll>
      <SView col={"xs-12"} row flex>
        <SView col={"xs-12 sm-6 md-4 xl-3"} height padding={8} style={{
          borderRightWidth: 1,
          borderRightColor: STheme.color.card
        }} center>
          {this.menu()}
          <SHr />
          <SList
            data={chats}
            render={this.renderComponent.bind(this)}
          />
        </SView>
        <SView colHidden='xs' col={"sm-6 md-8 xl-9"} height>
          {this.renderChat()}
        </SView>
      </SView>
    </SPage>
  }
}

const initStates = (state) => {
  return { state }
};
export default connect(initStates)(list);