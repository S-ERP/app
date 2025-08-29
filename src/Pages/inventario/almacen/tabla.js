import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
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
        this.state = {
        };
    }
    verificar(estado) {
        return <SView col={"xs-12"} center row>
            {estado ? <SIconApp name='IconCheckedOk' fill='#48bd00ff' stroke={'#c90808ff'} height={16} /> : <SIconApp name='Cerrar' fill='#d6111eff' height={14} />}
        </SView>;
    }
    async loadInitialData() {
        try {
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
            return api;
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
            language="es"
            selectType="single"
            // colors={Config.table.colors()}
            // cellStyle={Config.table.cellStyle()}
            // textStyle={Config.table.textStyle()}
            onSelect={(e) => {
                if (this.onSelect) {
                    this.onSelect(e.row)
                    SNavigation.goBack();
                    return;
                }
                FloatMenu.open({
                    e: e.evt,
                    label: "Almacén: " + e.row?.descripcion,
                    options: [
                        {
                            icon: <SIconApp name='producto' fill='#d1d1cdff' stroke='#8b8b8a25' width={20} />,
                            label: "Ver Productos",
                            onPress: () => {
                                SNavigation.navigate("/inventario/almacen/profile/productos", { pk: e.row?.key })
                            }
                        },
                        {
                            icon: <SIconApp name='carritoproducto' fill='#d1d1cdff' stroke='#8b8b8a25' width={20} />,
                            label: "Ver Recepcion compra",
                            onPress: () => {
                                SNavigation.navigate("/inventario/almacen/profile/recepcion_compra", { pk: e.row?.key })
                            }
                        },
                        {
                            icon: <SIconApp name='Favorito' fill='#ffffff6e' stroke='#d1d1cdff' width={20} />,
                            label: "Ver Pend. de entrega",
                            onPress: () => {
                                SNavigation.navigate("/inventario/almacen/profile/pendiente_entrega", { pk: e.row?.key })
                            }
                        },
                        {
                            icon: <SIconApp name='Favorito' fill='#ffffff6e' stroke='#d1d1cdff' width={20} />,
                            label: "Realizar Conteo de stock",
                            onPress: () => {
                                SNavigation.navigate("/inventario/almacen/profile/registro_inventario", { pk: e.row?.key })
                            }
                        },
                        // {
                        //     icon: <SIconApp name='confirmar' fill='#8b8b8a25' stroke='#8b8b8a' width={16} />,
                        //     label: "Importar Inventario",
                        //     onPress: () => {
                        //         alert("trabjandolo...")
                        //     }
                        // },
                        {
                            icon: <SIconApp name='crmeditar' fill='#8b8b8a25' stroke='#a8a89fff' width={20} />,
                            label: "Editar Almacen",
                            onPress: () => {
                                const sucursal = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                }
                                PopupCrearAlmacen.open({
                                    editObject: sucursal,
                                    key_empresa: sucursal.key_empresa,
                                    onSuccess: async () => {
                                        this.DinamicTable.loadData();
                                    },
                                })
                            }
                        },
                        {
                            icon: <SIconApp name='crmeliminar' fill='#ed3a4318' stroke='#ed3a43' width={20} />,
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
            loadData={this.loadInitialData.bind(this)}
        >
            <DinamicTable.Col key="index" label="#" width={30} data={(e) => e.index + 1} />

            {/* <DinamicTable.Col key="empresa" label="Empresa" width={120} data={(e) => e.row?.key_empresa ?? ""}
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
            /> */}
            <DinamicTable.Col key="sucursal" label="Sucursal" width={120} data={(e) => e.row?.key_sucursal ?? ""}
                customComponent={e => <>
                    {(e.row?.key_sucursal) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            {/* <SView width={10} center   >
                                <SView style={{ borderRadius: 8, width: 8, height: 8, backgroundColor: "#2a7ffe", }} />
                            </SView> */}
                            <SView width={5} />
                            <SText center color={STheme.color.text}>{e.row?.sucursal?.descripcion}</SText>
                        </SView> : null}
                </>}
            />
            <DinamicTable.Col key="almacen" label="Almacén" width={140} data={(e) => e.row?.key ?? ""}
                customComponent={e => <>
                    {(e.row?.key) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 26 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText center color={STheme.color.text}>{e.row?.descripcion}</SText>
                        </SView> : null}
                </>}
            />
            { }
            <DinamicTable.Col key={"is_stock"} label='Con Stock?' width={90} data={(e) => e.row?.is_stock} customComponent={e => this.verificar(e.row?.is_stock)} />
            <DinamicTable.Col key={"is_venta"} label='Para Ventas?' width={90} data={(e) => e.row?.is_venta} customComponent={e => this.verificar(e.row?.is_venta)} />
            <DinamicTable.Col key={"is_entrega"} label='Req. Entrega?' width={90} data={(e) => e.row?.is_entrega} customComponent={e => this.verificar(e.row?.is_entrega)} />
            <DinamicTable.Col key="observacion" label="Observación" width={180} data={(e) => e.row?.observacion} />
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
            <SPage title="Gestión lista de almacenes" disableScroll>
                {this.mostrarTabla()}
                <FloatButtom onPress={() => {
                    PopupCrearAlmacen.open({
                        onSuccess: async () => {
                            this.DinamicTable.loadData();
                        },
                    });
                }} />
            </SPage>
        );
    }
}
