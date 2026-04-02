import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter from '../../Components/FechaFullFilter';
import registro from '../registro';

export default class TablaTransacciones extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: {},
            fecha_inicio: null,
            fecha_fin: null,
            moneda: null,
            cliente: null,
        };
        this.key = SNavigation.getParam("key");

    }

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
            const keyCliente = this.key;

            // Traer ventas
            const ventas = await MDL.compra_venta.execute_function("_get_detalles_bycliente", [keyEmpresa, keyCliente]);
            if (!ventas?.length) return [];

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

            // 🔥 CAPTURAR DATOS

            this.setState({
                fecha_fin: ventasEnriquecidas[0]?.fecha_on,
                fecha_inicio: ventasEnriquecidas[ventasEnriquecidas.length - 1]?.fecha_on,
                // fecha_inicio: ventasEnriquecidas[0]?.fecha_on,
                // fecha_fin: ventasEnriquecidas[ventasEnriquecidas.length - 1]?.fecha_on,
                moneda: ventasEnriquecidas[0]?.moneda,
                cliente: cliente || {},
            });


            console.clear();
            console.log("%c" + ventasEnriquecidas[0]?.fecha_on, `color: #2ECC40; font-weight: bold;`);
            console.log("%c" + ventasEnriquecidas[ventasEnriquecidas.length - 1]?.fecha_on, `color: #rgb(231, 35, 1) font-weight: bold;`);
            console.log("%c" + JSON.stringify(ventasEnriquecidas[0]?.moneda, null, 2), "color: #2ECC40; font-weight: bold;");
            console.log("%c" + JSON.stringify(cliente, null, 2), "color: #2ECC40; font-weight: bold;");
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
                <DinamicTable.Col key="fecha" label="Fecha" width={140} data={e => new SDate(e.row?.fecha_on).toString("dd/MM/yyyy")} />
                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e.row?.tipo} />
                <DinamicTable.Col key="detalle" label="Detalle" width={200} data={(e) => e.row?.descripcion} />


                <DinamicTable.Col key="precio_unitario_base" label="Precio" width={90} wrap data={(e) => e.row?.precio_unitario_base ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col key="cantidad" label="Cantidad" width={80} center data={(e) => e.row?.cantidad} />

                <DinamicTable.Col key="subtotal" label="Subtotal" width={90} wrap data={(e) => e.row?.subtotal ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col key="debe" label="Debe" width={100}
                    data={(e) => e.row?.subtotal || 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col key="haber" label="Haber" width={100}
                    data={(e) => 0}
                    cellStyle={{ alignItems: "flex-end" }}
                // format={(e) => SMath.formatMoney(e.data)||"d"}
                />

                <DinamicTable.Col key="saldo" label="Saldo" width={120}
                    data={(e) => e.row?.subtotal || 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => SMath.formatMoney(e.data)}
                />

                {/* <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <this.RowWithImage
                        keyEntity={e.row?.key_usuario}
                        label={e.row?.usuario?.Nombres}
                        srcPrefix={`${SSocket.api.root}usuario/`}
                        styleText={e.textStyle}
                    />}
                /> */}

            </DinamicTable>
        );
    }

    render() {
        const __cliente = this.state.cliente || {};
        const __moneda = this.state.moneda || {};
        const __fecha_inicio = this.state.fecha_inicio ? new SDate(this.state.fecha_inicio).toString("dd-MONTH-yyyy") : "";
        const __fecha_fin = this.state.fecha_fin ? new SDate(this.state.fecha_fin).toString("dd-MONTH-yyyy") : "";
        return (
            <SPage title="Kardex Individual" disableScroll>

                <SView row col={"xs-12"}>
                    <SView col={"xs-12  "} row center   >
                        <SView col={"xs-12 sm-5"} center   >
                            {/* <SText color={STheme.color.text} fontSize={18} >Kardex Individual</SText> */}
                            <SHr height={12} />
                            <SText color={STheme.color.text} fontSize={15} >Del {__fecha_inicio} al {__fecha_fin}</SText>
                            <SText color={STheme.color.text} fontSize={15} >Expresando en {__moneda?.observacion}</SText>
                        </SView>
                    </SView>

                    <SHr height={10} />

                    <SView col={"xs-12"} row>
                        <SText color={STheme.color.text} fontSize={15} >Cliente: {__cliente?.nombres}</SText>
                    </SView>
                </SView>
                <SHr height={10} />
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}