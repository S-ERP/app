import React, { Component } from 'react';
// import { SPage, SPopup, SView, SText, STheme, SHr, SDate, SMath } from 'servisofts-component';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification } from 'servisofts-component';
import SSocket from 'servisofts-socket';

import { DinamicTable } from 'servisofts-table';
// import SNavigation from 'servisofts-component/SNavigation';
import Config from '../../Config';
import MDL from '../../MDL';

export default class TablaTransacciones extends Component {

    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: null,
            fecha_fin: null,
            moneda: null,
            cliente: null,
            ventasEnriquecidas: null,
        };
        this.key = SNavigation.getParam("key");
    }

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

    async loadInitialData() {
        try {
            const keyEmpresa = await MDL?.empresa?.select?.key;
            const keyCliente = this.key;

            if (!keyEmpresa || !keyCliente) return [];

            const ventas = await MDL.compra_venta.execute_function("_get_detalles_bycliente", [keyEmpresa, keyCliente]);

            if (!ventas || ventas.length === 0) return [];

            const [empresa, cliente, usuarios = [], almacenes = []] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.crm.cliente.getByKey(keyCliente),
                MDL.usuario.getByKeys([...new Set(ventas.map(v => v?.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen(),
            ]);

            const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));

            const ventasEnriquecidas = ventas.map(v => ({
                ...v,
                moneda: monedasMap[v?.key_moneda] || {},
                sucursal: sucursalesMap[v?.key_sucursal] || {},
                usuario: usuariosMap[v?.key_usuario] || {},
                almacen: almacenesMap[v?.key_almacen] || {},
                cliente: cliente || {},
            }));

            // Validaciones seguras
            const first = ventasEnriquecidas[0];
            const last = ventasEnriquecidas[ventasEnriquecidas.length - 1];

            this.setState({
                fecha_inicio: last?.fecha_on || null,
                fecha_fin: first?.fecha_on || null,
                moneda: first?.moneda || null,
                cliente: cliente || {},
                ventasEnriquecidas: ventasEnriquecidas || {},
            });


            console.clear();
            console.log("%c" + JSON.stringify(first, null, 2), "color: #2ECC40; font-weight: bold;");
            console.log("%c" + JSON.stringify(last, null, 2), "color: #eeff00; font-weight: bold;");
            // console.log("%c" + first, `color: #2ECC40; font-weight: bold;`);
            // console.log("%c" + last, `color: #d87b11; font-weight: bold;`);
            // console.log("%c" + ventasEnriquecidas[ventasEnriquecidas.length - 1]?.fecha_on, `color: #rgb(231, 35, 1) font-weight: bold;`);
            // console.log("%c" + JSON.stringify(cliente, null, 2), "color: #2ECC40; font-weight: bold;");
            // console.log("%cVENTAS ENRIQUECIDAS:", "color: #2ECC40; font-weight: bold;", ventasEnriquecidas);



            return ventasEnriquecidas;

        } catch (error) {
            console.error("Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos.");
            return [];
        }
    }

    mostrarTabla() {
        const { ventasEnriquecidas } = this.state;

        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={this.loadInitialData.bind(this)}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e?.key}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => (e?.index ?? 0) + 1} />
                <DinamicTable.Col key="fecha" label="Fecha" width={140} data={e => e?.row?.fecha_on ? new SDate(e.row.fecha_on).toString("dd/MM/yyyy") : ""} />
                {/* <DinamicTable.Col key="sucursal" label="Sucursal" width={180} data={(e) => e.row?.sucursal?.descripcion}
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
                /> */}
                {/* <DinamicTable.Col key="tipo_pago" label="Tipo de Pago" width={120} data={(e) => e.row?.tipo_pago} /> */}

                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e?.row?.tipo || "-"} />
                <DinamicTable.Col key="detalle" label="Detalle" width={200} data={(e) => e?.row?.descripcion || "-"} />

                <DinamicTable.Col
                    key="precio_unitario_base"
                    label="Precio"
                    width={90}
                    data={(e) => e?.row?.precio_unitario_base ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => `${e?.row?.moneda?.observacion || ""} ${SMath.formatMoney(e.data || 0)}`}
                />

                <DinamicTable.Col
                    key="cantidad"
                    label="Cantidad"
                    width={80}
                    center
                    data={(e) => e?.row?.cantidad ?? 0}
                    footerComponent={() => (
                        <SView style={{ alignItems: "center" }}>
                            <SText bold>Total</SText>
                        </SView>
                    )}
                />

                <DinamicTable.Col
                    key="subtotal"
                    label="Subtotal"
                    width={90}
                    data={(e) => e?.row?.subtotal ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => `${e?.row?.moneda?.observacion || ""} ${SMath.formatMoney(e.data || 0)}`}
                    footerComponent={() => (
                        <SView style={{ alignItems: "center" }}>
                            <SText bold>Total Ofi</SText>
                        </SView>
                    )}
                />

  
                <DinamicTable.Col
                    key="debe"
                    label="Debe"
                    width={100}
                    data={(e) => e?.row?.subtotal ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.data ? SMath.formatMoney(e.data) : "0"}

                    footerComponent={() => {

                        const data = ventasEnriquecidas|| [];
                        console.log("%c" + JSON.stringify(data, null, 2), "color: #2ECC40; font-weight: bold;");
                        const total = data.reduce((acc, row) => {
                            return acc + (row?.subtotal || 0);
                        }, 0);


                        return (
                            <SView style={{ alignItems: "flex-end", paddingRight: 8 }}>
                                <SText bold>

                                    {`${SMath.formatMoney(total || 0)}` }
                                </SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="haber"
                    label="Haber"
                    width={100}
                    data={() => 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.data ? SMath.formatMoney(e.data) : "0"}
                />

                <DinamicTable.Col
                    key="saldo"
                    label="Saldo"
                    width={120}
                    data={(e) => e?.row?.subtotal ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => `${e?.row?.moneda?.observacion || ""} ${SMath.formatMoney(e.data || 0)}`}
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
        const { cliente, moneda, fecha_inicio, fecha_fin } = this.state;
        const fi = fecha_inicio ? new SDate(fecha_inicio).toString("dd-MONTH-yyyy") : "-";
        const ff = fecha_fin ? new SDate(fecha_fin).toString("dd-MONTH-yyyy") : "-";

        return (
            <SPage title="Kardex Individual" disableScroll>

                <SView row col={"xs-12"}>
                    <SView col={"xs-12"} center>
                        <SHr height={12} />
                        <SText fontSize={15}>Del {fi} al {ff}</SText>
                        <SText fontSize={15}>Expresando en {moneda?.observacion || "-"}</SText>
                    </SView>

                    <SHr height={10} />

                    <SView col={"xs-12"} row>
                        <SText fontSize={15}>Cliente: {cliente?.nombres + " " + cliente?.apellidos || "-"}</SText>
                    </SView>
                </SView>

                <SHr height={10} />

                {this.mostrarTabla()}

                <SHr height={20} />
            </SPage>
        );
    }
}