import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import MDL from '../MDL';
import Config from '../Config';
import Model from '../Model';
import FloatButtom from '../Components/FloatButtom';
import TurnoComponent from '../Components/TurnoComponent';
import Container from '../Components/Container';


export default class turnov2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    mostrarPopup(aux_key: any) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={600} center >
                        <TurnoComponent key_turno={aux_key} ></TurnoComponent>
                    </SView>
                </SView>
            )
        });
    }


    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            center
            language="es"
            selectType="single"
            colors={{
                // text: "red",
                background: STheme.color.background,
                header: STheme.color.card,
            }}
            cellStyle={{
                borderWidth: 0,
            }}
            textStyle={{
                fontSize: 12,
                color: "white",

            }}

            ref={ref => this.DinamicTable = ref}
            onSelect={(e) => {
                // <TurnoComponent></TurnoComponent>
                this.mostrarPopup(e.row.key)
                // console.log("Selected turno:", e.row.key);
            }}


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
            <DinamicTable.Col key={"foto"} label='User'
                data={(e) => e.row?.key_usuario}
                width={35}
                customComponent={e => <SView style={{
                    width: 24,
                    height: 24,
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: STheme.color.card + "66",
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + e.data} style={{
                        resizeMode: "cover",
                    }} />
                </SView>} />
            {/* <DinamicTable.Col key="nombre" label="Día" width={100} data={(e) => e.row?.nombre} /> */}
            <DinamicTable.Col key="horario" label="Horario" width={150} data={(e) => e.row?.horario} />
            <DinamicTable.Col key="nombre" label="Turno" width={150} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key="atiende_feriado" label="¿Feriado?" width={100} data={(e) => e.row?.atiende_feriado} />
            <DinamicTable.Col key="dia" label="Día #" width={80} data={(e) => e.row?.dia} />
            <DinamicTable.Col key="registrado_el" label="Fecha Registro" width={120} data={(e) => e.row?.registrado_el} />
            <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.key_usuario} />
            <DinamicTable.Col key="asdsad" label="Usuario" width={250} data={(e) => e.row?.usuario.Nombres} />


        </DinamicTable>

    }

    render() {


        return (
            <SPage title="Turnos y Horarios" disableScroll>

                {this.mostrarTabla()}

                <SHr height={20} />
                <FloatButtom onPress={() => { this.mostrarPopup() }} />
            </SPage>
        );
    }


}
