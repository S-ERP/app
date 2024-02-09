import { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SLoad, SNavigation, SPage, SText, SView } from 'servisofts-component';
import SList from 'servisofts-component/Component/SList2';
import Container from '../../../Components/Container';
import Model from '../../../Model';

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  load_data() {
    // this.tipo_asiento = Model.tipo_asiento.Action.getAll();
    if (!this.tipo_asiento) return null;
    return true;
  }


  // hendlePress = (obj) => {
  //   if (obj.key == "1") SNavigation.navigate("ventas");
  //   console.log("cha ", obj);
  // }
  render_list() {
    if (!this.load_data()) return <SLoad />
    return <SList
      data={this.tipo_asiento}
      render={(obj) => <SView col={"xs-12"} card padding={8}
        // onPress={this.hendlePress.bind(this, a)}
        onPress={() => {
          if (obj.key == "1") return SNavigation.navigate("/contabilidad/asientos_automaticos/venta", { key: obj.key });
          if (obj.key == "2") return SNavigation.navigate("/contabilidad/asientos_automaticos/compra", { key: obj.key });
        }}
      >
        <SHr />
        <SText>{obj.descripcion}</SText>
        <SHr />
      </SView >
      }
    />
  }

  // calcularA() {
  //   return {
  //     height: 500
  //   }
  // }
  render() {
    console.log("a")
    return (
      <SPage title={'Asientos automaticos'}>
        {/* <SText style={this.calcularA()}>Hola</SText> */}
        <Container>
          {this.render_list()}
        </Container>
      </SPage>
    );
  }
}
const initStates = (state) => {
  return { state }
};
export default connect(initStates)(index);