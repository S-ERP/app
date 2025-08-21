import React, { Component } from 'react';
import { SPage,  } from 'servisofts-component';
import MDL from '../../MDL';
import Cerrada from './components/Cerrada';
import Abierta from './components/Abierta';


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
    return <SPage title={"Caja"} disableScroll>
      {!caja ? <Cerrada /> : <Abierta caja={caja} />}
    </SPage>
  }
}
