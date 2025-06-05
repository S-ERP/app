import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SDate, SDatePicker, SForm, SHr, SIcon, SInput, SList, SLoad, SNavigation, SNotification, SPage, SScroll, SSPiner, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import { Container } from '../../Components';
import MDtest1 from '../../SMD/MDtest1';
import MenuDragable from '../../Components/MenuDragable';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
import DataBase from '../../DataBase';
import { ScrollView } from 'react-native-gesture-handler';
import MDL from '../../MDL';
import SMD from '../../SMD';
import Llamada from './Components/Llamada';
import PopupRellamada from './Components/PopupRellamada';
import PopupRazon from './Components/PopupRazon';
import OrdenesConMismoNumero from './Components/OrdenesConMismoNumero';
// import HorarioDeCliente from './Components/HorarioDeCliente';
import Comentario from './Components/Comentario';
import HistoricoMovimientos from './call/HistoricoMovimientos';
import HorarioCliente from '../../Components/Ricardo/HorarioCliente';

const color_activado = "#262E35";
const color_desactivado = "#F6F7F9";

export default class plantilla extends Component {
  pk = SNavigation.getParam("key");
  constructor(props) {
    super(props);

    this.state = {
      select: {
        "confirmado": false,
        "Cancelado": false,
        "Double": false,
        "Spam": false,
        "Recall": false,
        "FeactureRecall": false
      },
    };
    // this.onSelect = SNavigation.getParam("onSelect");
  }

  componentDidMount() {
    MDL.crm.clienteProyecto.getFull(this.pk).then((e) => {
      this.traerAllOrdenes();
      this.setState({ clienteProyecto: e })
    })
  }
  async traerAllOrdenes() {
    const resp: any = await SSocket.sendPromise({
      service: "crm",
      component: "cliente_proyecto",
      type: "getConElMismoNumero",
      estado: "cargando",
      key: this.pk
    }, 1000 * 60)
    const obj: any = Object.values(resp.data);
    console.log("pintado ", obj)
  }

  optionItem({ key, label, color, icono, onPress }) {
    var select = !!this.state.select[key]

    // aqui pregunto

    // this.state?.clienteProyecto?.state = this.state.select su valor entonces deberia ponerlo en true  el state

    console.log("alvaro aqui ", select)
    return <>
      <SView col={"xs-12"} backgroundColor='transparent' center style={{ alignItems: "center", }}>
        <SView center card style={{
          paddingLeft: 8,
          paddingRight: 8,
          opacity: select ? 1 : 0.5,
          backgroundColor: select ? color_activado + "88" : color_desactivado + "88",
        }} onPress={onPress} row>
          {!select ? null : <> <SIcon name={icono} width={12} height={12} fill={STheme.color.text} /> <SView width={8} /></>}
          <SText>{label}</SText>
        </SView>
        <SView width={4} />
      </SView>
    </>
  };





