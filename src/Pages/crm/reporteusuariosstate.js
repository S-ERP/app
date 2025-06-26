import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import Model from '../../Model';
import { version } from 'process';


export default class reporteusuariosstate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
        };
    }



    handleFechaChange = (key, value) => {
        this.setState({ [key]: value }, this.cargar);
    };

    render() {
        const { data, fecha_inicio, fecha_fin } = this.state;
        if (!fecha_inicio || !fecha_fin) return;



        console.log("data  ", JSON.stringify(data))
        return (
            <SPage title="Confirmados" disableScroll >
                <SHr height={20} />

                <SView col={"xs-12"} row center>

                    <SView col={"xs-11 md-5"} row backgroundColor='transparent'>
                        <SView col={"xs-12"} height={50} center row  >
                            <SView col={"xs-5"} backgroundColor='transparent'>
                                <SInput
                                    type="date" placeholder="Fecha Inicio" label={"Fecha Inicio"} style={{ width: "100%", borderRadius: 4, backgroundColor: STheme.color.card, }}
                                    iconR={<SIcon name='Evento' width={28} fill='#666' />} defaultValue={fecha_inicio} onChangeText={(val) => this.handleFechaChange("fecha_inicio", val)}
                                />
                            </SView>

                            <SView flex />
                            <SView col={"xs-5"} >
                                <SInput
                                    type="date" placeholder="Fecha Fin" label={"Fecha Fin"} style={{ width: "100%", borderRadius: 4, backgroundColor: STheme.color.card, }}
                                    iconR={<SIcon name='Evento' width={28} fill='#666' />} defaultValue={fecha_fin} onChangeText={(val) => this.handleFechaChange("fecha_fin", val)}
                                />
                            </SView>
                        </SView>
                    </SView>
                </SView>




                <DinamicTable
                    key='index' textStyle={{
                        fontSize: 10,
                        color: STheme.color.lightGray
                    }}
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray, display: "flex" }}
                    colors={Config.table.colors()}
                    cellStyle={Config.table.cellStyle()}
                    textStyle={Config.table.textStyle()}
                    selectType='single'
                    center
                    language='es'
                    ref={ref => this.DinamicTable = ref}
                    keyExtractor={e => e.key_usuario}
                    loadData={async () => {
                        const all = await MDL.crm.reporte._get_usuarios_states_total(fecha_inicio + "T00:00:00", fecha_fin + "T23:59:59")
                        const usuarios = await MDL.usuario.getByKeys(Object.keys(all));
                        console.log(usuarios, all)
                        const arr = Object.keys(all).map(k => {
                            const obj = all[k]
                            obj.key_usuario = k
                            obj.usuario = usuarios.find(a => a.key == k)
                            console.log(obj)
                            return obj
                        })
                        this.DinamicTable.loadData();
                        return arr;
                    }}

                >
                    <DinamicTable.Col key={"key"} label='ID' width={35} data={(e) => e.index + 1} />
                    <DinamicTable.Col key={"nombre"} label='Usuario' width={100} data={(e) => e.row?.usuario?.Nombres} />


                    <DinamicTable.Col key={"foto"} label='User'
                        data={(e) => e.row?.key_usuario}
                        width={45}
                        customComponent={e => <SView style={{
                            width: 24,
                            height: 24,
                            borderRadius: 100,
                            overflow: "hidden",
                            backgroundColor: STheme.color.card + "66",
                        }}>
                            <SImage src={SSocket.api.root + "usuario/" + e.data} style={{ resizeMode: "cover", }} />
                        </SView>}

                    />



                    <DinamicTable.Col key={"total"} label='Total' width={100} data={(e) => {
                        let total = 0
                        Object.keys(e.row).filter(a => !["usuario", "key_usuario", "sin estado"].includes(a)).map((a) => {
                            total += parseFloat(e.row[a] ?? 0)
                        })
                        return total;

                    }} />
                    <DinamicTable.Col key={"confirmado"} label='confirmado' width={100} data={(e) => e.row.confirmado} />
                    <DinamicTable.Col key={"cancelado"} label='cancelado' width={100} data={(e) => e.row.cancelado} />
                    <DinamicTable.Col key={"delivery_en_proceso"} label='delivery proceso' width={100} data={(e) => e.row.delivery_en_proceso} />
                    <DinamicTable.Col key={"delivery_rellamada"} label='delivery rellamada' width={100} data={(e) => e.row.delivery_rellamada} />

                    <DinamicTable.Col key={"devuelto"} label='devuelto' width={100} data={(e) => e.row.devuelto} />
                    <DinamicTable.Col key={"despacho"} label='despacho' width={100} data={(e) => e.row.despacho} />
                    <DinamicTable.Col key={"double"} label='double' width={100} data={(e) => e.row.double} />
                    <DinamicTable.Col key={"en_proceso"} label='en proceso' width={100} data={(e) => e.row.en_proceso} />



                    <DinamicTable.Col key={"llamada_fallida"} label='llamada fallida' width={100} data={(e) => e.row.llamada_fallida} />
                    <DinamicTable.Col key={"nuevo"} label='nuevo' width={100} data={(e) => e.row.nuevo} />
                    <DinamicTable.Col key={"pagado"} label='pagado' width={100} data={(e) => e.row.pagado} />
                    <DinamicTable.Col key={"rechazo"} label='rechazo' width={100} data={(e) => e.row.rechazo} />
                    <DinamicTable.Col key={"rellamada"} label='rellamada' width={100} data={(e) => e.row.rellamada} />
                    <DinamicTable.Col key={"spam"} label='spam' width={100} data={(e) => e.row.spam} />



                    <DinamicTable.Col key={"en_proceso_whatsapp"} label='en proceso whatsapp' width={100} data={(e) => e.row.en_proceso_whatsapp} />
                    <DinamicTable.Col key={"enviando_whatsapp"} label='enviando whatsapp' width={100} data={(e) => e.row.enviando_whatsapp} />

                </DinamicTable>

            </SPage >
        );
    }
}