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


            // fecha_inicio: new SDate("2025-06-02").toString(),
            // fecha_fin: new SDate("2025-06-31").toString(),
        };

    }


    componentDidMount() {


        this.cargar();
    }


    cargar() {
        const inicio = this.state.fecha_inicio;
        const fin = this.state.fecha_fin;
        // const inicio = "2025-06-04";
        // const fin = "2025-06-07";


        MDL.crm.reporte._get_confirmados_ranking(inicio, fin).then((data) => {
            this.setState({ data });
            console.log("trajo ", data)
        }).catch((err) => {
            console.error("Error cargando datos:", err);
        });
    }


    render() {
        const { data } = this.state;

        if (!data) return <SLoad />;

        // this.fecha_inicio = SNavigation.getParam("fecha_inicio", new SDate().toString("yyyy-MM-dd"));
        // this.fecha_fin = SNavigation.getParam("fecha_fin", new SDate().toString("yyyy-MM-dd"));

        console.log("miralo ", data)
        console.log("fecha inicio " + this.state.fecha_inicio + " -  fin " + this.state.fecha_fin)
        return (
            <SPage title="Confirmados" center>
                <SHr height={20} />

                <SView col={"xs-12"}
                    height={50}
                    style={{
                        height: 50,
                        // backgroundColor: "#ff0000",
                        alignItems: "center",
                        justifyContent: "center"
                    }} row>
                    <SView col={"xs-11 md-6 xl-4"} style={{ height: "100%", padding: 4, }}>
                        <SInput
                            type="date"
                            // customStyle: "primary",
                            placeholder="Fecha Inicio"
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 4,
                                backgroundColor: STheme.color.card,
                                borderColor: "#666"
                            }}
                            defaultValue={this.state.fecha_inicio}
                            onChangeText={(val) => {
                                this.state.fecha_inicio = val
                                this.setState({ ...this.state })
                                // this.forceUpdate();
                                this.cargar();

                            }}
                        />

                        <SInput
                            type="date"
                            // customStyle: "primary",
                            placeholder="Fecha fin"
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 4,
                                backgroundColor: STheme.color.card,
                                borderColor: "#666"
                            }}
                            defaultValue={this.state.fecha_fin}
                            onChangeText={(val) => {
                                this.state.fecha_fin = val
                                this.setState({ ...this.state })
                                this.cargar();

                            }}
                        />
                    </SView>
                </SView>


                <SHr height={20} />


                <SView style={{ width: 300, height: 300 }}>
                    <SCharts
                        type='Donut_gauge'
                        strokeWidth={1}
                        data={data}
                        colors={["#ff00ff", "#ffff00"]}
                        // textColor={"green"}
                        textColor={STheme.color.text}
                        showLabel
                        showValue
                    />
                </SView>
            </SPage>
        );
    }
}