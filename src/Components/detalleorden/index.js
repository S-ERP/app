import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SView, STheme } from 'servisofts-component';

export default class index extends Component {
  render() {
    return (
      <SView style={{ borderWidth: 1, borderColor: "red", width: "10%", height: "10%" }}>
        <SView col={"xs-12"} style={{ height: 50, borderWidth: 1, borderColor: "blue", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "white" }}>Detalle Orden</Text>
        </SView>

        <SView col={"xs-12"} style={{ flexDirection: "row", height: 70, borderWidth: 1, borderColor: "blue", justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: STheme.color.text }}></Text>
        </SView>

        <SView col={"xs-12"} style={{ flex: 1, flexDirection: "row", borderWidth: 1, borderColor: "blue" }}>
          <SView col={"xs-5"} card style={{ flex: 1, borderWidth: 1, borderColor: "green", justifyContent: "center", alignItems: "center" }}>
            <Text>Contenido de la orden</Text>
          </SView>
        </SView>
      </SView>
    )
  }
}