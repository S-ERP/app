import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SHr, SIcon, SImage, SLoad, SMath, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';

export default class ModificarCantidad extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cantidad: 1
    };
  }

  onChange(val) {
    this.setState({ cantidad: val });
    if (this.props.onChange) this.props.onChange(val);
  }
  verificar() {
    if (this.state.cantidad > this.props.data?.capacidad_envio && !!this.props?.envio) {
      SPopup.alert("Llegaste a la capacidad maxima de envio")
      this.onChange(this.props.data?.capacidad_envio);
      return;
    }
    return true;
  }
  render() {
    this.verificar();
    return (
      <SView width={114} center row border={'transparent'}  >
        <SView col={"xs-12"} center>
          <SView width={114} height={26} center style={{ borderRadius: 8, backgroundColor: STheme.color.primary }}>
            <SText font='Montserrat' fontSize={10} color={STheme.color.secondary} >{(this.props.data?.horario?.cantidad ?? 0) - (this.props.data?.cantidad_pedidos ?? 0)} disponible(s)</SText>
          </SView>
        </SView>
        <SView col={"xs-12"} center row>
          <SView col={"xs-3"} center row>
            <SView width={36} height={36} center style={{ backgroundColor: "#FFE0CF", borderRadius: 17 }}
              onPress={() => {
                if (this.state.cantidad <= 1) return;
                this.onChange(this.state.cantidad - 1)
              }}>
              <SText fontSize={32} height={52} color={STheme.color.primary} style={{}} center>-</SText>
            </SView>
          </SView>
          <SView col={"xs-6"} row center >
            <SText fontSize={35} color={STheme.color.text} center >{this.state.cantidad}</SText>
          </SView>
          <SView col={"xs-3"} center border={'transparent'} >
            <SView width={36} height={36} center style={{ backgroundColor: STheme.color.primary, borderRadius: 17 }}
              onPress={() => {
                if (this.state.cantidad >= (this.props.data?.horario?.cantidad ?? 0) - (this.props.data?.cantidad_pedidos ?? 0)) return;
                if (!this.verificar()) return;
                this.onChange(this.state.cantidad + 1)

              }}>
              <SText fontSize={32} height={45} center color={STheme.color.white} style={{
                // position: "absolute",
              }} >+</SText>
              <SHr height={4} />
            </SView>
          </SView>
        </SView>

      </SView>
    );
  }
}
