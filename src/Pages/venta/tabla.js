import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
const proveedorEjemplo =
{
    "estado": 1,
    "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
    "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
    "fecha_on": "2025-08-28T05:57:21.391",
    "key_cuenta_contable": "",
    "nit": "0",
    "razon_social": "",
    "telefono": "",
    "nombre": "",
    "key": "a314d6c0-872b-4c72-b1a9-167526f52286"
}
const clienteEjemplo = {
    "apellidos": "",
    "descripcion": "",
    "distrito": "",
    "estado": 1,
    "key_usuario": "1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b",
    "lng": "",
    "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
    "fecha_on": "2025-08-30T00:11:41.456",
    "direccion": "",
    "fecha_nacimiento": "",
    "razon_social": "",
    "provincia": "",
    "currier": "",
    "nombres": "SN",
    "correo": "SC",
    "nit": "0",
    "departamento": "",
    "sexo": "",
    "telefono": "",
    "key_servicio": "",
    "key": "1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b",
    "lat": "",
    "imgen": "https://i.pinimg.com/736x/d9/d8/8e/d9d88e3d1f74e2b8ced3df051cecb81d.jpg",
}
export default class tabla extends Component {
    renderUsuario(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.root}usuario/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };
    renderCliente(srcKey) {
        const pintar = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
            <SImage src={`${SSocket.api.crm}cliente/${srcKey}`} style={{ resizeMode: "cover" }} />
        </SView>;
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };
    renderSucursal(srcKey) {
        const pintar = <>
            <SView style={{ width: 60 }}>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={`${SSocket.api.empresa}sucursal/${srcKey}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SText color='red'> sucursal </SText>
            </SView>
        </>
        const nulo = <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", }} />;
        return srcKey ? pintar : nulo;
    };
    async loadInitialData() {
        try {
            console.log('Loading initial data... 🎈🎈🎈🎈');
            // 1. Obtener registros principales
            const registros = await MDL.compra_venta.getTransaccion("venta", "2025-01-01", "2030-09-05");
            if (!registros) return [];
            const empresa = await MDL.empresa.getFull();
            const sucursales = empresa.sucursales
            // 2. Filtrar ventas
            const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
            // 3. Obtener usuarios únicos
            const keysUsuarios = [];
            ventas.forEach(cv => {
                if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                    keysUsuarios.push(cv.key_usuario);
                }
            });
            // 4. Cargar datos relacionados
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            const clientes = await MDL.crm.cliente.getAll();
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios) || {};
            // Normalizar usuarios en objeto { key: usuario }
            const usuariosMap = Array.isArray(usuarios)
                ? Object.fromEntries(usuarios.map(u => [u.key, u]))
                : usuarios;
            // 5. Totales de la primera venta
            const totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: ventas[0].key }) || {};
            // 6. Enriquecer ventas con data relacionada
            const ventasEnriquecidas = await Promise.all(
                ventas.map(async (cv) => {
                    return {
                        ...cv,
                        moneda: empresa.monedas.find(m => m.key === cv.key_moneda) || {},
                        sucursal: sucursales.find(a => a?.key === cv?.key_sucursal) || {},
                        usuario: usuariosMap[cv?.key_usuario] || {},
                        empresa,
                        proveedor: proveedores.find(a => a.key == proveedorEjemplo?.key) || {},
                        cliente: clientes.find(a => a?.key === cv.key_cliente) || {},
                        subtotal: totales?.subtotal || "0",
                        descuento: totales?.descuento || "0",
                    };
                })
            );
            console.log('Initial data loaded successfully! 🎉🎉🎉🎉');
            console.log(ventasEnriquecidas);
            return ventasEnriquecidas;
        } catch (error) {
            console.error('Error in loadData:', error);
            SPopup.alert('Error loading data. Please try again.');
            return [];
        }
    }
    renderState(state) {
        const statesInfo = MDL.compra_venta.getStateInfo()[state];
        return <SView row center>
            <SView backgroundColor={statesInfo?.color} style={{ borderRadius: 4, padding: 5 }}>
                <SText color={STheme.color.text} fontSize={10}>{statesInfo?.label}</SText>
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
    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 8, padding: 6, borderWidth: 1 }}>
                <SText color={STheme.color.text} fontSize={10} bold>{codigo}</SText>
            </SView>
        </SView>
    }
    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
                    return this.loadInitialData();
                }}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: "Tabla de ventas",
                        options: [
                            {
                                label: "Ver venta",
                                icon: <SIconApp name='addTarea' fill="#e4e4e4ff" />,
                                onPress: () => {
                                    SNavigation.navigate("/venta/profile", { pk: e?.row?.key })
                                }
                            },
                            {
                                label: "Imprimir tamaño carta",
                                icon: <SIcon name='imprimir' fill={STheme.color.text}  />,
                                onPress: () => {
                                    ReciboCarta.imprimir(e?.row?.key)
                                }
                            },
                        ]
                    });
                }}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"-keyprofile"} label='Ver' width={40} data={(e) => e.row?.key}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/venta/profile", { pk: e.row.key }) }}>
                        <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                    </SView>} />
                <DinamicTable.Col key={"codigo"} label='Código' width={90} center data={(e) => e?.row?.codigo ?? "AL790"} customComponent={(e) => this.renderCodigo(e.data)} />
                <DinamicTable.Col key="sucursal" label="Sucursal" width={100} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <>
                        {(e.row?.key_sucursal) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.sucursal?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="tipo_pago" label="Tipo Pago" width={80} data={(e) => e.row?.tipo_pago ?? ""} customComponent={(e) => this.renderTipoPago(e?.data)} />
                <DinamicTable.Col key="state" label="Estado" width={80} data={(e) => e.row?.state ?? ""} customComponent={(e) => this.renderState(e?.data)} />
                <DinamicTable.Col key="descripcion" label="Descripción" width={150} data={(e) => e.row?.descripcion ?? ""} />

                <DinamicTable.Col key="estado_pago" wrap label="Estado de Pago" width={80}
                    data={(e) => {
                        if (e.row?.cuotas_en_mora?.monto > 0) {
                            return "En Mora";
                        }
                        if (e.row?.cuotas?.total <= e.row?.monto_amortizado) {
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
                />
                <DinamicTable.Col key="cuotas_cantidad" label="# Cuotas" width={60} cellStyle={{
                    alignItems: "center"
                }} data={(e) => e.row?.cuotas.cantidad ?? ""} />
                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60}
                    data={(e) => e.row?.moneda?.descripcion ?? ""}

                />
                <DinamicTable.Col key="cuotas_total" label="Monto" wrap width={60}
                    data={(e) => ((e.row?.cuotas.total ?? 0) / (e.row.tipo_cambio ?? 1)) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end"
                    }}
                    format={(e) => (e.row?.moneda?.observacion ?? "") + " " + SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col key="cuotas_total_base" wrap label="Monto moneda base" width={60}
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
                />
                <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_usuario) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.usuario?.Nombres}</SText>
                            </SView> : null}
                    </>}
                />
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Tabla Gestión de Ventas" disableScroll>
                { }
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
