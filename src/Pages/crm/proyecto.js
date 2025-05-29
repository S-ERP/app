import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FormRegistroProyecto from './Components/FormRegistroProyecto';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import PopupRellamada from './Components/PopupRellamada';
import PopupRazon from './Components/PopupRazon';


export default class proyecto extends Component {

        componentDidMount() {
                MDL.crm.proyecto.getAll().then(e => {
                        console.log("Projects fetched successfully:", e);
                }).catch(e => {
                        console.error("Error fetching projects:", e);
                })
        }

        render() {
                return <SPage title={"Proyecto"} icon={<SIcon name='empresa' fill={STheme.color.text} />}>

                        <SText onPress={() => {
                                PopupRellamada.open(({
                                        onRegister: (e) => {
                                        }
                                }))
                        }}>{"Popup rellamada"}</SText>
                        <SText onPress={() => {
                                PopupRazon.open(({
                                        onRegister: (e) => {
                                        }
                                }))
                        }}>{"Popup razón"}</SText>

                        <DinamicTable
                                ref={ref => this.DinamicTable = ref}
                                loadData={async () => { return await MDL.crm.proyecto.getAll(); }}
                                onSelect={(e) => {
                                        console.log("Selected project:", e.row);
                                        FloatMenu.open({
                                                e: e.evt,
                                                label: e.row.nombre,

                                                options: [
                                                        {
                                                                label: "Productos",
                                                                onPress: () => {
                                                                      
                                                                },
                                                                icon: <SIcon name="producto" fill={STheme.color.text} />,
                                                        },
                                                         {
                                                                label: "Campañas publicitarias",
                                                                onPress: () => {
                                                                      
                                                                },
                                                                icon: <SIcon name="campana" fill={STheme.color.text} />,
                                                        },
                                                        {
                                                                label: "Editar proyecto",
                                                                onPress: () => {
                                                                        FormRegistroProyecto.open(({
                                                                                defaultData: e.row, onActualizar: (nuevoDato) => {
                                                                                        this.DinamicTable.loadData();
                                                                                        console.log("Proyecto actualizado:", nuevoDato);
                                                                                }
                                                                        }))
                                                                },
                                                                icon: <SIcon name="Edit" fill={STheme.color.text} />,
                                                        },
                                                        {
                                                                label: "Eliminar proyecto",
                                                                icon: <SIcon name="Delete" fill={STheme.color.text} />,
                                                                onPress: () => {
                                                                        SPopup.confirm({
                                                                                title: "Eliminar Proyecto",
                                                                                message: "¿Estas seguro de eliminar el proyecto?",
                                                                                onPress: () => {
                                                                                        SSocket.sendPromise({
                                                                                                service: "crm",
                                                                                                component: "proyecto",
                                                                                                type: "editar",
                                                                                                data: { ...e.row, estado: 0 }
                                                                                        }).then(e => {
                                                                                                console.error("❌ Error al recargar proyectos:", e);
                                                                                                SNotification.send({ key: "eliminar", title: "eliminado", type: "loading", time: 1000, body: e.error, color: STheme.color.error, })
                                                                                                this.DinamicTable.loadData();
                                                                                        })
                                                                                }
                                                                        })

                                                                }
                                                        },


                                                ]
                                        })

                                }}
                        >

                                <DinamicTable.Col key={"nombre"} label='Nombre'
                                        width={120}
                                        data={(e) => {
                                                return e.row.nombre
                                        }} />
                                <DinamicTable.Col key={"descripcion"} label='Descripcion'
                                        width={250}
                                        data={(e) => {
                                                return e.row.descripcion
                                        }} />
                                {/* <DinamicTable.Col key={"editar"} label='Editar' width={100} data={(e) => ""}
                                        customComponent={e => <SView row card padding={2} onPress={() => {
                                                FormRegistroProyecto.open(({
                                                        defaultData: e.row, onActualizar: (nuevoDato) => {
                                                                this.DinamicTable.loadData();
                                                                console.log("Proyecto actualizado:", nuevoDato);
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
                                                        component: "proyecto",
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
                                        </SView>} /> */}
                        </DinamicTable>
                        <FloatButtom onPress={() => {
                                FormRegistroProyecto.open(({
                                        onRegister: (e) => {
                                                this.DinamicTable.loadData();
                                        }
                                }))
                        }} />
                </SPage >
        }
}
