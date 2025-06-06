import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FormRegistroProyecto from './Components/FormRegistroProyecto';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import FormRegistroCliente from './Components/FormRegistroCliente';
import PButtom from '../../Components/PButtom';
import FloatButtom from '../../Components/FloatButtom';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';


export default class cliente extends Component {

    componentDidMount() {
        MDL.crm.cliente.getAll().then(e => {
            console.log("Projects fetched successfully:", e);
        }).catch(e => {
            console.error("Error fetching projects:", e);
        })
    }

    render() {
        return <SPage title={"Cliente"}>
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
                selectType='single'
                language='es'
                ref={ref => this.DinamicTable = ref} loadData={async () => { return await MDL.crm.cliente.getAll(); }} onSelect={(e) => { console.log("Selected project:", e.row); }}

                onSelect={(e) => {
                    const { row, evt } = e;
                    const nombreCliente = "CLIENTE: " + (row?.nombres ?? "");
                    // const nombreCliente = "CLIENTE: "+ row?.nombres ?? "El cliente";
                    FloatMenu.open({
                        e: evt,
                        label: nombreCliente,
                        options: [
                            // 🟩 Editar
                            {
                                label: "Editar",
                                icon: <SIcon name="Edit" fill={STheme.color.text} />,
                                onPress: () => {
                                    FormRegistroCliente.open({
                                        defaultData: row,
                                        onActualizar: (nuevoDato) => {
                                            this.DinamicTable.loadData();
                                            console.log("Cliente actualizado:", nuevoDato);
                                        }
                                    });
                                }
                            },
                            // 🟥 Eliminar
                            {
                                label: "Eliminar",
                                icon: <SIcon name="Delete" fill={STheme.color.text} />,
                                onPress: () => {
                                    SPopup.confirm({
                                        title: "Eliminar cliente",
                                        message: `¿Estás seguro de eliminar a ${nombreCliente}?`,
                                        onPress: () => {
                                            SSocket.sendPromise({
                                                service: "crm",
                                                component: "cliente",
                                                type: "editar",
                                                data: { ...row, estado: 0 }
                                            })
                                                .then(() => {
                                                    SNotification.send({
                                                        key: "eliminar_ok",
                                                        title: "Cliente eliminado",
                                                        type: "success",
                                                        time: 1500,
                                                        body: `${nombreCliente} fue eliminado correctamente.`
                                                    });
                                                    this.DinamicTable.loadData();
                                                })
                                                .catch(err => {
                                                    console.error("❌ Error al eliminar cliente:", err);
                                                    SNotification.send({
                                                        key: "eliminar_error",
                                                        title: "Error al eliminar",
                                                        type: "error",
                                                        time: 3000,
                                                        body: "❌ Ocurrió un error al eliminar. Intenta nuevamente.",
                                                        color: STheme.color.error
                                                    });
                                                });
                                        }
                                    });
                                }
                            }

                        ]
                    });
                }}

            >
                <DinamicTable.Col key={"key"} label='ID' width={35} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"nombres"} label='Nombre completo' width={180} data={(e) => e.row.nombres} />
                <DinamicTable.Col key={"telefono"} label='Teléfono' width={120} data={(e) => e.row.telefono} />
                <DinamicTable.Col key={"correo"} label='Correo' width={150} data={(e) => e.row.correo} />
                <DinamicTable.Col key={"nit"} label='NIT' width={90} data={(e) => e.row.nit} />
                <DinamicTable.Col key={"razon_social"} label='Razón Social' width={90} data={(e) => e.row.razon_social} />
                {/* <DinamicTable.Col key={"direccion"} label='Dirección' width={100} data={(e) => e.row.direccion} /> */}
                {/* <DinamicTable.Col key={"lat"} label='Latitud' width={70} data={(e) => e.row.lat} /> */}
                {/* <DinamicTable.Col key={"lng"} label='Longitud' width={70} data={(e) => e.row.lng} /> */}
                <DinamicTable.Col key={"fecha_nacimiento"} label='Nacimiento' width={70} data={(e) => e.row.fecha_nacimiento} />
                <DinamicTable.Col key={"sexo"} label='Sexo' width={60} data={(e) => e.row.sexo} />
                {/* <DinamicTable.Col key={"descripcion"} label='Descripción' width={100} data={(e) => e.row.descripcion} /> */}
                {/* <DinamicTable.Col key={"editar"} label='Editar' width={100} data={(e) => ""}
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
                /> */}


            </DinamicTable>

            <FloatButtom onPress={() => { FormRegistroCliente.open(({ onRegister: (e) => { this.DinamicTable.loadData(); } })) }} />

        </SPage >
    }
}
