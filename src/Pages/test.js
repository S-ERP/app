import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SInput, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import ImportarExcel from '../Components/ImportarExcel';
import MDL from '../MDL';
import PopupEditarTema from './empresa/Components/PopupEditarTema';
import CargarEfectivoDelBanco from './caja2/Acciones/CargarEfectivoDelBanco';
import ShaderEditor from '../Components/SThree/ShaderEditor2';
import Pizarra from '../Components/Pizarra/Pizarra';
import PizarraNodo from '../Components/Pizarra/PizarraNodo';
import DatePickerCalendar from "servisofts-table/Components/DatePickerCalendar"
import DateTimeBetween from '../Components/DateTimeBetween';
import SDate from 'servisofts-table/Components/SDate';
export default class test extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  cosasDeTest() {
    return <>
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
      <SHr />
      <SInput width={100} type='money2' defaultValue={"14,544"} decimales={1} />


      {/* <SText>{JSON.stringify(MDL.caja.activa)}</SText> */}
      {/* <CargarEfectivoDelBanco/> */}
    </>
  }
  render() {
    return <SPage title={"Test"} disableScroll>

      <Pizarra id='pizarra_test'>
        <PizarraNodo id={"cosas"} style={{
          backgroundColor: STheme.color.background,
          borderRadius: 4,
          padding: 8,
        }} x={-300} y={-300}>
          {this.cosasDeTest()}
        </PizarraNodo>
        <PizarraNodo id={"date_picker"} style={{
          backgroundColor: STheme.color.background,
          borderRadius: 4,
          padding: 8,
        }} x={300} y={-300}>
          <DatePickerCalendar color={"#fff"} accentColor={"#000"}
            language='es'
            defaultValue={new SDate()}
            onChange={e => {
              // state.dateSelec = e
            }} />
        </PizarraNodo>

        <PizarraNodo id={"timeBetween"} style={{
          backgroundColor: STheme.color.background,
          borderRadius: 4,
          padding: 8,
        }} x={-500} y={-100}>
          <DateTimeBetween />
        </PizarraNodo>
        <Sucursal label="Sucursal 1" x={-100} />
        <Sucursal label="Sucursal 2" x={0} />
        <Sucursal label="Sucursal 3" x={100} />
      </Pizarra>
    </SPage>
  }
}

const Sucursal = ({ label = "", x = 0, y = 0 }) => {
  return <PizarraNodo style={{
    // backgroundColor: STheme.colorFromText(label),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: STheme.color.card,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  }} x={x} y={y}
  id={'sucursal_' + label}
  onChangePosition={e => {
    console.log(label, "onChangePosition", e)
  }}>
    <SView width={50} height={50} padding={8}>
      <SIcon name='Marker' fill={STheme.color.text} />
    </SView>
    <SText>{label}</SText>
  </PizarraNodo>
}
