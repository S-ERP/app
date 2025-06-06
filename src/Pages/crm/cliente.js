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
import Config from '../../Config';


export default class cliente extends Component {

    componentDidMount() {
        MDL.crm.cliente.getAll().then(e => {
            console.log("Projects fetched successfully:", e);
        }).catch(e => {
            console.error("Error fetching projects:", e);
        })
    }

    render() {
        return <SPage title={"cliente"}>
            {/* <SView width={140} height={26} center backgroundColor={STheme.color.card} style={{ borderRadius: 4 }}  >
    <SText fontSize={12} color={STheme.color.white} onPress={() => {
     FormRegistroCliente.open(({ onRegister: (e) => { this.DinamicTable.loadData(); } }))
    }}>{"+ Agregar cliente"}</SText>
   </SView> */}
            {/* <SHr height={10} /> */}
            <DinamicTable
                key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                ref={ref => this.DinamicTable = ref} loadData={async () => { return await MDL.crm.cliente.getAll(); }} onSelect={(e) => { console.log("Selected project:", e.row); }} >
                <DinamicTable.Col key={"key"} label='ID' width={20} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"nombres"} label='Nombres' width={80} data={(e) => e.row.nombres} />
                <DinamicTable.Col key={"apellidos"} label='Apellidos' width={80} data={(e) => e.row.apellidos} />
                <DinamicTable.Col key={"telefono"} label='Teléfono' width={90} data={(e) => e.row.telefono} />
                <DinamicTable.Col key={"correo"} label='Correo' width={150} data={(e) => e.row.correo} />
                <DinamicTable.Col key={"nit"} label='NIT' width={90} data={(e) => e.row.nit} />
                <DinamicTable.Col key={"razon_social"} label='Razón Social' width={90} data={(e) => e.row.razon_social} />
                {/* <DinamicTable.Col key={"direccion"} label='Dirección' width={100} data={(e) => e.row.direccion} /> */}
                {/* <DinamicTable.Col key={"lat"} label='Latitud' width={70} data={(e) => e.row.lat} /> */}
                {/* <DinamicTable.Col key={"lng"} label='Longitud' width={70} data={(e) => e.row.lng} /> */}
                <DinamicTable.Col key={"fecha_nacimiento"} label='Nacimiento' width={70} data={(e) => e.row.fecha_nacimiento} />
                <DinamicTable.Col key={"sexo"} label='Sexo' width={60} data={(e) => e.row.sexo} />
                {/* <DinamicTable.Col key={"descripcion"} label='Descripción' width={100} data={(e) => e.row.descripcion} /> */}
                <DinamicTable.Col key={"editar"} label='Editar' width={100} data={(e) => ""}
                    customComponent={e => <SView row card padding={2} onPress={() => {
                        FormRegistroCliente.open(({
                            defaultData: e.row, onActualizar: (nuevoDato) => {
                                this.DinamicTable.loadData();
                                console.log("Cliente actualizado:", nuevoDato);
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
                            component: "cliente",
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

            <FloatButtom onPress={() => { FormRegistroCliente.open(({ onRegister: (e) => { this.DinamicTable.loadData(); } })) }} />

        </SPage >
    }
}
