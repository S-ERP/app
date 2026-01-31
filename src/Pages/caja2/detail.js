import React, { Component } from 'react';
import { SLoad, SNavigation, SNotification, SPage, SText, } from 'servisofts-component';
import MDL from '../../MDL';
import Cerrada from './components/Cerrada';
import Abierta from './components/Abierta';


export default class root extends Component {
  key_caja = SNavigation.getParam("key")
  state = {
    caja: null
  }

  componentDidMount() {
    this.loadData();
    MDL.caja.addEventListener("onChangeActiva", this.onChangeActiva);
  }

  async loadData() {
    const caja = await MDL.caja.getByKey(this.key_caja);
    this.setState({ caja });
  }
  onChangeActiva = (evt) => {
    this.setState({ caja: MDL.caja.activa });
  }
  componentWillUnmount() {
    MDL.caja.removeEventListener(this.onChangeActiva);
  }

  render() {
    const { caja } = this.state;
    return <SPage title={"Caja"} disableScroll>
      {!caja ? <SLoad /> : <Abierta caja={caja} />}
    </SPage>
  }
}
