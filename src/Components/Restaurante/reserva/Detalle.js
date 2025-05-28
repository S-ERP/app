import React, { Component } from 'react';
import { SButtom, SHr, SIcon, SImage, SLoad, SMath, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import Restaurante from '..';
import Model from '../../../Model';
import ModificarCantidad from './ModificarCantidad';

export default class Detalle extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  setTipoEnvio(data) {
    // console.log(data);
    this.setState({ envio: data.delivery })

  }
  render() {
    this.data = this.props.data;
    if (!this.data) return <SLoad />
    return (
      <SView col={"xs-12"} center row style={{ backgroundColor: STheme.color.white }}>
        <SView col={"xs-11"} row center>
          <SView col={"xs-12"}>
            <SHr height={15} />
            <SText fontSize={18} style={{ fontWeight: "bold" }}>Detalle pedido</SText>
            <SHr height={15} />
          </SView>
          <SView col={"xs-12"} row backgroundColor={"transparent"} >
            <SView center width={85} height={85} backgroundColor={"#eee"} style={{ borderRadius: 8, overflow: 'hidden', }}>
              <Restaurante.FotoPerfil data={this.data} style={{ width: "100%", resizeMode: "cover" }} />
            </SView>
            <SView row flex height border={'transparent'} >
              <SView width={4} />
              <SView flex row >
                <SView col={"xs-12"} border={'transparent'}>
                  <SText color={STheme.color.text} fontSize={14} style={{ fontWeight: "bold" }}  >{this.data?.nombre}</SText>
                </SView>
                <SHr height={6} />
                <SView style={{ justifyContent: 'flex-start', }} border={'transparent'} >
                  <SText fontSize={14} style={{ fontWeight: "bold" }} color={STheme.color.primary} fontWeight>Precio</SText>
                  <SText fontSize={16} style={{ fontWeight: "bold" }}>Bs. {SMath.formatMoney(this.data?.horario?.precio ?? 0)}</SText>
                </SView>
                <SView flex />

                <ModificarCantidad envio={this.state.envio} data={this.props.data} onChange={this.props.onChange} />
                {/* {this.getBotones()} */}
              </SView>
            </SView>
          </SView>

          <SHr height={15} />
          <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray }}></SView>
          <SHr height={18} />
        </SView>
      </SView>
    );
  }
}
