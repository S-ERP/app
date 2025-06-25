import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import SCharts from 'servisofts-charts';


export default class reporteconfirmado extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            fecha_inicio: new SDate("2025-06-05").toString("yyyy-MM-dd"),
            fecha_fin: new SDate("2025-06-08").toString("yyyy-MM-dd"),
        };
    }

    componentDidMount() {
        this.cargar();
    }

    cargar = () => {
        const { fecha_inicio, fecha_fin } = this.state;
        if (!fecha_inicio || !fecha_fin) return;

        MDL.crm.reporte._get_confirmados_ranking(fecha_inicio, fecha_fin)
            .then(data => {
                this.setState({ data });
                console.log("Datos recibidos:", data);
            })
            .catch(err => {
                console.error("Error cargando datos:", err);
            });
    };

    handleFechaChange = (key, value) => {
        this.setState({ [key]: value }, this.cargar);
    };

    render() {
        const { data, fecha_inicio, fecha_fin } = this.state;
        if (!data) return <SLoad />;

        return (
            <SPage title="Confirmados"  >
                <SHr height={20} />

                <SView col={"xs-12"} row center>

                    <SView col={"xs-11 md-5"} row backgroundColor='transparent'>
                        <SView col={"xs-12"} height={50} center row  >
                            <SView col={"xs-5"} backgroundColor='transparent'>
                                <SInput
                                    type="date" placeholder="Fecha Inicio" label={"Fecha Inicio"} style={{ width: "100%", borderRadius: 4, backgroundColor: STheme.color.card, borderColor: "#666" }}
                                    defaultValue={fecha_inicio} onChangeText={(val) => this.handleFechaChange("fecha_inicio", val)}
                                />
                            </SView>

                            <SView flex />
                            <SView col={"xs-5"} >
                                <SInput
                                    type="date" placeholder="Fecha Fin" label={"Fecha Fin"} style={{ width: "100%", borderRadius: 4, backgroundColor: STheme.color.card, borderColor: "#666" }}
                                    defaultValue={fecha_fin} onChangeText={(val) => this.handleFechaChange("fecha_fin", val)}
                                />
                            </SView>
                        </SView>
                    </SView>

                    <SHr height={150} />

                    <SView style={{ width: 300, height: 300 }}>
                        <SCharts
                            type="Donut_gauge" strokeWidth={1} data={data} colors={["#ff00ff", "#ffff00"]}
                            textColor={STheme.color.text} showLabel showValue
                        />
                    </SView>
                </SView>

            </SPage>
        );
    }
}