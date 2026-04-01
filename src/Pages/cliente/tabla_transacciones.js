import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import ReciboRollo from '../../Components/PDF/venta/ReciboRollo';
import FechaFullFilter from '../../Components/FechaFullFilter';


export default class tabla_transacciones extends Component {


    async loadInitialData() {
        try {
            const keyEmpresa = await MDL.empresa.select.key;
            const keyCliente = 'e68dffe3-6b6a-4190-8617-5ce2e49c80c1';

            // 1️⃣ Traer ventas
            const ventas = await MDL.compra_venta.execute_function("_get_detalles_bycliente", [keyEmpresa, keyCliente]);

            if (!ventas?.length) {
                throw new Error("No se encontraron detalles para el cliente.");
            }

            // 2️⃣ Traer datos relacionados en paralelo
            const [empresa, cliente, usuarios, almacenes] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.crm.cliente.getByKey(keyCliente),
                MDL.usuario.getByKeys([...new Set(ventas.map(v => v.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen() // ⚠️ Aquí faltaba ()
            ]);

            // 3️⃣ Crear maps para búsquedas rápidas
            const sucursalesMap = Object.fromEntries((empresa.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries(almacenes.map(a => [a.key, a]));

            // 4️⃣ Enriquecer ventas
            const ventasEnriquecidas = ventas.map(v => ({
                ...v,
                moneda: monedasMap[v.key_moneda] || {},
                sucursal: sucursalesMap[v.key_sucursal] || {},
                usuario: usuariosMap[v.key_usuario] || {},
                almacen: almacenesMap[v.key_almacen] || {},
                cliente: cliente || {},
            }));

            console.log("%c" + JSON.stringify(ventasEnriquecidas, null, 2), "color: #2ECC40; font-weight: bold;");

            return ventasEnriquecidas;

        } catch (error) {
            console.error("❌ Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos del cliente. Intenta nuevamente.");
            return [];
        }
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
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />

                <DinamicTable.Col key="sucursal" label="Sucursal" width={180} data={(e) => e.row?.sucursal?.descripcion}
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


                <DinamicTable.Col key="key_almacen" label="Almacén" width={140} data={(e) => e.row?.key_almacen ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_almacen) ?
                            <SView col={"xs-12"} row center  >
                                <SView style={{ width: 26 }}>
                                    <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                        <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.almacen?.key}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                                    </SView>
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.almacen?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />

                <DinamicTable.Col key="fecha_on" label="Fecha" width={110} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />


                <DinamicTable.Col key="descripcion" label="descripcion" width={150} data={(e) => e.row?.descripcion} />
                <DinamicTable.Col key="precio_unitario_base" label="Precio" wrap width={90} data={(e) => (e.row?.precio_unitario_base ? e.row.precio_unitario_base : "0")} cellStyle={{ alignItems: "flex-end" }} format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="cantidad" label="cantidad" width={150} center data={(e) => e.row?.cantidad} />
                <DinamicTable.Col key="subtotal" label="subtotal" wrap width={90} data={(e) => (e.row?.subtotal ? e.row.subtotal : "0")} cellStyle={{ alignItems: "flex-end" }} format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)} />



                <DinamicTable.Col key="tipo" label="tipo" width={150} data={(e) => e.row?.tipo} />
                <DinamicTable.Col key="tipo_pago" label="tipo_pago" width={150} data={(e) => e.row?.tipo_pago} />



                <DinamicTable.Col key="cliente" label="Cliente" width={100} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.cliente?.key) ?
                            <SView col={"xs-12"} center row  >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.cliente?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.cliente?.nombres}</SText>
                            </SView> : null}
                    </>}
                />

                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60}
                    data={(e) => e.row?.moneda?.descripcion ?? ""}

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
            <SPage title="Tabla detalle de las Ventas" disableScroll>

                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}
