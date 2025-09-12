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
import PopupPagarDeuda from './Components/PopupPagoCuota';
import proveedor from '.';
import PopupPagoCuota from './Components/PopupPagoCuota';
const ejemploProveedor = [
    {
        "key": "15843bf1-0ee2-467d-8052-aa394d2cf477",
        "razon_social": "CBN",
        "nit": "12345678",
        "nombre": "Juan Pérez",
        "telefono": "+591 76543210",
        "estado": 1,
        "key_usuario": "11111111-aaaa-bbbb-cccc-111111111111",
        "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
        "fecha_on": "2025-09-01T09:15:30.000",
        "usuario": { "Nombres": "Ricardo" },
        "compras": [{ "descripcion": "Compra rápida de insumos", "state": "mora", "cuotas": { "total": 720, "cantidad": 6 } }]
    },
    {
        "key": "25843bf1-0ee2-467d-8052-aa394d2cf411",
        "razon_social": "Tech Import",
        "nit": "87654321",
        "nombre": "María García",
        "telefono": "+591 78912345",
        "estado": 1,
        "key_usuario": "22222222-aaaa-bbbb-cccc-222222222222",
        "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
        "fecha_on": "2025-08-20T13:47:11.000",
        "usuario": { "Nombres": "Ana" },
        "compras": [{ "descripcion": "Compra de laptops", "state": "mora", "cuotas": { "total": 3600, "cantidad": 6 } }]
    },
    {
        "key": "35843bf1-0ee2-467d-8052-aa394d2cf422",
        "razon_social": "Distribuidora Santa Cruz",
        "nit": "99887766",
        "nombre": "Carlos López",
        "telefono": "+591 70011223",
        "estado": 1,
        "key_usuario": "33333333-aaaa-bbbb-cccc-333333333333",
        "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
        "fecha_on": "2025-09-03T07:27:50.000",
        "usuario": { "Nombres": "Luis" },
        "compras": [{ "descripcion": "Compra de bebidas", "state": "mora", "cuotas": { "total": 900, "cantidad": 6 } }]
    },
    {
        "key": "45843bf1-0ee2-467d-8052-aa394d2cf433",
        "razon_social": "OfiMuebles SRL",
        "nit": "44556677",
        "nombre": "Lucía Fernández",
        "telefono": "+591 76500011",
        "estado": 1,
        "key_usuario": "44444444-aaaa-bbbb-cccc-444444444444",
        "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
        "fecha_on": "2025-07-25T10:00:00.000",
        "usuario": { "Nombres": "Marcos" },
        "compras": [{ "descripcion": "Compra de muebles de oficina", "state": "mora", "cuotas": { "total": 6000, "cantidad": 6 } }]
    },
    {
        "key": "55843bf1-0ee2-467d-8052-aa394d2cf444",
        "razon_social": "AutoRepuestos Bolivia",
        "nit": "22334455",
        "nombre": "Miguel Torres",
        "telefono": "+591 78889999",
        "estado": 1,
        "key_usuario": "55555555-aaaa-bbbb-cccc-555555555555",
        "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
        "fecha_on": "2025-09-02T15:45:00.000",
        "usuario": { "Nombres": "José" },
        "compras": [{ "descripcion": "Compra de repuestos automotrices", "state": "mora", "cuotas": { "total": 2400, "cantidad": 6 } }]
    }
];
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
                .filter(Boolean); // Filtra valores nulos o undefined
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
            const proveedoresConCompras = Object.values(proveedores).map(proveedor => {
                proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario) || null;
                proveedor.compras = transacciones
                    ? transacciones.filter(transaccion => transaccion.key_proveedor === proveedor.key)
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
                            icon: <SIconApp name='addUser' />,
                            label: "Pagar Deuda",
                            onPress: () => {
                                const proveedor = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                }
                                PopupPagoCuota.open({
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
            <DinamicTable.Col key="compras" label="compras" width={50} data={(e) => e.row?.compras.length} />
            <DinamicTable.Col key="comprassdf" label="compdsaras" width={50} data={(e) => e.row?.compras?.cuotas_en_mora?.monto} />
            { }
            { }
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
            {/* <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
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
            /> */}


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

            <DinamicTable.Col key="pagos" label="Pagos" width={50} data={(e) => e.row?.compras?.length}
                customComponent={e => <>
                    {(e.row?.compras?.length > 0) ?
                        <SView style={{ width: 28 }} center
                            onPress={() => {
                                SNavigation.navigate("/proveedor/pagos", { key_proveedor: e.row?.key })
                            }}
                        >
                            <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                <SIconApp name='Carrito' width={24} />
                            </SView>
                        </SView>
                        : null}
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
