import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import MDL from '../MDL';
import Config from '../Config';
import Model from '../Model';


export default class Turno extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // data: null
        };
    }
    render() {


        return (
            <SPage title="Turnos y Horarios" disableScroll>
                <SHr height={20} />
                <DinamicTable
                    key="tabla"
                    center
                    language="es"
                    selectType="single"
                    colors={{
                        text: "red",
                        background: STheme.color.background,
                        header: STheme.color.card,
                    }}
                    cellStyle={{
                        borderWidth: 0,
                    }}
                    textStyle={{
                        fontSize: 12,
                        color: "blue",

                    }}

                    ref={ref => this.DinamicTable = ref}
                    keyExtractor={e => e.usuario}
                    loadData={async () => {
                        const all = await MDL.empresa.getTurnosHorariosAtencion();

                        // 🔁 OPCIONAL: si querés usar clientes en lugar de usuarios
                        // const usuarios = await MDL.crm.cliente.getAll();
                        const usuarios = await MDL.usuario.getByKeys(Object.keys(all));

                        const data = Object.entries(all).flatMap(([key_usuario, turnos]) => {
                            const usuario = usuarios.find(u => u.key === key_usuario);
                            return turnos.map((item, index) => ({
                                ...item,
                                key_usuario,
                                usuario, // ✅ Aquí sí incluimos el objeto completo
                                index
                            }));
                        });

                        console.log("fregado", data);
                        return data;
                    }}

                >
                    <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
                    <DinamicTable.Col key="nombre_dia" label="Día" width={100} data={(e) => e.row?.nombre_dia} />
                    <DinamicTable.Col key="horario" label="Horario" width={150} data={(e) => e.row?.horario} />
                    <DinamicTable.Col key="nombre_turno" label="Turno" width={150} data={(e) => e.row?.nombre_turno} />
                    <DinamicTable.Col key="atiende_feriado" label="¿Feriado?" width={100} data={(e) => e.row?.atiende_feriado} />
                    <DinamicTable.Col key="dia_semana" label="Día #" width={80} data={(e) => e.row?.dia_semana} />
                    <DinamicTable.Col key="registrado_el" label="Fecha Registro" width={120} data={(e) => e.row?.registrado_el} />
                    <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.key_usuario} />
                    <DinamicTable.Col key="asdsad" label="Usuario" width={250} data={(e) => e.row?.usuario.Nombres} />


             </DinamicTable>
            </SPage>
        );
    }


}
