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

            const ventas = await MDL.compra_venta.execute_function("_get_detalles_bycliente2", [keyEmpresa, keyCliente]);

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


            // console.clear();
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

        const data = this.state.ventasEnriquecidas || [];

        const totalDebe = data.reduce((acc, row) => {
            return acc + (row?.subtotal || 0);
        }, 0);

        console.clear();
        console.log("%c" + JSON.stringify(data, null, 2), "color: #2ECC40; font-weight: bold;");

        console.log("%c" + totalDebe, `color: #cc752e; font-weight: bold;`);
        const monedaLabel = "dol";
        // const monedaLabel = this.state?.moneda?.observacion || "";


        const ____totalDebe = 55;
        // const ____totalDebe = SMath.formatMoney(totalDebe || 0);

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
                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e?.row?.tipo || "-"} />
                <DinamicTable.Col key="detalle" label="Detalle" width={200} data={(e) => e?.row?.descripcion || "-"}
                    footerComponent={() => (
                        <SView style={{ alignItems: "flex-end", paddingRight: 8 }}>
                            <SText bold>Total</SText>

                        </SView>
                    )}

                />

                <DinamicTable.Col
                    key="debe"
                    label="Debe"
                    width={100}
                    data={(e) => e?.row?.debe ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.data?`${SMath.formatMoney(e.data || 0)}`:""} // Formatea el saldo

 
                    footerComponent={(e) => {
                        let total = 0;
                        e.dinamicTable.data.map(a => {
                            total += a.debe || 0
                        })
                        return <SView style={{ alignItems: "center" }}>
                            <SText >{`${SMath.formatMoney(total || 0)}`}</SText>
                            {/* <SText >{total}</SText> */}
                            {/* <SText style={e.dinamicTable.textStyle}>{total}</SText> */}
                        </SView>
                    }}
               
                />

                <DinamicTable.Col
                    key="haber"
                    label="Haber"
                    width={100}
                    data={(e) => e?.row?.haber ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    // format={(e) => `${SMath.formatMoney(e.data || 0)}`} // Formatea el saldo
                    format={(e) => e.data?`${SMath.formatMoney(e.data || 0)}`:""} // Formatea el saldo


                    footerComponent={(e) => {
                        let total = 0;
                        e.dinamicTable.data.map(a => {
                            total += a.haber || 0
                        })
                        return <SView style={{ alignItems: "center" }}>
                            {/* <SText  >{total}</SText> */}


                            <SText  > {`${SMath.formatMoney(total || 0)}`} </SText>

                        </SView>
                    }}

                />

                <DinamicTable.Col
                    key="saldo"
                    label="Saldo"
                    width={120}
                    data={(e) => e?.row?.saldo ?? 0} // Muestra el saldo de cada fila
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => `${SMath.formatMoney(e.data || 0)}`} // Formatea el saldo
                    footerComponent={(e) => {
                        // Mostrar el saldo del último registro como total final
                        const lastRow = e.dinamicTable.data[e.dinamicTable.data.length - 1];
                        const totalSaldo = lastRow?.saldo || 0;

                        return (
                            <SView style={{ alignItems: "flex-end", paddingRight: 8 }}>
                                <SText  >{`${SMath.formatMoney(totalSaldo)}`}</SText>
                            </SView>
                        );
                    }}
                />

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