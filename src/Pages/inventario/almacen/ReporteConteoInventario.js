import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom, SMath } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import MDL from '../../../MDL';
import FloatButtom from '../../../Components/FloatButtom';

export default class ReporteConteoInventario extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.cargarTabla();
        this.inventarioChavalEventos = MDL.inventario.addEventListener("chavalEventos", (e) => {
            this.cargarTabla();
            console.log("chavalEventos", e);
        })
    }

    componentWillUnmount() {
        MDL.inventario.removeEventListener(this.inventarioChavalEventos)
    }

    cargarTabla() {

        MDL.inventario.getAllConteoManualInventario().then((resp: any) => {
            this.almacenes = Object.values(resp)
            this.table.loadData();
        })
    }

    mostrarTabla() {
        return <DinamicTable
            key="tabla" ref={ref => this.table = ref} center language="es" selectType="single"
            colors={{ background: STheme.color.background, header: STheme.color.card }}
            cellStyle={{ borderWidth: 0 }}
            textStyle={{ fontSize: 12, color: "white", textAlign: "center" }}
            loadData={async () => {
                const all = await MDL.inventario.getAll_reporte_conteo_inventario_detallado();
                const keysUsuarios = Object.values(all).map(p => p.key_usuario).filter(Boolean);
                const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
                Object.values(all).forEach(proveedor => {
                    proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario);
                });
                return all;
            }}
        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key={"foto"} label='User' data={(e) => e.row?.usuario} width={35}
                customComponent={e => <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={SSocket.api.root + "usuario/" + e.row?.usuario} style={{ resizeMode: "cover", }} />
                </SView>} />
            <DinamicTable.Col key="nombre" label="Usuario" width={150} data={(e) => e.row?.usuario.Nombres} />
            <DinamicTable.Col key="descripcion" label="Almacen" width={150} data={(e) => e.row?.descripcion} />
            <DinamicTable.Col key="fecha" label="Fecha" width={100} data={(e) => e.row?.fecha} />
            <DinamicTable.Col key="hora" label="Hora" width={100} data={(e) => e.row?.hora} />
            <DinamicTable.Col key="key_conteo" label="Ver" width={150} data={(e) => e.row?.key_conteo}
                customComponent={e => <SView center style={{
                    height: 24,
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: STheme.color.card + "66",
                    borderWidth: 1,
                    borderColor: STheme.color.secondary,
                }}
                    onPress={() => {
                        SNavigation.navigate("/inventario/almacen/profile/registro_inventario", { pk: e.row.key_almacen, key_conteo: e.row.key_conteo })
                    }}
                >
                    <SText >Det.Inventario</SText>
                </SView>} />
            <DinamicTable.Col key="total_perdida" label="T. Pérdidas" center width={70} data={(e) => e.row?.total_perdida || "0"}

                customComponent={e => <SText color='red' style={{ textAlign: "center" }}>{e.row?.total_perdida}</SText>}

            />
            <DinamicTable.Col key="total_perdida_costo" label="T.Pérdidas Costo" center width={100} data={(e) => e.row?.total_perdida_costo || "0"}
                customComponent={(e) => {
                    return (e.row.total_perdida_costo ? <SText style={{ textAlign: "center" }}> {"Bs " + SMath.formatMoney(e.row.total_perdida_costo, 2, "Bs ", "bolivianos")}  </SText> : null);
                }}
            />

            <DinamicTable.Col key="total_baja" label="T.Baja" width={60} data={(e) => e.row?.total_baja || "0"}
                customComponent={e => <SText color='orange' style={{ textAlign: "center" }}>{e.row?.total_baja}</SText>}
            />
            <DinamicTable.Col key="total_baja_costo" label="T.Baja Costo" width={90} data={(e) => e.row?.total_baja_costo || "0"}
                customComponent={(e) => {
                    return (e.row.total_baja_costo ? <SText style={{ textAlign: "center" }}> {"Bs " + SMath.formatMoney(e.row.total_baja_costo, 2, "Bs ", "bolivianos")}  </SText> : null);
                }}

            />

            <DinamicTable.Col key="total_excedente" label="T.Excedente" width={90} data={(e) => e.row?.total_excedente || "0"}
                customComponent={e => <SText color='green' bold style={{ textAlign: "center" }}>{e.row?.total_excedente}</SText>}


            />
            <DinamicTable.Col key="total_excedente_costo" label="T.Excedente Costo" width={110} data={(e) => e.row?.total_excedente_costo || "0"}
                customComponent={(e) => {
                    return (e.row.total_excedente_costo ? <SText style={{ textAlign: "center" }}> {"Bs " + SMath.formatMoney(e.row.total_excedente_costo, 2, "Bs ", "bolivianos")}  </SText> : null);
                }}
            />



            {/* <DinamicTable.Col key="key_asiento" label="Contabilidad" width={150} data={(e) => e.row?.key_conteo}
                customComponent={e => <SView center style={{ height: 24, borderRadius: 16, overflow: "hidden", backgroundColor: STheme.color.card + "66", borderWidth: 1, borderColor: STheme.color.secondary }}
                    onPress={() => { alert("Generar Asiento contable") }} >
                    <SText >Generar Asiento</SText>
                </SView>} /> */}



            <DinamicTable.Col key="key_cardex" label="Inv.Cardex" width={180} data={(e) => e.row?.key_conteo}
                customComponent={e => <SView center style={{ height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", borderWidth: 1, borderColor: STheme.color.secondary }}
                    onPress={() => {

                        MDL.inventario.aplicar_cardex(e.row?.key_conteo).then((resp: any) => {
                            console.log("aplicar_cardex", resp);
                            // this.table.loadData();
                        })

                    }} >
                    <SText >Registrar en Cardex</SText>
                </SView>} />


        </DinamicTable>
    }
    render() {
        return (
            <SPage title="Reporte de Conteo de Inventario" disableScroll>
                {this.mostrarTabla()}
            </SPage>
        );
    }
}