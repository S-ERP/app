import React, { Component } from "react";
import { SHr, SPage, SView, SText, STheme } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import Config from "../Config";

const TIPO_ENTRENADORES = { key: "entrenadores", titulo: "Entrenadores" };
const TIPO_OFICINA = { key: "oficina", titulo: "Oficina" };
const TIPO_CLIENTES = { key: "clientes", titulo: "Clientes", color: "#2196F3" };
const TIPO_MEDICOS = { key: "medicos", titulo: "Medicos" };
const TIPO_PROVEEDORES = { key: "proveedores", titulo: "Proveedores", color: "#E53935" };
const TIPO_RELACIONADORES = { key: "relacionadores", titulo: "Relacionadores" };
const TIPO_PROVEEDORES_EXT = { key: "proveedores_ext", titulo: "Proveedores del exterior", color: "#C0CA33" };

const TIPO_COMBOS = [
  [TIPO_ENTRENADORES, TIPO_OFICINA],
  [TIPO_CLIENTES, TIPO_ENTRENADORES],
  [TIPO_MEDICOS, TIPO_CLIENTES],
  [TIPO_PROVEEDORES, TIPO_MEDICOS],
  [TIPO_OFICINA, TIPO_RELACIONADORES],
  [TIPO_PROVEEDORES_EXT],
  [TIPO_MEDICOS],
];

const DATA_QUEMADA = [
  { id: 1, nombre: "Juan Pérez", ciudad: "La Paz", edad: 28, fecha_registro: "2026-07-01T08:30:00" },
  { id: 2, nombre: "María Gómez", ciudad: "Santa Cruz", edad: 34, fecha_registro: "2026-07-03T14:15:00" },
  { id: 3, nombre: "Carlos Rojas", ciudad: "Cochabamba", edad: 41, fecha_registro: "2026-07-05T09:45:00" },
  { id: 4, nombre: "Ana Fernández", ciudad: "Sucre", edad: 22, fecha_registro: "2026-07-08T17:00:00" },
  { id: 5, nombre: "María Gómez", ciudad: "Santa Cruz", edad: 34, fecha_registro: "2026-07-03T16:15:00" },
  { id: 6, nombre: "Carlos Rojas", ciudad: "Cochabamba", edad: 41, fecha_registro: "2026-07-03T09:45:00" },
  { id: 7, nombre: "Ana Fernández", ciudad: "Sucre", edad: 22, fecha_registro: "2026-07-08T19:00:00" },
  { id: 8, nombre: "Luis Mamani", ciudad: "El Alto", edad: 30, fecha_registro: "2026-07-01T10:05:00" },
  { id: 9, nombre: "Rosa Quispe", ciudad: "Oruro", edad: 45, fecha_registro: "2026-07-02T08:20:00" },
  { id: 10, nombre: "Pedro Choque", ciudad: "Potosí", edad: 37, fecha_registro: "2026-07-02T11:50:00" },
  { id: 11, nombre: "Lucía Vargas", ciudad: "Tarija", edad: 26, fecha_registro: "2026-07-04T09:10:00" },
  { id: 12, nombre: "Miguel Flores", ciudad: "Trinidad", edad: 52, fecha_registro: "2026-07-04T13:40:00" },
  { id: 13, nombre: "Elena Torrez", ciudad: "Cobija", edad: 29, fecha_registro: "2026-07-05T15:25:00" },
  { id: 14, nombre: "Jorge Condori", ciudad: "La Paz", edad: 33, fecha_registro: "2026-07-06T07:55:00" },
  { id: 15, nombre: "Patricia Rojas", ciudad: "Santa Cruz", edad: 40, fecha_registro: "2026-07-06T12:15:00" },
  { id: 16, nombre: "Fernando Aguilar", ciudad: "Cochabamba", edad: 24, fecha_registro: "2026-07-07T08:00:00" },
  { id: 17, nombre: "Verónica Salazar", ciudad: "Sucre", edad: 31, fecha_registro: "2026-07-07T18:30:00" },
  { id: 18, nombre: "Ricardo Paco", ciudad: "El Alto", edad: 27, fecha_registro: "2026-07-08T09:00:00" },
  { id: 19, nombre: "Gabriela Nina", ciudad: "Oruro", edad: 36, fecha_registro: "2026-07-08T20:10:00" },
  { id: 20, nombre: "Andrés Vega", ciudad: "Potosí", edad: 48, fecha_registro: "2026-07-09T07:45:00" },
  { id: 21, nombre: "Silvia Mendoza", ciudad: "Tarija", edad: 23, fecha_registro: "2026-07-09T14:20:00" },
  { id: 22, nombre: "Óscar Callisaya", ciudad: "Trinidad", edad: 39, fecha_registro: "2026-07-09T21:05:00" },
  { id: 23, nombre: "Carla Ibáñez", ciudad: "Cobija", edad: 32, fecha_registro: "2026-07-10T06:30:00" },
  { id: 24, nombre: "Diego Huanca", ciudad: "La Paz", edad: 29, fecha_registro: "2026-07-10T10:15:00" },
  { id: 25, nombre: "Natalia Cruz", ciudad: "Santa Cruz", edad: 35, fecha_registro: "2026-07-10T13:50:00" },
  { id: 26, nombre: "Ramiro Apaza", ciudad: "Cochabamba", edad: 44, fecha_registro: "2026-07-10T16:40:00" },
  { id: 27, nombre: "Daniela Ríos", ciudad: "Sucre", edad: 21, fecha_registro: "2026-07-10T18:05:00" },
  { id: 28, nombre: "Hugo Ticona", ciudad: "El Alto", edad: 50, fecha_registro: "2026-07-10T19:25:00" },
  { id: 29, nombre: "Cecilia Poma", ciudad: "Oruro", edad: 27, fecha_registro: "2026-07-10T20:00:00" },
  { id: 30, nombre: "Sergio Yucra", ciudad: "Potosí", edad: 38, fecha_registro: "2026-07-10T21:30:00" },
].map((item, index) => ({ ...item, tipo: TIPO_COMBOS[index % TIPO_COMBOS.length] }));

