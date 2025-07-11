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



        componentDidMount(): void {
            MDL.inventario.getAllConteoManualInventario().then((almacenes: any) => {
                this.almacenes = Object.values(almacenes)
             })
        }


    mostrarPopup(aux_key: any) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={600} center >
                        <TurnoComponent key_turno={aux_key} onReload={() => {
                            this.DinamicTable.loadData();
                            console.log("✅ Se guardó el turno y se ejecutó el callback");
                            // Aquí puedes refrescar listas, volver a cargar datos, etc.
                        }}

                        ></TurnoComponent>
                    </SView>
                </SView>
            )
        });
    }


    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            ref={ref => this.DinamicTable = ref}
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
                // this.mostrarPopup(e.row.key)
                // console.log("Selected turno:", e.row.key);
            }}


            loadData={async () => {
                const all = await MDL.inventario.getAll_reporte_conteo_inventario_detallado();
                // const almacen = await MDL.almacenes.getAllAlmacen();
                // all.forEach(e => {
                //     e.key_almacen = almacen[e?.key_almacen] || null;
                // });

                console.log("📦 Reporte de inventario:", all);

                return all;
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
            <DinamicTable.Col key="key_almacen" label="Almacen" width={150} data={(e) => e.row?.key_almacen} />
            <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.key_usuario} />
            <DinamicTable.Col key="fecha" label="fecha" width={100} data={(e) => e.row?.fecha} />
            <DinamicTable.Col key="hora" label="hora" width={100} data={(e) => e.row?.hora} />
            <DinamicTable.Col key="key_conteo" label="key_conteo" width={100} data={(e) => e.row?.key_conteo} />
            <DinamicTable.Col key="total_baja" label="total_baja" width={100} data={(e) => e.row?.total_baja} />
            <DinamicTable.Col key="total_perdida_no_registrada" label="total_perdida_no_registrada" width={100} data={(e) => e.row?.total_perdida_no_registrada} />


        </DinamicTable>

    }

    render() {


        return (
            <SPage title="Turnos y Horarios" disableScroll>

                {this.mostrarTabla()}

                <SHr height={20} />
            </SPage>
        );
    }


}