  renderLista() {
    return <SView col={"xs-12"} height={38} border={"transparent"}>
      <SList
        horizontal
        data={[
          {
            key: "confirmado", label: "confirmado", color: color_activado, icono: "addTarea", onPress: () => {
              if (window.confirm("¿Estás seguro de que quieres continuar?")) {
                console.log("Confirmado");
                MDL.crm.clienteProyecto.editar({ key: this.pk, state: "confirmado", key_tipo_movimiento_lead: "confirmado" })
              } else {
                console.log("Cancelado");
              }
            }
          },
          {
            key: "Cancelado", label: "Cancelado", color: color_activado, icono: "Check", onPress: () => {
              PopupRazon.open(
                ({
                  tipo: "cancelado", onRegister: (e) => { MDL.crm.clienteProyecto.editar({ key: this.pk, state: "cancelado", key_tipo_movimiento_lead: e.selectedOption.key }) }
                }))

            }
          },
          {
            key: "Double", label: "Double", color: color_activado, icono: "World", onPress: () => {
              PopupRazon.open(
                ({
                  tipo: "double", onRegister: (e) => { MDL.crm.clienteProyecto.editar({ key: this.pk, state: "double", key_tipo_movimiento_lead: e.selectedOption.key }) }
                }))
            }
          },
          {
            key: "Spam", label: "Spam", color: color_activado, icono: "Egreso", onPress: () => {
              PopupRazon.open(
                ({
                  tipo: "spam", onRegister: (e) => {
                    MDL.crm.clienteProyecto.editar({ key: this.pk, state: "spam", key_tipo_movimiento_lead: e.selectedOption.key })
                  }
                }))
            }
          },
          {
            key: "Recall", label: "Recall", color: color_activado, icono: "tpGa", onPress: () => {
              PopupRellamada.open(({ onRegister: (e) => { } }))
            }
          },
          {
            key: "FeactureRecall", label: "llamada fallida", color: color_activado, icono: "productos", onPress: () => {
              PopupRazon.open(
                ({
                  tipo: "llamada_fallida", onRegister: (e) => { MDL.crm.clienteProyecto.editar({ key: this.pk, state: "llamada_fallida", key_tipo_movimiento_lead: e.selectedOption.key }) }
                }))
            }
          },
        ]}
        render={data => this.optionItem(data)}
      />
    </SView>
  }
  render() {

    // const proyectos = await MDL.crm.proyecto.getAll();
    // const campanas = await MDL.crm.campana.getAll();
    // proyectos.forEach(proyecto => {
    //  proyecto.campanas = [];
    //  Object.keys(campanas).forEach(key => {
    //   if (campanas[key].key_proyecto == proyecto.key) {
    //    proyecto.campanas.push(campanas[key]);
    //   }
    //  });
    // })
    // return proyectos;

    const { clienteProyecto } = this.state;
    return <SPage   >
      {/* <SText card padding={8}>{"LLAMAR"}</SText> */}
      <SHr height={10} />
      {/* <Llamada phone={clienteProyecto?.cliente?.telefono} /> */}

      <SView col={"xs-12"} center row border="transparent" padding={8}>
        <SView col={"xs-12"} center row backgroundColor='transparent'>
          {/* {this.renderLista()} */}
        </SView>
        <SHr />

        <SText fontSize={16} bold>Detalles de la orden</SText>

        <SHr />
        <SView col={"xs-12"} row     >
          <SView col={"xs-12 sm-3.8"}     >
        <HorarioCliente key_cliente_proyecto={this.pk}  ></HorarioCliente>
            {/* <HorarioDeCliente key_cliente_proyecto={this.pk}></HorarioDeCliente> */}
          </SView>
          <SView flex />

          <SView col={"xs-12 sm-3.8"} row    >
            <SView col={"xs-12"} style={{ padding: 8, borderRadius: 16, borderWidth: 2 }} center border={STheme.color.card} backgroundColor={STheme.color.card}>
              <SView col="xs-12">
                <SText fontSize={10}>Script del proyecto</SText>
                <SText fontSize={28}>{this.state?.clienteProyecto?.proyecto?.nombre}</SText>
              </SView>
              <SHr />
              <SView col={"xs-12"} style={{ maxHeight: "100%", overflow: "hidden" }} >
                <ScrollView>
                  <SMD fontSize={11} padding={0} space={1}>
                    {this.state?.clienteProyecto?.proyecto?.guion}
                  </SMD>
                </ScrollView>
              </SView>
            </SView>
          </SView>


          <SView flex />
          <SView col={"xs-12 sm-3.8"}     >
            <OrdenesConMismoNumero key_cliente_proyecto={this.pk}></OrdenesConMismoNumero>
            <Comentario key_cliente_proyecto={this.pk}></Comentario>
            <HistoricoMovimientos key_cliente_proyecto={this.pk}></HistoricoMovimientos>
          </SView>
        </SView>
      </SView>
    </SPage>
  }
}
