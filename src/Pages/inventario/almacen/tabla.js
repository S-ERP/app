import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../../MDL';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import Config from '../../../Config';
import PopupCrearAlmacen from './Components/PopupCrearAlmacen';


export default class tabla extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }




    verificar(estado) {
        return <SView col={"xs-12"} center row>
            {estado ? <SIconApp name='Check' fill='green' stroke={STheme.color.text} height={20} /> : <SIconApp name='Cerrar' fill='red' height={14} />}
        </SView>;
    }


    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            {...Config.table.applyTheme()}
            ref={ref => this.DinamicTable = ref}
            // center
            language="es"
            selectType="single"

            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row)
                    SNavigation.goBack();
                    return;
                }

                FloatMenu.open({
                    e: e.evt,
                    label: "Suc: " + e.row?.sucursal?.descripcion + '-' + e.row?.descripcion,
                    options: [
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Almacen",
                            onPress: () => {
                                const sucursal = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                }

                                PopupCrearAlmacen.open({
                                    editObject: sucursal,
                                    key_empresa: sucursal.key_empresa,
                                    onSuccess: (e) => {

                                    }
                                })
                                // console.log("que actuali " + JSON.stringify(e))
                                this.DinamicTable.loadData();
                                this.forceUpdate();
                                // console.log("se esta editando sucursal " + JSON.stringify(sucursal))


                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Almacen",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar Sucursal",
                                    message: "¿Estás seguro de eliminar esta sucursal?",
                                    onPress: () => {

                                        const data = {
                                            ...e.row,
                                            estado: 0,
                                        }


                                        MDL.inventario.saveAlmacen({ data }).then((resp) => {
                                            this.DinamicTable.loadData();
                                            this.forceUpdate();
                                            SNotification.send({
                                                title: "Almacen Elimninada",
                                                body: "Almacen se ha Elimninado correctamente.",
                                                time: 3000,
                                                color: STheme.color.success,
                                            });
                                        }).catch((e) => {
                                            console.error("Error al guardar la Almacen:", e);
                                            SNotification.send({
                                                title: "Error",
                                                body: "No se pudo guardar la Almacen.",
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

            loadInitialState={async () => {
                return { sorters: [{ key: "fecha_on", order: "asc", type: "date" }] }
            }}

            loadData={async () => {
                const api = await MDL.inventario.getAllAlmacen();

                const keysUsuarios = Object.values(api).map(p => p.key_usuario).filter(Boolean);
                const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
                const sucursales = await MDL.empresa.getAllSucursales();
                const empresa = MDL.empresa.select?.razon_social;

                Object.values(api).forEach(itm => {
                    itm.usuario = usuarios.find(u => u.key === itm.key_usuario);
                    itm.sucursal = sucursales.find(u => u.key === itm.key_sucursal);
                    itm.razon_social = empresa
                });

                console.log("📦 DATA COMPLETA:", api);
                // console.log("todoo el data " + JSON.stringify(api))
                return api;
            }}

        >




            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />

            <DinamicTable.Col key="sucursal" label="Sucursal" width={120} data={(e) => e.row?.key_sucursal ?? ""}
                customComponent={e => <>
                    {(e.row?.key_sucursal) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText center color={STheme.color.text}>{e.row?.sucursal?.descripcion}</SText>
                        </SView> : null}
                </>}
            />

            <DinamicTable.Col key="alma" label="Almacen" width={180} data={(e) => e.row?.key ?? ""}
                customComponent={e => <>
                    {(e.row?.key) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText center color={STheme.color.text}>{e.row?.descripcion}</SText>
                        </SView> : null}
                </>}
            />

            {/* <DinamicTable.Col key="descripcion" label="Almacen" width={100} data={(e) => e.row?.descripcion} /> */}
            <DinamicTable.Col key="observacion" label="Observación" width={180} data={(e) => e.row?.observacion} />
            <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
            <DinamicTable.Col key={"is_stock"} label='Almacen con stock?' width={120} data={(e) => e.row?.is_stock} customComponent={e => this.verificar(e.row?.is_stock)} />
            <DinamicTable.Col key={"is_venta"} label='Almacen para ventas?' width={120} data={(e) => e.row?.is_venta} customComponent={e => this.verificar(e.row?.is_venta)} />
            <DinamicTable.Col key={"is_entrega"} label='Requiere entrega?' width={120} data={(e) => e.row?.is_entrega} customComponent={e => this.verificar(e.row?.is_entrega)} />




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
            <DinamicTable.Col key="empresa" label="Empresa" width={180} data={(e) => e.row?.key_empresa ?? ""}
                customComponent={e => <>
                    {(e.row?.key_empresa) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>

                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}empresa/${e.row?.key_empresa}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText center color={STheme.color.text} style={{ fontSize: 15, textTransform: "capitalize" }} >{e.row?.razon_social}</SText>
                        </SView> : null}
                </>}
            />

        </DinamicTable>
    }

    render() {
        return (
            <SPage title="Gestión lista de almacenes" disableScroll>
                {this.mostrarTabla()}
                <FloatButtom onPress={() => {
                    PopupCrearAlmacen.open({
                        onSuccess: (e) => {
                            console.log("que lastima " + JSON.stringify(e))
                            this.DinamicTable.loadData();
                            this.forceUpdate();
                        }
                    })

                }} />
            </SPage>
        );
    }


}
