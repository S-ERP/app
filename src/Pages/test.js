import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {  SHr, SInput, SPage, SPopup, SText, SView } from 'servisofts-component';
import ImportarExcel from '../Components/ImportarExcel';
import MDL from '../MDL';
import PopupEditarTema from './empresa/Components/PopupEditarTema';

export default class test extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return <SPage title={"Test"} disableScroll>
      <SText onPress={() => {
        ImportarExcel.open({
          cols: [{ key: "tipo" }, { key: "codigo" }, { key: "descripcion" }]
        });
      }}>{"IMPORTAR EXCEL"}</SText>
      <SText onPress={() => {
        MDL.caja.getActiva();
      }}>{"GET CAJA"}</SText>

      <SText
        padding={8} card
        onPress={() => {
          PopupEditarTema.open({})
        }}
      >{"PopupConfig"}</SText>
      <SHr/>
      <SInput width={100} type='money'/>
      {/* <SText>{JSON.stringify(MDL.caja.activa)}</SText> */}
    </SPage>
  }
}
