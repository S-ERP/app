import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import InputPuntoVenta from './InputPuntoVenta';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../Assets/SIconApp';

export default class Cerrada extends Component {
  state = {
    punto_venta: null,
    lastCaja: null
  }
  selectPuntoVenta(e) {
    this.state.punto_venta = e;
    MDL.caja.getLast({ key_punto_venta: e.key }).then((caja) => {
      this.state.lastCaja = caja;
      if (!caja?.key_usuario) {
        this.setState({ lastCaja: this.state.lastCaja });
        return;
      }
      MDL.usuario.getByKeys([caja.key_usuario]).then((usuarios) => {
        if (!this.state.lastCaja) return;
        this.state.lastCaja.usuario = usuarios[0];
        this.setState({ lastCaja: this.state.lastCaja });
      });
    }).catch(e => {

    })
  }

  abrir_caja() {
    console.log("ABRIR CAJA", this.state.punto_venta);
    SNotification.send({
      key: "caja_abrir",
      title: "Cargando",
      type: "loading",
    })
    MDL.caja.abrir({
      key_punto_venta: this.state.punto_venta.key,
      key_sucursal: this.state.punto_venta.key_sucursal,
      key_cuenta_contable: this.state.punto_venta.key_cuenta_contable,
    }).then(e => {
      SNotification.remove("caja_abrir");
    }).catch(e => {
      SNotification.send({
        key: "caja_abrir",
        title: "Error al abrir caja",
        body: e?.error ?? JSON.stringify(e),
        color: STheme.color.danger,
        time: 5000
      })
    })
  }
  render() {
    const CardStyle = {
      width: 200,
      height: 100,
      borderRadius: 8,
      padding: 8,
      margin: 4,
      // borderWidth: 1,
      borderColor: STheme.color.text + "66",
      backgroundColor: STheme.color.card,
    }
    return (
      <SView col={"xs-12"} padding={8}>
        <SView col={"xs-12"} center>
          <SText col={"xs-10 md-5"} center fontSize={16} color={STheme.color.gray}>Tu caja se encuentra cerrada, selecciona la Sucursal - Punto de Venta para aperturar tu caja.</SText>
        </SView>
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
            {!(!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key) &&
              <SView style={{ ...CardStyle, backgroundColor: STheme.color.success }} onPress={this.abrir_caja.bind(this)}>
                <SView center col={"xs-12"} flex row>
                  <SText bold fontSize={18}>{"ABRIR"}</SText>
                  <SView width={16} />
                  <SView width={40} height={40}>
                    <SIconApp name='MessageSend' fill={STheme.color.text} />
                  </SView>
                </SView>
              </SView>
            }
            <SHr />
            <SView style={{ ...CardStyle, backgroundColor: (!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key ? STheme.color.danger : STheme.color.lightGray) }}>
              <SText color={STheme.color.gray}>{"Estado"}</SText>
              <SView center col={"xs-12"} flex>
                <SText bold fontSize={16} style={{
                }}>{(!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key ? "EN CURSO" : "CERRADA")}</SText>
              </SView>
            </SView>
            {(!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key) && <SView style={{ ...CardStyle, }}>
              <SText color={STheme.color.gray}>{"Fecha Apertura"}</SText>
              <SView center col={"xs-12"} flex>
                <SText fontSize={14}>{new SDate(this.state?.lastCaja?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("DAY dd de MONTH del yyyy a las HH")}</SText>
              </SView>
            </SView>
            }

            {!(!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key) &&
              <SView style={{ ...CardStyle, }}>
                <SText color={STheme.color.gray}>{"Fecha Cierre"}</SText>
                <SView center col={"xs-12"} flex>
                  <SText fontSize={14}>{new SDate(this.state?.lastCaja?.fecha_cierre, "yyyy-MM-ddThh:mm:ss").toString("DAY dd de MONTH del yyyy a las HH")}</SText>
                </SView>
              </SView>
            }
            <SView style={{ ...CardStyle, }}>
              <SText color={STheme.color.gray}>{"Cajero"}</SText>
              <SView center col={"xs-12"} flex row>
                <SView width={40} height={40} style={{
                  borderRadius: 100,
                  borderWidth: 1,
                  overflow: "hidden"
                  // borderColor: "#fff"
                }}>
                  <SImage src={SSocket.api.root + "usuario/" + this.state?.lastCaja?.key_usuario} />
                </SView>
                <SView width={8} />
                <SText bold fontSize={14} flex>{this.state?.lastCaja?.usuario?.Nombres} {this.state?.lastCaja?.usuario?.Apellidos}</SText>
              </SView>
            </SView>
            {!(!this.state?.lastCaja?.fecha_cierre && !!this.state?.lastCaja?.key) &&
              <SView style={{ ...CardStyle, }}>
                <SText color={STheme.color.gray}>{"Monto"}</SText>
                <SView center col={"xs-12"} flex>
                  <SText bold fontSize={18}>{SMath.formatMoney((this.state?.lastCaja?.monto_cierre ?? 0))}</SText>
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