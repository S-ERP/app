import React, { Component } from 'react';
import { SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import Cerrada from './components/Cerrada';
import Abierta from './components/Abierta';


export default class root extends Component {
  key_caja = SNavigation.getParam("key")
  state = {
    caja: null,
    error: null,
  }

  componentDidMount() {
    this._mounted = true;
    this.loadData();
    MDL.caja.addEventListener("onChangeActiva", this.onChangeActiva);
  }

  componentWillUnmount() {
    this._mounted = false;
    MDL.caja.removeEventListener(this.onChangeActiva);
  }

  async loadData() {
    if (!this.key_caja) {
      if (this._mounted) this.setState({ error: "No se especificó la caja a mostrar." });
      return;
    }
    if (this._mounted) this.setState({ error: null });
    try {
      const caja = await MDL.caja.getByKey(this.key_caja);
      if (!this._mounted) return;
      if (!caja) {
        this.setState({ error: "No se encontró la caja solicitada." });
        return;
      }
      this.setState({ caja });
    } catch (e) {
      if (!this._mounted) return;
      const mensaje = e?.error ?? e?.message ?? "No se pudo cargar la caja. Intenta nuevamente.";
      this.setState({ error: mensaje });
      SNotification.send({
        key: "caja_detail_load",
        title: "Error al cargar caja",
        body: mensaje,
        color: STheme.color.danger,
        time: 5000,
      });
    }
  }
  onChangeActiva = (evt) => {
    this.setState({ caja: MDL.caja.activa });
  }

  render() {
    const { caja, error } = this.state;
    return <SPage title={"Caja"} disableScroll>
      {error ? (
        <SView col={"xs-12"} center padding={24}>
          <SText color={STheme.color.danger} center>{error}</SText>
          <SView height={12} />
          <SText color={STheme.color.link} onPress={() => this.loadData()}>Reintentar</SText>
        </SView>
      ) : !caja ? <SLoad /> : <Abierta caja={caja} />}
    </SPage>
  }
}
