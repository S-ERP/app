import React, { Component } from 'react';
// import { ¡'SPage, SPopup, SView, SText, STheme, SHr, SImage, SDate, SMath } from 'servisofts-component';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import Config from '../../Config';
import MDL from '../../MDL';

export default class TablaTransacciones extends Component {

    // Componente auxiliar para mostrar fila con imagen + texto
    RowWithImage = ({ keyEntity, label, srcPrefix, styleText }) => {
        if (!keyEntity) return null;
        return (
            <SView col={"xs-12"} center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={`${srcPrefix}${keyEntity}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={styleText}>{label}</SText>
            </SView>
        );
    }

    // Función para cargar los datos iniciales
    async loadInitialData() {
        try {
            const keyEmpresa = await MDL.empresa.select.key;
            const keyCliente = 'e68dffe3-6b6a-4190-8617-5ce2e49c80c1';

            // Traer ventas
            const ventas = await MDL.compra_venta.execute_function("_get_detalles_bycliente", [keyEmpresa, keyCliente]);
            if (!ventas?.length) throw new Error("No se encontraron detalles para el cliente.");

            // Traer datos relacionados en paralelo
            const [empresa, cliente, usuarios, almacenes] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.crm.cliente.getByKey(keyCliente),
                MDL.usuario.getByKeys([...new Set(ventas.map(v => v.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen(),
            ]);

            // Crear mapas para búsquedas rápidas
            const sucursalesMap = Object.fromEntries((empresa.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries(almacenes.map(a => [a.key, a]));

            // Enriquecer ventas
            const ventasEnriquecidas = ventas.map(v => ({
                ...v,
                moneda: monedasMap[v.key_moneda] || {},
                sucursal: sucursalesMap[v.key_sucursal] || {},
                usuario: usuariosMap[v.key_usuario] || {},
                almacen: almacenesMap[v.key_almacen] || {},
                cliente: cliente || {},
            }));

            console.log("%cVENTAS ENRIQUECIDAS:", "color: #2ECC40; font-weight: bold;", ventasEnriquecidas);
            return ventasEnriquecidas;

        } catch (error) {
            console.error("❌ Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos del cliente. Intenta nuevamente.");
            return [];
        }
    }

    // Mostrar la tabla de transacciones
    mostrarTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={this.loadInitialData.bind(this)}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e.key}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />

                <DinamicTable.Col key="sucursal" label="Sucursal" width={180} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <this.RowWithImage 
                        keyEntity={e.row?.key_sucursal} 
                        label={e.row?.sucursal?.descripcion} 
                        srcPrefix={`${SSocket.api.empresa}sucursal/`} 
                        styleText={e.textStyle} 
                    />}
                />

                <DinamicTable.Col key="almacen" label="Almacén" width={140} data={(e) => e.row?.almacen?.descripcion ?? ""}
                    customComponent={e => <this.RowWithImage 
                        keyEntity={e.row?.almacen?.key} 
                        label={e.row?.almacen?.descripcion} 
                        srcPrefix={`${SSocket.api.empresa}sucursal/`} 
                        styleText={e.textStyle} 
                    />}
                />

                <DinamicTable.Col key="fecha_on" label="Fecha" width={120} dataType="date"
                    data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} 
                    textStyle={{ fontSize: 12, color: STheme.color.text }} 
                    dateFormat="yyyy-MM-dd hh:mm"
                />

                <DinamicTable.Col key="descripcion" label="Descripción" width={150} data={(e) => e.row?.descripcion} />

                <DinamicTable.Col key="precio_unitario_base" label="Precio" width={90} wrap data={(e) => e.row?.precio_unitario_base ?? 0} 
                    cellStyle={{ alignItems: "flex-end" }} 
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)} 
                />

                <DinamicTable.Col key="cantidad" label="Cantidad" width={80} center data={(e) => e.row?.cantidad} />

                <DinamicTable.Col key="subtotal" label="Subtotal" width={90} wrap data={(e) => e.row?.subtotal ?? 0} 
                    cellStyle={{ alignItems: "flex-end" }} 
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)} 
                />

                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e.row?.tipo} />
                <DinamicTable.Col key="tipo_pago" label="Tipo de Pago" width={120} data={(e) => e.row?.tipo_pago} />

                <DinamicTable.Col key="cliente" label="Cliente" width={120} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <this.RowWithImage 
                        keyEntity={e.row?.cliente?.key} 
                        label={e.row?.cliente?.nombres} 
                        srcPrefix={`${SSocket.api.root}usuario/`} 
                        styleText={e.textStyle} 
                    />}
                />

                <DinamicTable.Col key="moneda" label="Moneda" width={60} wrap data={(e) => e.row?.moneda?.descripcion ?? ""} />

                <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <this.RowWithImage 
                        keyEntity={e.row?.key_usuario} 
                        label={e.row?.usuario?.Nombres} 
                        srcPrefix={`${SSocket.api.root}usuario/`} 
                        styleText={e.textStyle} 
                    />}
                />

            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Detalle de Ventas" disableScroll>
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}