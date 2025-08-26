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


export default class tabla extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }


    // modelos = null;

    async loadDatasd() {
        if (this.key_conteoxxx) {
            const modelosByContador = await MDL.inventario.getAll_reporte_conteo_inventario_detallado();
            this.modelos = modelosByContador;
        } else {
            const modelos = await MDL.inventario.getAllModeloStock(this.key_almacen);
            this.modelos = modelos;
        }
        return this.modelos;
    }


    verificar(estado) {

        return <SView col={"xs-12"} center row  >
            {estado ? <SIconApp name='Check' fill='green' height={20} /> : <SIconApp name='Cerrar' fill='red' height={14} />}
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
                    label: "Sucursal: " + e.row.descripcion,
                    options: [
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Sucursal",
                            onPress: () => {
                                // let ubicacion = { lat: null, lng: null };
                                // try {
                                //     ubicacion = await this.obtenerUbicacion();
                                // } catch (error) {
                                //     console.warn("No se pudo obtener la ubicación:", error.message);
                                // }
                                const sucursal = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                }

                                console.log("se esta editando sucursal " + JSON.stringify(sucursal))

                                // PopupCrearSucursal.open({
                                //     editObject: sucursal,
                                //     key_empresa: e.row.key_empresa,
                                //     onSuccess: (e) => {
                                //         this.DinamicTable.loadData();
                                //     }
                                // })
                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Sucursal",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar Sucursal",
                                    message: "¿Estás seguro de eliminar esta sucursal?",
                                    onPress: () => {
                                        // const sucursal_ = {
                                        //     ...e.row,
                                        //     estado: 0,
                                        // }
                                        // SSocket.sendPromise({
                                        //     service: "empresa",
                                        //     component: "sucursal",
                                        //     type: "editar",
                                        //     data: sucursal_,
                                        //     key_usuario: MDL.usuario.session?.key,
                                        // }).then(e => {
                                        //     this.DinamicTable.loadData();
                                        // }).catch(e => {
                                        //     console.error("response", e);
                                        // })

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




                console.log("todoo el data " + JSON.stringify(api))
                return api;
            }}

        >




            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />

            <DinamicTable.Col key="sucursal" label="Sucursal" width={120} data={(e) => e.row?.key_sucursal ?? ""}
                customComponent={e => <>
                    {(e.row?.key_sucursal) ?
                        <SView col={"xs-12"} center row  >
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                            </SView>
                            <SView width={5} />
                            <SText color={STheme.color.text}>{e.row?.sucursal?.descripcion}</SText>
                        </SView> : null}
                </>}
            />

            <DinamicTable.Col key="descripcion" label="Almacen" width={90} data={(e) => e.row?.descripcion} />
            <DinamicTable.Col key="observacion" label="Observación" width={120} data={(e) => e.row?.observacion} />
            <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />


            <DinamicTable.Col key={"is_venta"} label='Almacen para ventas?' width={120} data={(e) => e.row.is_venta} customComponent={e => this.verificar(e.row?.is_venta)} />
            <DinamicTable.Col key={"is_entrega"} label='Requiere entrega?' width={120} data={(e) => e.row.is_entrega} customComponent={e => this.verificar(e.row?.is_entrega)} />
            <DinamicTable.Col key={"is_stock"} label='Almacen con stock?' width={120} data={(e) => e.row.is_stock} customComponent={e => this.verificar(e.row?.is_stock)} />


            {/* <DinamicTable.Col key={"estado"} label='Estado' width={120} data={(e) => e.row.estado} customComponent={e => this.verificar(e.row?.estado)} /> */}


            <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                customComponent={e => <>
                    {(e.row?.key_usuario) ?
                        <SView col={"xs-12"} center row  >
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                            </SView>
                            <SView width={5} />
                            <SText color={STheme.color.text}>{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />
            <DinamicTable.Col key="empresa" label="Empresa" width={150} data={(e) => e.row?.key_empresa ?? ""}
                customComponent={e => <>
                    {(e.row?.key_empresa) ?
                        <SView col={"xs-12"} center row  >
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SImage src={`${SSocket.api.empresa}empresa/${e.row?.key_empresa}`} style={{ resizeMode: "cover" }} />
                            </SView>
                            <SView width={5} />
                            <SText color={STheme.color.text}>{e.row?.razon_social}</SText>
                        </SView> : null}
                </>}
            />

        </DinamicTable>
    }

    render() {
        return (
            <SPage title="Gestión de Sucursales" disableScroll>
                {this.mostrarTabla()}
                <FloatButtom onPress={() => {
                    // PopupCrearSucursal.open({
                    //     key_empresa: MDL.empresa.select?.key,
                    //     onSuccess: (e) => {
                    //         this.DinamicTable.loadData();
                    //     }
                    // })
                }} />
            </SPage>
        );
    }


}
