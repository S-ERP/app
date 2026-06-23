import React, { Component } from 'react';
import { SDate, SHr, SImage, SNotification, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import InputPuntoVenta from './InputPuntoVenta';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../Assets/SIconApp';

export default class Cerrada extends Component {
  state = {
    punto_venta: null,
    lastCaja: null,
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  selectPuntoVenta(e) {
    if (!e?.key) return;
    this.setState({ punto_venta: e, lastCaja: null });
    MDL.caja.getLast({ key_punto_venta: e.key }).then((caja) => {
      if (!this._mounted) return;
      if (!caja?.key_usuario) {
        this.setState({ lastCaja: caja });
        return;
      }
      MDL.usuario.getByKeys([caja.key_usuario]).then((usuarios) => {
        if (!this._mounted) return;
        this.setState({ lastCaja: { ...caja, usuario: usuarios?.[0] } });
      }).catch(() => {
        if (this._mounted) this.setState({ lastCaja: caja });
      });
    }).catch(e => {
      if (!this._mounted) return;
      SNotification.send({
        key: "cerrada_load",
        title: "Error al cargar caja",
        body: e?.error ?? JSON.stringify(e),
        color: STheme.color.danger,
        time: 5000,
      });
    });
  }

  abrir_caja() {
    const punto_venta = this.state.punto_venta;
    if (!punto_venta?.key) return;
    SNotification.send({ key: "caja_abrir", title: "Cargando", type: "loading" });
    MDL.caja.abrir({
      key_punto_venta: punto_venta.key,
      key_sucursal: punto_venta.key_sucursal,
      key_cuenta_contable: punto_venta.key_cuenta_contable,
    }).then(() => {
      SNotification.remove("caja_abrir");
    }).catch(e => {
      SNotification.send({
        key: "caja_abrir",
        title: "Error al abrir caja",
        body: e?.error ?? JSON.stringify(e),
        color: STheme.color.danger,
        time: 5000,
      });
    });
  }

  render() {
    const { lastCaja } = this.state;
    const estaEnCurso = !lastCaja?.fecha_cierre && !!lastCaja?.key;
    const fotoUrl = SSocket.api?.root
      ? `${SSocket.api.root}usuario/${lastCaja?.key_usuario}`
      : null;
    const nombreUsuario = [lastCaja?.usuario?.Nombres, lastCaja?.usuario?.Apellidos].filter(Boolean).join(" ") || "—";
    const fechaApertura = lastCaja?.fecha_on
      ? new SDate(lastCaja.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("DAY dd de MONTH del yyyy a las HH")
      : "—";
    const fechaCierre = lastCaja?.fecha_cierre
      ? new SDate(lastCaja.fecha_cierre, "yyyy-MM-ddThh:mm:ss").toString("DAY dd de MONTH del yyyy a las HH")
      : "—";

    const CardStyle = {
      width: 200,
      height: 100,
      borderRadius: 8,
      padding: 8,
      margin: 4,
      borderColor: STheme.color.text + "66",
      backgroundColor: STheme.color.card,
    };

    return (
      <SView col={"xs-12"} padding={8}>
        <SView col={"xs-12"} center>
          <SText col={"xs-10 md-5"} center fontSize={16} color={STheme.color.lightGray}>
            Tu caja se encuentra cerrada, selecciona la Sucursal - Punto de Venta para aperturar tu caja.
          </SText>
        </SView>
        <SView col={"xs-12"} row center>
          <InputPuntoVenta onChange={(e) => { if (e) this.selectPuntoVenta(e); }} />
        </SView>
        <SHr h={32} />

        {lastCaja && <SView col={"xs-12"}>
          <SView col={"xs-12"} row center>

            {!estaEnCurso && (
              <SView style={{ ...CardStyle, backgroundColor: STheme.color.success }} onPress={this.abrir_caja.bind(this)}>
                <SView center col={"xs-12"} flex row>
                  <SText bold fontSize={18}>ABRIR</SText>
                  <SView width={16} />
                  <SView width={40} height={40}>
                    <SIconApp name='MessageSend' fill={STheme.color.text} />
                  </SView>
                </SView>
              </SView>
            )}

            <SHr />

            <SView style={{ ...CardStyle, backgroundColor: estaEnCurso ? STheme.color.danger : STheme.color.lightGray }}>
              <SText color={STheme.color.gray}>Estado</SText>
              <SView center col={"xs-12"} flex>
                <SText bold fontSize={16}>{estaEnCurso ? "EN CURSO" : "CERRADA"}</SText>
              </SView>
            </SView>

            {estaEnCurso && (
              <SView style={{ ...CardStyle }}>
                <SText color={STheme.color.gray}>Fecha Apertura</SText>
                <SView center col={"xs-12"} flex>
                  <SText fontSize={14}>{fechaApertura}</SText>
                </SView>
              </SView>
            )}

            {!estaEnCurso && (
              <SView style={{ ...CardStyle }}>
                <SText color={STheme.color.gray}>Fecha Cierre</SText>
                <SView center col={"xs-12"} flex>
                  <SText fontSize={14}>{fechaCierre}</SText>
                </SView>
              </SView>
            )}

            <SView style={{ ...CardStyle }}>
              <SText color={STheme.color.gray}>Cajero</SText>
              <SView center col={"xs-12"} flex row>
                <SView width={40} height={40} style={{ borderRadius: 100, borderWidth: 1, overflow: "hidden" }}>
                  {fotoUrl && <SImage src={fotoUrl} />}
                </SView>
                <SView width={8} />
                <SText bold fontSize={14} flex>{nombreUsuario}</SText>
              </SView>
            </SView>

          </SView>
        </SView>}
      </SView>
    );
  }
}
