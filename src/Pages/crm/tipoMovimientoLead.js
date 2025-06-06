import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import FormRegistroProyecto from './Components/FormRegistroProyecto';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import FormRegistroCliente from './Components/FormRegistroCliente';
import PButtom from '../../Components/PButtom';
import FloatButtom from '../../Components/FloatButtom';
import FormRegistroTipoMovimientoLead from './Components/FormRegistroTipoMovimientoLead';
import { interpolate } from 'react-native-reanimated';
import empresa from '../empresa';
import Etiqueta from './Components/Etiqueta';
import Config from '../../Config';

export default class tipoMovimientoLead extends Component {

    componentDidMount() {



        MDL.crm.tipoMovimientoLead.getAll().then(e => {
            console.log("Projects fetched successfully:", e);
        }).catch(e => {
            console.error("Error fetching projects:", e);
        })
    }




    render() {
        return <SPage title={"cliente"}>

            <SHr height={10} />

            <DinamicTable
                key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                loadInitialState={async () => {
                    return {
                        sorters: [{
                            key: "tipo",
                            order: "asc",
                            type: "string"
                        }]
                    }
                }}
                ref={ref => this.DinamicTable = ref} loadData={async () => { return await MDL.crm.tipoMovimientoLead.getAll(); }} onSelect={(e) => { console.log("Selected project:", e.row); }} >

                <DinamicTable.Col key={"key"} label='ID' width={20} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"titulo"} label='titulo' width={130} data={(e) => e.row.titulo} />
                <DinamicTable.Col key={"descripcion"} label='descripcion' width={200} data={(e) => e.row.descripcion} />
                <DinamicTable.Col key={"tipo"} label='tipo' width={90} data={(e) => e.row.tipo}
                    customComponent={e => {
                        return <Etiqueta tipo_leads={e.row.tipo}></Etiqueta>
                    }}
                />

                <DinamicTable.Col key={"editar"} label='Editar' width={100} data={(e) => ""}
                    customComponent={e => <SView row card padding={2} onPress={() => {
                        FormRegistroTipoMovimientoLead.open(({
                            defaultData: e.row, onActualizar: (nuevoDato) => {
                                this.DinamicTable.loadData();
                                console.log("tipo leads actualizado:", nuevoDato);
                            }
                        }))
                    }}>
                        <SIcon name='Edit' width={18} />
                        <SView width={4} />
                        <SText center color={STheme.color.green} >{"Actualizar"}</SText>
                    </SView>}
                />


                <DinamicTable.Col key={"eliminar"} label='Delete'
                    width={100}
                    data={(e) => ""}
                    customComponent={e => <SView row card padding={2} onPress={() => {
                        console.log("Delete project:", e.row);
                        SSocket.sendPromise({
                            service: "crm",
                            component: "tipo_movimiento_lead",
                            type: "editar",
                            data: { ...e.row, estado: 0 }
                        }).then(e => {
                            console.error("❌ Error al recargar proyectos:", e);
                            SNotification.send({ key: "eliminar", title: "eliminado", type: "loading", time: 1000, body: e.error, color: STheme.color.error, })
                            this.DinamicTable.loadData();
                        })
                        alert("✅ Eliminación exitosa del proyecto.");
                    }}>
                        <SIcon name='Delete' width={18} />
                        <SView width={4} />
                        <SText center color={STheme.color.danger} > {"Eliminar"}</SText>
                    </SView>} />
            </DinamicTable>

            <FloatButtom onPress={() => {
                FormRegistroTipoMovimientoLead.open(({ onRegister: (e) => { this.DinamicTable.loadData(); } }))
            }} />

        </SPage >
    }
}
