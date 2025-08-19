import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SMath, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import InputPuntoVenta from './components/InputPuntoVenta';
import { Container } from '../../Components';
import punto_venta from '../empresa/punto_venta';
import SSocket from 'servisofts-socket';

export default class root extends Component {
  state = {
    caja: MDL.caja.activa
  }

  componentDidMount() {
    MDL.caja.addEventListener("onChangeActiva", this.onChangeActiva);
  }

  onChangeActiva = (evt) => {
    this.setState({ caja: MDL.caja.activa });
  }
  componentWillUnmount() {
    MDL.caja.removeEventListener(this.onChangeActiva);
  }

  render() {
    const { caja } = this.state;
    return <SPage title={"Caja"}>
      {!caja ? <Cerrada /> : <Abierta caja={caja} />}
    </SPage>
  }
}

class Cerrada extends Component {
  state = {
    punto_venta: null,
    lastCaja: null
  }
  selectPuntoVenta(e) {
    this.state.punto_venta = e;
    MDL.caja.getLast({ key_punto_venta: e.key }).then((caja) => {
      this.setState({ lastCaja: caja });
      MDL.usuario.getByKeys([caja.key_usuario]).then((usuarios) => {
        this.state.lastCaja.usuario = usuarios[0];
        this.setState({ lastCaja: this.state.lastCaja });
      });
    }).catch(e => {

    })
  }
  render() {
    const CardStyle = {
      width: 200,
      height: 100,
      borderRadius: 8,
      padding: 8,
      margin: 4,
      borderWidth: 1,
      borderColor: STheme.color.text + "66",
      backgroundColor: STheme.color.card,
    }
    return (
      <SView col={"xs-12"} padding={8}>
        <SText fontSize={16} color={STheme.color.gray}>Tu caja se encuentra cerrada, selecciona la Sucursal - Punto de Venta para aperturar tu caja.</SText>
        <SView col={"xs-12"} row center>
          <InputPuntoVenta onChange={(e) => {
            if (e) {
              this.selectPuntoVenta(e);
            }
          }} />
        </SView>
        <SHr h={32} />
        {this.state?.lastCaja && <SView col={"xs-12"}>
          <SView col={"xs-12"} row center>
            <SView style={{ ...CardStyle, }}>
              <SText>{"Estado"}</SText>
              <SView center col={"xs-12"} flex>
                <SText bold fontSize={16}>{(!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key ? "EN CURSO" : "CERRADA")}</SText>
              </SView>
            </SView>
            <SView style={{ ...CardStyle, }}>
              <SText>{"Monto"}</SText>
              <SView center col={"xs-12"} flex>
                <SText bold fontSize={18}>{SMath.formatMoney((this.state?.lastCaja?.monto_cierre ?? 0))}</SText>
              </SView>
            </SView>
            <SView style={{ ...CardStyle, }}>
              <SText>{"Cajero"}</SText>
              <SView center col={"xs-12"} flex row>
                <SView width={40} height={40} style={{
                  borderRadius: 100,
                  borderWidth: 1,
                  overflow: "hidden"
                  // borderColor: "#fff"
                }}>
                  <SImage src={SSocket.api.root + "usuario/" + this.state?.lastCaja?.key_usuario} />
                </SView>
                <SView width={8}/>
                <SText bold fontSize={18} flex>{this.state?.lastCaja?.usuario?.Nombres} {this.state?.lastCaja?.usuario?.Apellidos}</SText>
              </SView>
            </SView>
            {!(!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key) &&
              <SView style={{ ...CardStyle, }} onPress={() => {
                console.log("ABRIR CAJA", this.state.punto_venta);
                MDL.caja.abrir({
                  key_punto_venta: this.state.punto_venta.key,
                  key_sucursal: this.state.punto_venta.key_sucursal,
                  key_cuenta_contable: this.state.punto_venta.key_cuenta_contable,
                })
              }}>
                <SView center col={"xs-12"} flex>
                  <SText bold fontSize={18}>{"ABRIR"}</SText>
                </SView>
              </SView>
            }
          </SView>



          {/* <SText>{"Monto Cierre: " + (this.state?.lastCaja?.monto_cierre ?? 0)}</SText> */}
          {/* <SText>{"Usuario: " + (this.state?.lastCaja?.key_usuario ?? "")}</SText> */}
          {/* <SText>{"Fecha Apertura: " + (this.state?.lastCaja?.fecha_on ?? "")}</SText> */}
          {/* <SText>{"Fecha Cierre: " + (this.state?.lastCaja?.fecha_cierre ?? "")}</SText> */}
        </SView>}


      </SView>
    );
  }
}
class Abierta extends Component {
  render() {
    const { caja } = this.props
    return (
      <SView col={"xs-12"}>
        <SText>Abierta</SText>
        <SHr />
        <SText onPress={() => {
          MDL.caja.cerrar({
            key: caja.key,
            key_punto_venta: caja.key_punto_venta,
          }).then(e => {

          }).catch(e => {

          })
        }}>Cerrar</SText>
      </SView>
    );
  }
}