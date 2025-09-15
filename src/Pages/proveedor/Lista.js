import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom, SMath } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearProveedor from './Components/PopupCrearProveedor';
// import PopupPagarDeuda from './Components/PopupPagoCuota';
// import proveedor from '.';
// import PopupPagoCuota from './Components/PopupPagoCuota';

export default class Lista extends Component {
    onSelect = SNavigation.getParam("onSelect");
    constructor(props) {
        super(props);
        this.state = {};
    }

    async loadInitialData() {
        try {
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            if (!proveedores || Object.keys(proveedores).length === 0) {
                SNotification.send({
                    title: "Advertencia",
                    body: "No se encontraron proveedores.",
                    time: 3000,
                    color: STheme.color.warning,
                });
                return [];
            }

            const keysUsuarios = Object.values(proveedores)
                .map(p => p.key_usuario)
                .filter(Boolean);

            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            if (!usuarios || Object.keys(usuarios).length === 0) {
                console.warn("No se encontraron usuarios para los proveedores.");
            }

            const transacciones = await MDL.compra_venta.getTransaccion("compra", "2024-09-01", "2026-09-05");
            if (!transacciones || transacciones.length === 0) {
                SNotification.send({
                    title: "Advertencia",
                    body: "No se encontraron compras en el rango de fechas especificado.",
                    time: 3000,
                    color: STheme.color.warning,
                });
            }

            const registros = await MDL.compra_venta.getCuotasResumenTotal();

            const proveedoresConCompras = Object.values(proveedores).map(proveedor => {
                // Asignar usuario
                proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario) || null;

                // Asignar resumen de cuotas correspondiente
                proveedor.resumen_cuota = registros.find(r => r.key_proveedor === proveedor.key) || null;

                // Filtrar transacciones del proveedor
                proveedor.compras = transacciones
                    ? transacciones.filter(t => t.key_proveedor === proveedor.key)
                    : [];

                console.log("Compras para proveedor", proveedor);
                return proveedor;
            });

            return proveedoresConCompras;

        } catch (error) {
            console.error('Error loading initial data:', error);
            SNotification.send({
                title: "Error",
                body: "No se pudo cargar la lista de proveedores y sus compras.",
                time: 3000,
                color: STheme.color.danger,
            });
            return [];
        }
    }


    renderState(state) {
        var statesInfo = Model.compra_venta.Action.getStateInfo()[state];
        return <SView row center>
            <SView backgroundColor={statesInfo.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesInfo.label}</SText>
            </SView>
        </SView>
    }
    renderTipoPago(values) {
        const statesTipo = MDL.compra_venta.getTipoPago()[values];
        return <SView row center>
            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
            </SView>
        </SView>
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
                            ...e.row.compras.length > 0 ? {
                                icon: <SIconApp name='addUser' />,
                                label: "Pagar Deuda",
                                onPress: () => {
                                    SNavigation.navigate("/caja/cuotas", { key_proveedor: e.row?.key })
                                }
                            } : null
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
            }
            }
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
            <DinamicTable.Col key="compras" label="compras" width={50} data={(e) => e.row?.compras.length} />

            {/* <DinamicTable.Col key="admiadasdn" label="asssssss" width={120} data={(e) => e.row?.compras.length  ?? ""}
                customComponent={e => <>
                    {(e.row?.key_usuario) ?
                        <SView col={"xs-12"} row  >
                            <SText center color={STheme.color.text}>{e.row?.compras}</SText>
                        </SView> : null}
                </>}
            /> */}
            {/* <DinamicTable.Col key="estado_pago" wrap label="Estado de Pago" width={80}
                data={(e) => {
                    if (e.row?.compras?.cuotas_en_mora?.monto > 0) {
                        return "En Mora";
                    }
                    if (e.row?.compras?.cuotas?.total <= e.row?.compras?.monto_amortizado) {
                        return "Pagado";
                    }
                    return "Al Día";
                }}
                customComponent={(e) => {
                    const statesTipo = {
                        "Al Día": { color: STheme.color.warning, label: "Al Día" },
                        "En Mora": { color: STheme.color.danger, label: "En Mora" },
                        "Pagado": { color: STheme.color.success, label: "Pagado" },
                    }[e.data] || {};
                    return <SView row center>
                        <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                            <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
                        </SView>
                    </SView>
                }}
            /> */}
            {/* <DinamicTable.Col key="cuotas_cantidad" label="# Cuotas" width={60} cellStyle={{
                    alignItems: "center"
                }} data={(e) => e.row?.cuotas.cantidad ?? ""} /> */}
            {/* <DinamicTable.Col key="cuotas_total" label="Monto" width={60}
                    data={(e) => e.row?.cuotas.total ?? ""}
                    cellStyle={{
                        alignItems: "flex-end"
                    }}
                    format={(e) => SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col key="monto_amortizado" wrap label="Monto Pagado" width={60} data={(e) => e.row?.monto_amortizado ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.success + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="monto_deuda" wrap label="Deuda total" width={60}
                    data={(e) => (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.warning + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Cuotas en Mora" width={60} cellStyle={{
                    alignItems: "center",
                    backgroundColor: STheme.color.danger + "33"
                }}
                    data={(e) => e.row?.cuotas_en_mora.cantidad ?? ""}
                />
                <DinamicTable.Col wrap key="en_mora" label="Monto en Mora" width={60} data={(e) => e.row?.cuotas_en_mora.monto ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.danger + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                /> */}
            <DinamicTable.Col key="nit" label="NIT" width={150} data={(e) => e.row?.nit} />
            <DinamicTable.Col key="nombre" label="Nombre de Contacto" width={150} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key="telefono" label="Teléfono" width={130} data={(e) => e.row?.telefono} />
            <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
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
                            <SText center color={STheme.color.lightGray} fontSize={12} >{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />

            {/* cuotas total
cuotas cantidad


cuotas_en_mora total
cuotas_en_mora cantidad


cuotas_amortizado	total				    
cuotas_amortizado	cantidad				     */}


            {/* <DinamicTable.Col key="cuotas_total_base" wrap label="Monto moneda base" width={60}
                data={(e) => e.row?.cuotas.total ?? ""}
                cellStyle={{
                    alignItems: "flex-end"
                }}
                format={(e) => SMath.formatMoney(e.data)}
            /> */}


            <DinamicTable.Col key="monto_amortizado" wrap label="Monto Pagado" width={60} data={(e) => e.row?.resumen_cuota?.monto_pagado ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.success + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
     
            <DinamicTable.Col key="monto_amortizasdo" wrap label="Cuota Pagado" width={60} data={(e) => e.row?.resumen_cuota?.cantidad_pagada ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.success + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
           
           
            <DinamicTable.Col key="monto_amortisdfzasdo" wrap label="Motno Mora" width={60} data={(e) => e.row?.resumen_cuota?.monto_en_mora ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.danger + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
       
            <DinamicTable.Col key="monto_amortisdasfzasdo" wrap label="Canti Mora" width={60} data={(e) => e.row?.resumen_cuota?.cantidad_en_mora ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.danger + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
      
            <DinamicTable.Col key="monto_aamortisdaasfzasdo" wrap label="Canti Pen" width={60} data={(e) => e.row?.resumen_cuota?.cantidad_pendiente ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.warning + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
   
            <DinamicTable.Col key="monto_amortisdaasfzasdo" wrap label="monto Pen" width={60} data={(e) => e.row?.resumen_cuota?.monto_pendiente ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.warning + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />

            {/* <DinamicTable.Col key="monto_amortizado" wrap label="Monto Pagado" width={60} data={(e) => e.row?.monto_amortizado ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.success + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />


            <DinamicTable.Col key="monto_deuda" wrap label="Deuda total" width={60}
                data={(e) => (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0) ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.warning + "33"
                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />

            <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Cuotas en Mora" width={60} cellStyle={{
                alignItems: "center",
                backgroundColor: STheme.color.danger + "33"
            }}
                data={(e) => e.row?.cuotas_en_mora.cantidad ?? ""}
            />
            <DinamicTable.Col wrap key="en_mora" label="Monto en Mora" width={60} data={(e) => e.row?.cuotas_en_mora.monto ?? ""}
                cellStyle={{
                    alignItems: "flex-end",
                    backgroundColor: STheme.color.danger + "33"

                }}
                format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
            /> */}

            <DinamicTable.Col key="pagos" label="Pagos" width={50} data={(e) => e.row?.compras?.length}
                customComponent={e => <>
                    {(e.row?.compras?.length > 0) ?
                        <SView style={{ width: 28 }} center
                            onPress={() => {
                                SNavigation.navigate("/caja/cuotas", { key_proveedor: e.row?.key })
                            }}
                        >
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SIconApp name='Carrito' width={24} />
                            </SView>
                        </SView>
                        : null}
                </>}
            />

        </DinamicTable >
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
