import React, { Component } from 'react';
// import { ¡'SPage, SPopup, SView, SText, STheme, SHr, SImage, SDate, SMath } from 'servisofts-component';
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
            allArticulos: []
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

            // debo capturar le fecha del primer registro
            // debo capturar le fecha del ultimo registro
            // debo capturar le moneda como this.moneda
            // debo capturar el cliente como this.cliente

            this.cliente = cliente || {};

            console.clear();
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

                {/* <DinamicTable.Col key="sucursal" label="Sucursal" width={180} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <this.RowWithImage
                        keyEntity={e.row?.key_sucursal}
                        label={e.row?.sucursal?.descripcion}
                        srcPrefix={`${SSocket.api.empresa}sucursal/`}
                        styleText={e.textStyle}
                    />}
                /> */}

                {/* <DinamicTable.Col key="almacen" label="Almacén" width={140} data={(e) => e.row?.almacen?.descripcion ?? ""}
                    customComponent={e => <this.RowWithImage
                        keyEntity={e.row?.almacen?.key}
                        label={e.row?.almacen?.descripcion}
                        srcPrefix={`${SSocket.api.empresa}sucursal/`}
                        styleText={e.textStyle}
                    />}
                /> */}

                <DinamicTable.Col key="fecha_on" label="Fecha" width={120} dataType="date"
                    data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm"
                />
                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e.row?.tipo} />

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

                {/* <DinamicTable.Col key="tipo_pago" label="Tipo de Pago" width={120} data={(e) => e.row?.tipo_pago} /> */}

                {/* <DinamicTable.Col key="cliente" label="Cliente" width={120} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <this.RowWithImage
                        keyEntity={e.row?.cliente?.key}
                        label={e.row?.cliente?.nombres}
                        srcPrefix={`${SSocket.api.root}usuario/`}
                        styleText={e.textStyle}
                    />}
                /> */}

                {/* <DinamicTable.Col key="moneda" label="Moneda" width={60} wrap data={(e) => e.row?.moneda?.descripcion ?? ""} /> */}

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

        const __cliente = this.cliente || {};
        const __moneda = this.moneda || {
            "descripcion": "Boliviano",
            "estado": 1,
            "tipo": "base",
            "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",
            "key_empresa": "f894ea35-5ad1-4b61-a2d0-9294965be169",
            "fecha_on": "2025-09-05T23:19:05.000589",
            "tipo_cambio": 1,
            "key": "2f6b73df-8004-41c1-aa5f-1a81d79d1a8f",
            "observacion": "BOB"
        };
        const __fecha_inicio = "01/Enero/2029";
        const __fecha_fin = "01/Abril/2029";

        return (
            <SPage title="Kardex Individual" disableScroll>
                <SView row col={"xs-12"} style={{ paddingBottom: 8, paddingLeft: 8, borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", }}>
                    <SView width={8} height={"100%"} />
                    <SView col={"xs-12  "} row center backgroundColor="#e40000"   >
                        <SView col={"xs-12 sm-5"} backgroundColor="#fff" center   >
                            {/* Del capturo la fecha de su primer registro y ultimo */}
                            {/* {this.moneda.descripcion} */}
                            <SText color='blue' fontSize={15} >Del {__fecha_inicio} al {__fecha_fin}</SText>
                            <SText color='blue' fontSize={15} >Expresando en {__moneda?.observacion}</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-12"} row backgroundColor="#26e400"   >
                        {/* Del capturo la fecha de su primer registro y ultimo */}
                        {/* {this.moneda.descripcion} */}
                        <SText color='blue' fontSize={15} >Cliente :{__cliente?.nombres}</SText>
                    </SView>
                </SView>
                <SHr height={50} />

                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}