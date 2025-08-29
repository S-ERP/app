import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearProveedor from './Components/PopupCrearProveedor';
export default class Lista extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    async loadInitialData() {
        try {
            // siempre poner todas las apis en una funcion asi para que recargue rapido la tabla
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            const keysUsuarios = Object.values(proveedores).map(p => p.key_usuario).filter(Boolean);
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            Object.values(proveedores).forEach(proveedor => {
                proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario);
            });
            return proveedores;
        } catch (error) {
            console.error('Error loading initial data:', error);
            SNotification.send({
                title: "Error",
                body: "No se pudo cargar la lista de proveedores.",
                time: 3000,
                color: STheme.color.danger,
            });
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
                    label: "Proveedor: " + e.row.razon_social,
                    options: [
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Proveedor",
                            onPress: () => {
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
                                    message: "¿Estás seguro de eliminar esta sucursal?",
                                    onPress: () => {
                                        const data = {
                                            ...e.row,
                                            estado: 0,
                                        }
                                        MDL.inventario.proveedor.editar(data).then((resp) => {
                                            this.DinamicTable.loadData();
                                            SNotification.send({
                                                title: "Proveedor Elimninada",
                                                body: "Proveedor se ha Elimninado correctamente.",
                                                time: 3000,
                                                color: STheme.color.success,
                                            });
                                        }).catch((e) => {
                                            console.error("Error al guardar el Proveedor", e);
                                            SNotification.send({
                                                title: "Error",
                                                body: "No se pudo guardar el Proveedor.",
                                                time: 3000,
                                                color: STheme.color.danger,
                                            });
                                        })
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
            <DinamicTable.Col key="key" label="Foto" width={40} data={(e) => `${SSocket.api.inventario}proveedor/${e.row?.key}`}
                customComponent={e => <SView col={"xs-12"} center row  >
                    <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                        <SImage src={`${e.data}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                    </SView>
                </SView>}
            />
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
