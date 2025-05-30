import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SText, STheme, SView } from 'servisofts-component';


const Teclas = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "*", value: "*" },
  { label: "0", value: "0" },
  { label: "#", value: "#" }
];

export default class Phone extends Component<{ defaultValue?: string }> {

  render() {
    return <SView style={{ maxWidth: 250 }} center>

      <SView col={"xs-12"} style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
        <SInput center style={{
          textAlign: "center",
          fontSize: 24
        }} customStyle='clean'
          defaultValue={this.props.defaultValue}
        />
      </SView>
      <SView row col={"xs-12"}>

        {Teclas.map((tecla, index) => (
          <SView
            // border
            key={index}
            col={"xs-4"}
            colSquare
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SText style={{ fontSize: 24 }}>{tecla.label}</SText>
          </SView>
        ))}

      </SView>
      <SView style={{ width: 50, height: 50, borderRadius: 100, justifyContent: "center", alignItems: "center", backgroundColor: STheme.color.success }}>
        <SText>{"CALL"}</SText>
      </SView>
    </SView>
  }
}
