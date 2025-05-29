import { Text, View } from 'react-native'
import React, { Component } from 'react'
import {SView,STheme, SNavigation} from 'servisofts-component';
import NavBar from '../../Components/NavBar';

export class operador extends Component {
  render() {
    return (
      <SView style={{ borderWidth: 1, borderColor: "red", width: "100%", height: "100%" }}>
        <NavBar
          title={"Operador"}
          center
          left={
            <SView col={"xs-12"} style={{ height: 50, backgroundColor: STheme.color.primary }}>
              <Text style={{ color: "white" }}>Operador</Text>
            </SView>
          }
        />
        <SView
          col={"xs-12"}
          style={{
            height: 50,
            borderWidth: 1,
            borderColor: "blue",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <SView
            col={"xs-8"}
            center
            style={{
              height: "70%",
              width: "10%",
              borderWidth: 1,
              borderColor: "green",
              justifyContent: "center",
              alignItems: "center"
            }}
            onPress={() => {
              SNavigation.navigate("/crm/detalleLlamada");
              console.log("funcionar");
            }}
          >
            <Text style={{ color: "white" }}>Iniciar Llamada</Text>
          </SView>
        </SView>
      </SView>
    )
  }
}

export default operador