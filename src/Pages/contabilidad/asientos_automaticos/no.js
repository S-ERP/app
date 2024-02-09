import { Component } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { SDate, SHr, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Container from '../../../Components/Container';
import Model from '../../../Model';
// import Container from '../../Components/Container';
// import Model from '../../Model';
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.keyNavigate = SNavigation.getParam("key", null);
  }


  componentDidMount = async () => {
    // this.getData();
    //this.state.parametros.inicio = new SDate().addMonth(1).setDay(1).addDay(-1).toString("yyyy-MM-dd");
    //this.setState({ ...this.state });
    //console.log("aprobo ", this.state.parametros.inicio);
    //this.getUltimaFecha()

  }

  getUltimaFecha = async () => {

    return await SSocket.sendPromise({
      component: "asiento_automatico",
      type: "getMaxFecha",
      key: "1"
    })
      .then((resp) => {
        if (resp.estado === "error") return resp;
        return resp.data;
      })
      .catch((e) => {
        return { estado: "error", error: e }
      });
  }

  getGestiones = async () => {

    return await SSocket.sendPromise({
      component: "asiento_automatico",
      type: "getMaxFecha",
      key: "1"
    })
      .then((resp) => {
        if (resp.estado === "error") return resp;
        return resp.data;
      })
      .catch((e) => {
        return { estado: "error", error: e }
      });
  }

  init() {

    var gestiones = Model.gestion.Action.getSelect();
    if (!gestiones) return <SLoad />

    // let ultimaFecha = await this.getUltimaFecha();
    // if (ultimaFecha.estado === "error") {
    //   return <SText>{obj.error}</SText>
    // }

    return <SView>
      <SView>
        <SText>{gestiones}</SText>
      </SView>
      <SView row>
        <Text style={{ fontSize: 14, color: STheme.color.text }}> {gestiones?.fecha} </Text>;
        <Text style={{ fontSize: 14, color: STheme.color.text }}> {new SDate().toString("dd/MM/yyyy")} </Text>;
      </SView>
    </SView>
  }

  render() {

    return <SPage title={this.state.title} center  >
      <Container>

        <SHr height={10} />

        {this.init()}
        <SHr height={20} />
      </Container>
    </SPage>
  }
}

const initStates = (state) => {
  return { state }
};
export default connect(initStates)(index);