import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
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
import FloatMenu from '../../Components/FloatMenu';
import Model from '../../Model';
import options from '../productos/tipo_producto/options';

const URL = "/crm/tipoMovimientoLead";
export default class tipoMovimientoLead extends Component {
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({
            url: URL, permiso: "ver"
        }).then(e => {
            if (!e) {
                SNavigation.goBack();
                return;
            }
            this.forceUpdate();

        })

    }
    render() {
        return <SPage title={"Tipo de leads"} disableScroll>
            <DinamicTable
                key='index'
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                selectType='single'
                loadInitialState={async () => {
                    return {
                        sorters: [{
                            key: "tipo",
                            order: "asc",
                            type: "string"
                        }]
                    }
                }}
                ref={ref => this.DinamicTable = ref}
                loadData={async () => { return await MDL.crm.tipoMovimientoLead.getAll(); }}
                onSelect={(e) => { console.log("Selected project:", e.row); }}
                onSelect={(e) => {
                    const { row, evt } = e;
                    const nombreProyecto = "LEAD: " + row?.titulo || "El tipo leads";
                    const options = [];
                    if (MDL.rolesPermisos.getPermiso({
                        url: URL,
                        permiso: "edit",
                    })) {
                        options.push({ label: "Editar", icon: <SIcon name="Edit" fill={STheme.color.text} />, onPress: () => FormRegistroTipoMovimientoLead.open({ defaultData: row, onActualizar: () => this.DinamicTable.loadData() }) })

                    }


                    if (MDL.rolesPermisos.getPermiso({
                        url: URL,
                        permiso: "delete",
                    })) {
                        options.push({
                            label: "Eliminar", icon: <SIcon name="Delete" fill={STheme.color.text} />, onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar tipo de leads",
                                    message: "¿Estás seguro de eliminar el leads?",
                                    onPress: () => {
                                        SSocket.sendPromise({
                                            service: "crm",
                                            component: "tipo_movimiento_lead",
                                            type: "editar",
                                            data: { ...row, estado: 0 }
                                        }).then(() => {
                                            SNotification.send({
                                                key: "eliminar_ok",
                                                title: "Leads eliminado",
                                                type: "success",
                                                time: 1500,
                                                body: `${nombreProyecto} fue eliminado correctamente.`
                                            });
                                            this.DinamicTable.loadData();
                                        }).catch(err => {
                                            console.error("❌ Error al eliminar el leads:", err);
                                            SNotification.send({
                                                key: "eliminar_error",
                                                title: "Error",
                                                type: "error",
                                                time: 3000,
                                                body: "❌ Ocurrió un error al eliminar. Intenta nuevamente.",
                                                color: STheme.color.error
                                            });
                                        });
                                    }
                                });
                            }
                        })

                    }



                    FloatMenu.open({
                        e: evt,
                        label: nombreProyecto,
                        options: options,
                    });
                }}
            >
                <DinamicTable.Col key={"key"} label='ID' width={35} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"tipo"} label='Tipo' width={120} data={(e) => e.row.tipo}
                    customComponent={e => {
                        return <SView center>
                            <Etiqueta tipo_leads={e.row.tipo} onPress={() => {
                                const activeFilter = this.DinamicTable.filtros.findIndex(f => f.col === "tipo");

                                if (activeFilter !== -1) {
                                    if (e.row.tipo == this.DinamicTable.filtros[activeFilter].value) {
                                        return;
                                    }
                                    this.DinamicTable.filtros.splice(activeFilter, 1);
                                }
                                this.DinamicTable.filtros.push({
                                    col: "tipo",
                                    operator: "=",
                                    value: e.row.tipo
                                });
                                this.DinamicTable.applyFilter()
                            }}></Etiqueta>
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"titulo"} label='Titulo' width={200} data={(e) => e.row.titulo} />
                <DinamicTable.Col key={"descripcion"} label='Descripción' width={200} data={(e) => e.row.descripcion} />

            </DinamicTable>
            {MDL.rolesPermisos.getPermiso({
                url: URL,
                permiso: "new",
            }) && <FloatButtom onPress={() => {
                FormRegistroTipoMovimientoLead.open(({ onRegister: (e) => { this.DinamicTable.loadData(); } }))
            }} />}
        </SPage >
    }
}