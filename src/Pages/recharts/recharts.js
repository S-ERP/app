import React, { Component } from "react";
import { SHr, SInput, SPage, SPopup, SText, STheme, SView } from "servisofts-component";



// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BarraRecharts from "./Components/BarraRecharts";
import LineaRecharts from "./Components/LineaRecharts";
import CircularRecharts from "./Components/CircularRecharts";


export default class Recharts extends Component {

  render() {
    return (
      <SPage title="Librería Recharts" >
        <SHr height={10} />
        <SView col={"xs-12"} row >
          <SView col={"xs-6"} flex >
            <SText bold fontSize={20}>Linea Recharts</SText>
            <SHr height={10} />
            <LineaRecharts />
          </SView>
          <SView col={"xs-6"} flex >
            <SText bold fontSize={20}>Barra Recharts</SText>
            <SHr height={10} />
            <BarraRecharts />
          </SView>

        </SView>
          <SHr height={30} />
        <SView col={"xs-6"} flex >
          <SText bold fontSize={20}>Circular Recharts</SText>
          <SHr height={10} />
          <CircularRecharts />
        </SView>
      </SPage>
    );
  }
}