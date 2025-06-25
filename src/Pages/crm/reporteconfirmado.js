import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import MDL from '../../MDL';


export default class reporteconfirmado extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
        };
    }



    componentDidMount() {


        MDL.crm.reporte._get_confirmados(this.pk).then((e) => {
            // if (this.historicoMovimientos) {
            //     this.historicoMovimientos.componentDidMount();
            // }
            this.setState({ data: e })
        })


    }

    render() {


        const data = this.state.data;
        // const { data } = this.state;
        if (data == null) return <SLoad />
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



                <STable2
                    header={[
                        { key: "index", label: "#", width: 40 },
                        { key: "empresa", label: "empresa", width: 250 },
                        { key: "usuario", label: "usuario", width: 250 },
                        { key: "fecha_editada", label: "fecha_editada", width: 250 },
                        { key: "fecha_on", label: "fecha_on", width: 250 },
                        { key: "estado_lead", label: "estado_lead", width: 250 },
                    ]}
                    data={data}
                />
            </SPage>
        );
    }

}
