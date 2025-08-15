import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage, SText } from 'servisofts-component';
import ImportarExcel from '../Components/ImportarExcel';

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
      }}>{"OPEN"}</SText>
    </SPage>
  }
}
