import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import FormRegistroProyecto from './Components/FormRegistroProyecto';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import FormRegistroCliente from './Components/FormRegistroCliente';
import PButtom from '../../Components/PButtom';
import FloatButtom from '../../Components/FloatButtom';


export default class lead extends Component {

 componentDidMount() {
  MDL.crm.clienteProyecto.getAll().then(e => {
   console.log("ultimaaaa :", e);
  }).catch(e => {
   console.error("Error fetching projects:", e);
  })
 }

 render() {
  return <SPage title={"Tipos leads registrados"}>

   <DinamicTable
    key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
    ref={ref => this.DinamicTable = ref} loadData={async () => { return await MDL.crm.clienteProyecto.getAll(); }} onSelect={(e) => { console.log("Selected project:", e.row); }} >
    <DinamicTable.Col key={"key"} label='ID' width={20} data={(e) => e.index + 1} />
    <DinamicTable.Col key={"proyecto_nombre"} label='Proyecto nombre' width={120} data={(e) => e.row.proyecto_nombre} />
    <DinamicTable.Col key={"proyecto_descripcion"} label='Proyecto descripcion' width={100} data={(e) => e.row.proyecto_descripcion} />
    <DinamicTable.Col key={"state"} label='Leads' width={80} data={(e) => e.row.state} />
    <DinamicTable.Col key={"state_fecha"} label='Fecha Leads' width={120} data={(e) => e.row.state_fecha} />
    <DinamicTable.Col key={"nombres"} label='Nombres' width={80} data={(e) => e.row.cliente?.nombres} />
    <DinamicTable.Col key={"apellidos"} label='Apellidos' width={80} data={(e) => e.row.cliente?.apellidos} />
    <DinamicTable.Col key={"telefono"} label='Teléfono' width={80} data={(e) => e.row.cliente?.telefono} />
    <DinamicTable.Col key={"correo"} label='Correo' width={80} data={(e) => e.row.cliente?.correo} />
    <DinamicTable.Col key={"nit"} label='NIT' width={80} data={(e) => e.row.cliente?.nit} />
    <DinamicTable.Col key={"razon_social"} label='Razón Social' width={80} data={(e) => e.row.cliente?.razon_social} />
   </DinamicTable>
  </SPage >
 }
}
