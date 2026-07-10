import React, { Component } from "react";
import { SHr, SPage } from "servisofts-component";
import { DinamicTable4 } from "alvaro-table";

const DATA_QUEMADA = [
  { id: 1, nombre: "Juan Pérez", ciudad: "La Paz", edad: 28, fecha_registro: "2026-07-01T08:30:00" },
  { id: 2, nombre: "María Gómez", ciudad: "Santa Cruz", edad: 34, fecha_registro: "2026-07-03T14:15:00" },
  { id: 3, nombre: "Carlos Rojas", ciudad: "Cochabamba", edad: 41, fecha_registro: "2026-07-05T09:45:00" },
  { id: 4, nombre: "Ana Fernández", ciudad: "Sucre", edad: 22, fecha_registro: "2026-07-08T17:00:00" },
  { id: 5, nombre: "María Gómez", ciudad: "Santa Cruz", edad: 34, fecha_registro: "2026-07-03T16:15:00" },
  { id: 6, nombre: "Carlos Rojas", ciudad: "Cochabamba", edad: 41, fecha_registro: "2026-07-03T09:45:00" },
  { id: 7, nombre: "Ana Fernández", ciudad: "Sucre", edad: 22, fecha_registro: "2026-07-08T19:00:00" },

];

export default class FacturaFormSimple extends Component {
  mostrarTabla() {
    return (
      <DinamicTable4
        key="tabla"
        loadData={() => Promise.resolve(DATA_QUEMADA)}
        keyExtractor={(item) => item.id + ""}
      >
        <DinamicTable4.Col key="id" label="#" width={50} height={40} data={(e) => e.row.id} />
        <DinamicTable4.Col key="nombre" label="Nombre" width={200} height={40} data={(e) => e.row.nombre} />
        <DinamicTable4.Col key="ciudad" label="Ciudad" width={150} height={40} data={(e) => e.row.ciudad} />
        <DinamicTable4.Col key="edad" label="Edad" width={80} height={40} dataType="number" data={(e) => e.row.edad} />
        <DinamicTable4.Col key="fecha" label="Fecha" width={110} height={40} dataType="date" dateFormat="yyyy-MM-dd hh:mm:ss" data={(e) => e.row.fecha_registro} />
        <DinamicTable4.Col key="fechahora" label="Fecha y Hora" width={160} height={40} dataType="datetime" dateFormat="yyyy-MM-dd hh:mm:ss" data={(e) => e.row.fecha_registro} />
        <DinamicTable4.Col key="hora" label="Hora" width={90} height={40} dataType="time" dateFormat="yyyy-MM-dd hh:mm:ss" data={(e) => e.row.fecha_registro} />
      </DinamicTable4>
    );
  }

  render() {
    return (
      <SPage title="Test Tabla" disableScroll>
        {this.mostrarTabla()}

        {/* <SHr height={4}></SHr>
        {this.mostrarTabla()}10 */}

      </SPage>
    );
  }
}