export default class FacturaFormSimple extends Component {
  mostrarTabla() {
    return (
      <DinamicTable
        key="tabla"
        {...Config.table.applyTheme()}
        loadData={() => Promise.resolve(DATA_QUEMADA)}
        keyExtractor={(item) => item.id + ""}
      >
        <DinamicTable.Col key="id" label="#" width={50} height={40} data={(e) => e.row.id} />
        <DinamicTable.Col key="nombre" label="Nombre" width={200} height={40} data={(e) => e.row.nombre} />
        <DinamicTable.Col key="ciudad" label="Ciudad" width={150} height={40} data={(e) => e.row.ciudad} />
        <DinamicTable.Col key="edad" label="Edad" width={80} height={40} dataType="number" data={(e) => e.row.edad} />
        <DinamicTable.Col key="fecha" label="Fecha" width={132} height={40} dataType="date" dateFormat="yyyy-MM-dd hh:mm:ss" data={(e) => e.row.fecha_registro} />
        <DinamicTable.Col key="fechahora" label="Fecha y Hora" width={132} height={40} dataType="datetime" dateFormat="yyyy-MM-dd hh:mm:ss" data={(e) => e.row.fecha_registro} />
        <DinamicTable.Col key="hora" label="Hora" width={132} height={40} dataType="time" dateFormat="yyyy-MM-dd hh:mm:ss" data={(e) => e.row.fecha_registro} />
        <DinamicTable.Col key="tipo" label="Tipo" width={220} height={60}
          data={(e) => (e.row.tipo ?? []).map((t) => t.titulo)}
          cellStyle={{
            flexDirection: "row",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: 4,
          }}
          customComponent={(e) => (e.row.tipo ?? []).map((t) => (
            <SView key={t.key} style={{
              borderWidth: 1,
              backgroundColor: (t.color ?? STheme.colorFromText(t.titulo)) + "15",
              borderColor: (t.color ?? STheme.colorFromText(t.titulo)) + "50",
              padding: 2,
              paddingHorizontal: 4,
              borderRadius: 4,
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }} row>
              <SView style={{
                width: 12,
                height: 12,
                borderRadius: 100,
                backgroundColor: (t.color ?? STheme.colorFromText(t.titulo)),
              }}></SView>
              <SText fontSize={10}>{t.titulo}</SText>
            </SView>
          ))}
        />
      </DinamicTable>
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
