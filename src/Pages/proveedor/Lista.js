import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import Perfil from './Perfil';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearProveedor from './Components/PopupCrearProveedor';

export default class Lista extends Component {


    onSelect = SNavigation.getParam("onSelect")
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    mostrarPopup(aux_key: any, data: any) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={470} center >
                        <Perfil key_proveedor={aux_key} data={data} onReload={() => { this.DinamicTable.loadData(); }} ></Perfil>
                    </SView>
                </SView>
            )
        });
    }

    async loadInitialData() {
        try {

            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            const keysUsuarios = Object.values(proveedores).map(p => p.key_usuario).filter(Boolean);

            // Obtener usuarios desde el backend
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);

            // Adjuntar cada usuario a su proveedor correspondiente
            Object.values(proveedores).forEach(proveedor => {
                proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario);
            });

            console.log("proveeeee " + JSON.stringify(proveedores))
            return proveedores;

        } catch (error) {
            console.error('Error loading initial data:', error);
            return [];
        }
    }


    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            {...Config.table.applyTheme()}
            ref={ref => this.DinamicTable = ref}
            center
            language="es"
            selectType="single"

            colors={Config.table.colors()}
            cellStyle={Config.table.cellStyle()}
            textStyle={Config.table.textStyle()}

            loadInitialState={async () => {
                return { sorters: [{ key: "fecha_on", order: "asc", type: "date" }] }
            }}

            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row)
                    SNavigation.goBack();
                    return;
                }

                FloatMenu.open({
                    e: e.evt,
                    label: "Razón Social: " + e.row.razon_social,
                    options: [
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Proveedor",
                            onPress: () => {
                                // this.mostrarPopup(e.row.key, e.row);
                                const proveedor = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                }
                                PopupCrearProveedor.open({
                                    editObject: proveedor,
                                    key_empresa: proveedor.key_empresa,
                                    onSuccess: async () => {
                                        this.DinamicTable.loadData();
                                    },
                                })

                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Proveedor",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar Proveedor",
                                    message: "¿Estás seguro de eliminar este Proveedor?",
                                    onPress: () => {
                                        const data = e?.row;
                                        data.estado = 0;
                                        MDL.inventario.proveedor.editar(data).then((res) => {
                                            this.DinamicTable.loadData();
                                            console.log("Eliminar proveedor exitosa");
                                        }).catch(
                                            console.log("Eliminar proveedor erronea")
                                        )
                                    }
                                })

                            }
                        }
                    ]
                })


            }}


            loadData={async () => {

                return this.loadInitialData();


            }}

        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />



            <DinamicTable.Col key="key" label="Foto" width={180} data={(e) => e.row?.key ?? ""}
                customComponent={e => <>
                    {(e.row?.key) ?
                        <SView col={"xs-12"} center row  >
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SImage src={`${SSocket.api.inventario}proveedor/${e.row?.key}`} style={{ resizeMode: "cover" }} />
                            </SView>
                        </SView> : null}
                </>}
            />



            {/* <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.usuario.Nombres} /> */}
            <DinamicTable.Col key="razon_social" label="Razón Social" width={200} data={(e) => e.row?.razon_social} />
            <DinamicTable.Col key="nit" label="NIT" width={150} data={(e) => e.row?.nit} />
            <DinamicTable.Col key="nombre" label="Nombre de Contacto" width={150} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key="telefono" label="Teléfono" width={130} data={(e) => e.row?.telefono} />
            <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
            <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                customComponent={e => <>
                    {(e.row?.key_usuario) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText center color={STheme.color.text}>{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />
        </DinamicTable>
    }

    render() {
        return (
            <SPage title="Gestión de Proveedores" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />

                <FloatButtom onPress={() => {
                    // this.mostrarPopup() 
                    PopupCrearProveedor.open({
                        onSuccess: async () => {
                            this.DinamicTable.loadData();
                        },
                    });

                }} />
            </SPage>
        );
    }


}
