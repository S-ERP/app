import { Component } from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';
import { ExportExcel, SDate, SHr, SImage, SInput, SList, SLoad, SNavigation, SPage, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Container from '../../../Components/Container';
import Model from '../../../Model';
class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      title: "Comparativos ",
      func: "_get_fidelizacion_comparativos",
      parametros: {
        "inicio": new SDate().addMonth(-2).setDay(1).toString("yyyy-MM-dd"),
        "fin": new SDate().addMonth(1).setDay(1).addDay(-1).toString("yyyy-MM-dd"),
      },
      ...this.state,
    };
    this.keyNavigate = SNavigation.getParam("key", null);

  }


  componentDidMount() {
    this.getData();
    Model.usuario.Action.getAll({ force: true });
  }

 

  getData() {
    this.setState({ loading: "cargando", data: null });
    SSocket.sendPromise({
      component: "reporte",
      type: "execute_function",
      func: this.state.func,
      // params: this.state.params,
      params: ["'" + new SDate().addMonth(-2).setDay(1).toString("yyyy-MM-dd") + "'", "'" + new SDate().addMonth(1).setDay(1).addDay(-1).toString("yyyy-MM-dd") + "'"],
      ...this.params
    })
      .then((resp) => {
        this.setState({ loading: false, data: resp.data });
      })
      .catch((e) => {
        this.setState({ loading: false, error: e });
      });
  }
  getData2() {
    this.setState({ loading: "cargando", data2: null });
    SSocket.sendPromise({
      component: "asiento_automatico",
      type: "getMaxFecha",
      key: this.keyNavigate
    })
      .then((resp) => {
        this.setState({ loading: false, data2: resp.data });
      })
      .catch((e) => {
        this.setState({ loading: false, error: e });
      });
  }



  valido_CI(ci) {
    return <Text style={{ fontSize: 16, color: (ci.length < 7 ? "red" : STheme.color.text), }}>{"CI: " + ci}</Text>
  }
  valido_sucursal(numero) {
    return <Text center style={{
      color: STheme.color.text, position: "absolute", right: 0,
    }}>{"(" + numero + ")"}</Text>
  }
  valido_Telefono(telefono) {
    if(!telefono ) return;

    return <Text style={{
      color: (telefono?.length < 8
        || telefono.charAt(0) !== "7"
        && telefono.charAt(0) !== "6"
        && telefono.charAt(0) !== "+"
        ? "red" : STheme.color.text),
    }}>{"Telefono: " + telefono}</Text>
  }
  valido_Correo(correo) {
    return <Text style={{ color: (correo.length < 12 ? "red" : STheme.color.text), }}>{"Correo: " + correo}</Text>
  }

  getParametros() {

    var aux = 0;

    var gestiones = Model.gestion.Action.getSelect();
    if (!gestiones) return <SLoad />

    if (!this.state.data2) {
      aux = new SDate(gestiones?.fecha, "yyyy-MM-dd").toString("yyyy-MM-dd");
    } else {
      aux = this.state.data2;
    }


    return <>
      <SView col={"xs-12"} center row border={"transparent"}>
        <SView col={"xs-12"} height={40} center row border={"transparent"} >
          <SInput flex type={"date"} customStyle={"calistenia"} value={aux} style={{ width: "100%", height: "100%", borderRadius: 4, borderColor: "#666" }} />
          <SView height width={20} />
          <SInput flex type={"date"} customStyle={"calistenia"} defaultValue={this.state.parametros.fin.toString("dd-MM-yyyy")} style={{ width: "100%", height: "100%", borderRadius: 4, borderColor: "#666" }}
            onChangeText={(val) => {
              if (this.state.parametros.fin != val) {
                this.state.parametros.fin = val;
                this.getData();
              }
            }}
          />
        </SView>
      </SView >
      <SView col={"xs-12"} height={18} />

    </>
  }






  valido_veces(numero, sucursal) {
    return <>
      <Text center style={{
        color: STheme.color.text, position: "absolute", right: 0,
      }}>{"veces (" + numero + ")"}</Text>
      {/* <SHr></SHr> */}
      <Text center style={{
        color: STheme.color.text, position: "absolute", right: 0, top: 20
      }}>{sucursal}</Text>
    </>
  }
  getItem2(_data, usuario) {
    return <SView col={"xs-12"} height={60} center>
      <SView col={"xs-12"} center row border={"#6664"} height onPress={() => {
        SNavigation.navigate("ClientePerfilPage", { key: usuario.key });
      }} >
        <View style={{ flexDirection: "row", height: "100%", width: "100%", alignItems: "center" }}>
          <View style={{
            width: 40, height: 40, marginRight: 8, justifyContent: "center", alignItems: "center", backgroundColor: STheme.color.card, borderRadius: 100, overflow: "hidden"
          }}>
            <SImage src={SSocket.api.root + "usuario/" + usuario?.key + `?date=${new Date().getTime() / 500}`} />
          </View>
          <View row style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 14, color: STheme.color.text }}>{usuario.Nombres + " " + usuario.Apellidos}



              {this.valido_veces(_data.veces, _data.descripcion)}</Text>
            <Text style={{ fontSize: 12, color: STheme.color.text }}>{this.valido_Telefono(usuario?.Telefono)}</Text>
            <Text style={{ fontSize: 12, color: STheme.color.text }}>{this.valido_Correo(usuario?.Correo)} </Text>
          </View>
        </View>
      </SView>
    </SView>

    // })

  }
  getLista() {
    if (!this.state.data) return <SLoad />
    var usuarios = Model.usuario.Action.getAll();
    if (!usuarios) return <SLoad />
    let data = this.state.data.map(obj => {
      obj.usuario = usuarios[obj?.key_usuario]
      return obj;
    })

    return <>
      <ExportExcel
        header={[
          { key: "indice", label: "Nro", width: 40 },
          { key: "nombre", label: "Nombre", width: 200 },
          { key: "nombre_completo", label: "Nombre completo", width: 200 },
          { key: "telefono", label: "Telefono", width: 90 },
          { key: "correo", label: "Correo", width: 150 },
          { key: "cumpleaños", label: "Cumpleaños", width: 80 },
          { key: "sucursal", label: "Sucursal", width: 70 },
        ]}
        getDataProcesada={() => {
          var daFinal = {};
          let cant = 0;
          Object.values(data).map((obj, i) => {
            // if (obj.veces != this.state.parametros.cantidad) return;
            var toInsert = {
              indice: cant + 1,
              key_usuario: obj?.key_usuario,
              nombre: obj?.usuario.Nombres,
              nombre_completo: obj?.usuario.Nombres + " " + obj?.usuario.Apellidos,
              ci: obj?.usuario?.CI,
              correo: obj?.usuario?.Correo,
              cumpleaños: obj?.usuario["Fecha nacimiento"],
              telefono: obj?.usuario?.Telefono,
              sucursal: obj?.descripcion,
              // veces: obj?.veces
            }
            cant++;
            daFinal[i] = toInsert
          })
          return daFinal
        }}
      />

      <SList data={data} space={8}
        limit={7}
        buscador
        // filter={obj => {
        //   if (obj.veces == this.state.parametros.cantidad) return true;
        //   return false;
        // }}
        render={obj => {
          return this.getItem2(obj, obj.usuario)
        }}
      />
    </>
  }

  render() {
    return <SPage title={this.state.title} center  >
      <Container>
        {this.getParametros()}
        <SHr height={10} />
        {this.getLista()}
        <SHr height={20} />
      </Container>
    </SPage>
  }
}

const initStates = (state) => {
  return { state }
};
export default connect(initStates)(index);