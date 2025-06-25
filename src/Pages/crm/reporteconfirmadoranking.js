import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';


export default class reporteconfirmadoranking extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            fecha_inicio: new SDate("2025-06-02").toString("yyyy-MM-dd"),
            fecha_fin: new SDate("2025-06-08").toString("yyyy-MM-dd"),

        };
    }



    componentDidMount() {


        MDL.crm.reporte._get_confirmados().then((e) => {
            this.setState({ data: e })
        })


    }

    render() {

        return (
            <SPage title="confirmados" disableScroll>
                <SHr height={20} />
                {/* <SView col="xs-12 md-9" row style={{ gap: 8 }}>
                    <SView width={140} height={32} center backgroundColor={STheme.color.card} borderRadius={4}>
                        <SText fontSize={14} color={STheme.color.white} onPress={this.handleExcelImport}>{"+  Importar Excel"}</SText>
                    </SView>
                    <SView width={140} height={32} center row backgroundColor={STheme.color.card} borderRadius={4} onPress={() => {
                        if (!data.length) return SPopup.alert("⚠️ No hay datos en la tabla");
                        this.setState({ data: [], mapeo: {}, excelData: [] });
                    }}>
                        <SIcon name='crmeliminar' width={16} fill='white' />
                        <SText fontSize={14}> Limpiar Tabla</SText>
                    </SView>
                    <SView flex />
                    <SView width={140} height={32} center row backgroundColor={STheme.color.card} borderRadius={4} onPress={this.enviarTablaServidor}>
                        <SIcon name='MessageSend' width={14} fill='white' />
                        <SText fontSize={14} color={STheme.color.white}> Enviar al servidor</SText>
                    </SView>
                </SView> */}





                <DinamicTable
                    key='index'

                    // colors={Config.table.colors()}
                    // cellStyle={Config.table.cellStyle()}
                    selectType='single'
                    center
                    // textStyle={Config.table.textStyle()}
                    language='es'
                    ref={ref => this.DinamicTable = ref} loadData={async () => { return await MDL.crm.reporte._get_confirmados_ranking(); }} onSelect={(e) => { console.log("Selected confirmado:", e.row); }}

                // loadInitialState={async () => {
                //     return {
                //         sorters: [
                //             // { key: "fecha_on", order: "desc", type: "date" },
                //             { key: "fecha_edit", order: "desc", type: "date" }
                //         ]
                //     }
                // }}
                >

                    <DinamicTable.Col key={"key"} label='ID' width={28} textStyle={{
                        color: STheme.color.lightGray,
                        fontSize: 10
                    }} data={(e) => e.index + 1} />

                    {/* <DinamicTable.Col key={"key"} label='ID' width={28} textStyle={{
                        color: STheme.color.lightGray,
                        fontSize: 10
                    }} data={(e) => e.index + 1} /> */}

                    {/* <DinamicTable.Col key={"-key"} label='Ver' width={40} data={(e) => e.row?.proyecto?.nombre}
                        customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/crm/call", { key: e.row.key }) }}>
                            <SIcon name='Eyes' height={14} fill={STheme.color.lightGray} ></SIcon>
                        </SView>} /> */}

                    <DinamicTable.Col key={"foto"} label='User'
                        data={(e) => e.row?.usuario}
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

                    {/* <DinamicTable.Col key={"empresa"} label='empresa' width={250}
                        data={(e) => e.row.empresa}
                        // customComponent={e => {
                        //     return <SView col={"xs-12"} row center>
                        //         <Etiqueta size={10} tipo_leads={e.row.state} />
                        //     </SView>
                        // }}
                    /> */}

                    <DinamicTable.Col key={"total_confirmados"} label='total_confirmados' width={250}
                        data={(e) => e.row.total_confirmados}
                    // customComponent={e => {
                    //     return <SView col={"xs-12"} row center>
                    //         <Etiqueta size={10} tipo_leads={e.row.state} />
                    //     </SView>
                    // }}
                    />
                    {/* <DinamicTable.Col key={"state"} label='Leads' width={110}
                        data={(e) => e.row.state}
                        customComponent={e => {
                            return <SView col={"xs-12"} row center>
                                <Etiqueta size={10} tipo_leads={e.row.state} />
                            </SView>
                        }}
                    /> */}

                </DinamicTable>



                {/* <STable2
                    header={[
                        { key: "index", label: "#", width: 40 },
                        { key: "empresa", label: "empresa", width: 250 },
                        { key: "usuario", label: "usuario", width: 250 },
                        { key: "fecha_editada", label: "fecha_editada", width: 250 },
                        { key: "fecha_on", label: "fecha_on", width: 250 },
                        { key: "estado_lead", label: "estado_lead", width: 250 },
                    ]}
                    data={data}
                /> */}
            </SPage>
        );
    }

}
