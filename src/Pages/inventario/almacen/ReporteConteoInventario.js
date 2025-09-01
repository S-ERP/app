import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SSfication, SImage, SDate, SButtom, SMath, SNotification } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import FloatButtom from '../../../Components/FloatButtom';
import SIconApp from '../../../Assets/SIconApp';
import MDL from '../../../MDL';
import Config from '../../../Config';
import FloatMenu from '../../../Components/FloatMenu';
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
    async loadInitialData() {
        try {
            const api = await MDL.inventario.getAll_reporte_conteo_inventario_detallado();
            const keysUsuarios = Object.values(api).map(p => p.key_usuario).filter(Boolean);
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            Object.values(api).forEach(proveedor => {
                proveedor.usuario = usuarios.find(u => u.key === proveedor.key_usuario);
            });
            console.log("📦 DATA COMPLETA:", api);
            return api;
        } catch (error) {
            console.error('Error loading initial data:', error);
            return [];
        }
    }
    renderCodigo(codigo) {
        return <SView row center>
            <SView border={STheme.color.card} style={{ borderRadius: 8, padding: 6, borderWidth: 1 }}>
                <SText color={STheme.color.text} fontSize={10} bold>{codigo}</SText>
            </SView>
        </SView>
    }
    mostrarTabla() {
        return <DinamicTable
            key="tabla"
            ref={ref => this.table = ref}
            language="es"
            selectType="single"
            {...Config.table.applyTheme()}
            onSelect={(e) => {
                FloatMenu.open({
                    e: e.evt,
                    label: "Opciones",
                    options: [
                        {
                            label: "Ver Detalle Inventario",
                            icon: <SIconApp name='Arrow' fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                SNavigation.navigate("/inventario/almacen/profile/registro_inventario", { pk: e.row.key_almacen, key_conteo: e.row.key_conteo })
                            }
                        },
                        {
                            label: "Generar Asiento",
                            icon: <SIconApp name='Ajustes' fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                alert("Generar Asiento contable " + JSON.stringify(e.row?.key_conteo))
                            }
                        },







                        {
                            label: "confirma ricardo",
                            icon: <SIconApp name='Arrow' fill="#e4e4e4ff" width={16} />,
                            onPress: () => {

                                console.log("TODOOOOOOOOOOOOOOOOOOOO " + JSON.stringify(e.row))
                                return;

                                const fecha = new SDate(e.row?.fecha_confirmacion, "yyyy-MM-ddThh:mm:ss");
                                if (!fecha) {
                                    SNotification.send({
                                        title: "⚠️ Sin fecha de confirmación",
                                        body: `No se puede consolidar el inventario.`,
                                        time: 5000,
                                        color: STheme.color.danger
                                    })
                                }
                                SNotification.send({
                                    key: "proceso_consolidacion",
                                    title: "Procesando Inventario",
                                    body: `Consolidando inventario Nro. ${e.row?.key_conteo}...`,
                                    color: STheme.color.warning,
                                    type: "loading"
                                });
                                SPopup.confirm({
                                    title: "¿Seguro que quieres aplicar cambios cardex?",
                                    message: "El inventario Nro." + e.row?.key_conteo + " será consolidado.",
                                    onClose: () => {
                                        SNotification.remove("proceso_consolidacion")

                                        console.log("El popup fue cerrado sin confirmar");

                                    },
                                    onPress: () => {
                                        MDL.inventario.aplicar_cardex(e.row?.key_conteo).then((resp) => {
                                            console.log("aplicar_cardex" + JSON.stringify(resp));
                                            SNotification.remove("proceso_consolidacion")
                                            SNotification.send({
                                                key: "proceso_consolidacion",
                                                title: "✅ Consolidación Exitosa",
                                                body: `Inventario Nro. ${e.row?.key_conteo} consolidado.`,
                                                time: 5000,
                                                color: STheme.color.success
                                            });
                                        }).catch(e => {
                                            SNotification.remove("proceso_consolidacion")
                                            SNotification.send({
                                                key: "proceso_consolidacion",
                                                title: "❌ Error en la Consolidación",
                                                body: `No se consolidó el inventario ${e.row?.key_conteo}.`,
                                                time: 6000,
                                                color: STheme.color.danger
                                            })
                                        })
                                        SNotification.remove("proceso_consolidacion")

                                    }
                                })
                            }
                        },

                        ...(e.row?.fecha_confirmacion ? [{
                            label: "Anular Registro Cardex",
                            icon: <SIconApp name='Cerrar' fill="#e00b0bff" width={16} />,
                            onPress: () => {
                                SPopup.confirm({
                                    title: "¿Seguro que quieres eliminar el inventario?",
                                    message: "El inventario Nro." + e.row?.key_conteo + " será eliminado, si alguien es miembro de la nota puede invitarlo nuevamente.",
                                    onPress: () => {
                                        console.log("Anular Registro Cardex", e.row?.key_conteo);
                                    }
                                })
                            }
                        }] : [])






                    ]
                });
            }
            }
            loadData={this.loadInitialData.bind(this)}
        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key="key_almacen" label="Almacén" width={100} data={(e) => e.row?.key_almacen ?? ""}
                customComponent={e => <>
                    {(e.row?.key_almacen) ?
                        <SView col={"xs-12"} row center  >
                            <SView style={{ width: 38 }} >
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView style={{ width: 26, position: "absolute", left: 12 }}>
                                    <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                        <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_almacen}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                                    </SView>
                                </SView>
                            </SView>
                            <SView width={4} />
                            <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.descripcion}</SText>
                        </SView> : null}
                </>}
            />
            <DinamicTable.Col key="total_perdida" label="T. Pérdidas" center width={80} data={(e) => e.row?.total_perdida || "0"}
                cellStyle={{ backgroundColor: STheme.color.danger + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={e => <SText center color={(e.row?.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}>{e.row?.total_perdida}</SText>}
            />
            <DinamicTable.Col key="total_perdida_costo" label="Costo Pérdidas" center width={100} data={(e) => e.row?.total_perdida_costo || "0"}
                cellStyle={{ backgroundColor: STheme.color.danger + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    return (e.row.total_perdida_costo ?
                        <SView col={"xs-12"} row center  >
                            <SIconApp name='Egreso' width={10} />
                            <SView width={8} />
                            <SText color={(e.row.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}>{SMath.formatMoney(e.row.total_perdida_costo, 2, "Bs ", "bolivianos")}</SText>
                        </SView>
                        : null);
                }}
            />
            <DinamicTable.Col key="total_baja" label="T.Baja" width={80} data={(e) => e.row?.total_baja || "0"}
                cellStyle={{ backgroundColor: STheme.color.warning + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={e => <SText center color={(e.row.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}>{e.row?.total_baja}</SText>}
            />
            <DinamicTable.Col key="total_baja_costo" label="T.Baja Costo" width={90} data={(e) => e.row?.total_baja_costo || "0"}
                cellStyle={{ backgroundColor: STheme.color.warning + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    return (e.row.total_baja_costo ?
                        <SText color={(e.row.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}> {SMath.formatMoney(e.row.total_baja_costo, 2, "Bs ", "bolivianos")}  </SText>
                        : null);
                }}
            />
            <DinamicTable.Col key="total_excedente" label="T.Excedente" width={90} data={(e) => e.row?.total_excedente || "0"}
                cellStyle={{ backgroundColor: STheme.color.success + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={e => <SText center color={(e.row.total_excedente >= 1) ? STheme.color.text : STheme.color.lightGray}>{e.row?.total_excedente}</SText>}
            />
            <DinamicTable.Col key="total_excedente_costo" label="T.Excedente Costo" width={110} data={(e) => e.row?.total_excedente_costo || "0"}
                cellStyle={{ backgroundColor: STheme.color.success + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    return <SView col={"xs-12"} row center  >
                        <SIconApp name='Ingreso' width={10} />
                        <SView width={8} />
                        <SText color={(e.row.total_excedente_costo >= 1) ? STheme.color.text : STheme.color.lightGray}>{SMath.formatMoney(e.row.total_excedente_costo, 2, "Bs ", "bolivianos")}</SText>
                    </SView>
                }}
            />

            <DinamicTable.Col key="fecha_confirmacion" label="fecha_confirmacion" width={190} data={(e) => e.row?.fecha_confirmacion || null}
                cellStyle={{ backgroundColor: STheme.color.warning + "33" }} textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    const fecha = new SDate(e.row?.fecha_confirmacion, "yyyy-MM-ddThh:mm:ss").date;
                    return (fecha ? <SText color={STheme.color.lightGray}> {e.row?.fecha_confirmacion}  </SText> : null);
                }}
            />

            <DinamicTable.Col key="fecha" label="Fecha Creación" width={120} data={(e) => e.row?.fecha}
                customComponent={e => <SView center row><SIconApp name='Evento' width={12} height={12} fill={STheme.color.lightGray} />
                    <SText color={STheme.color.lightGray} > {e.row?.fecha}</SText></SView>}
            />
            <DinamicTable.Col key="hora" label="Hora Creación" width={80} data={(e) => e.row?.hora}
                customComponent={e => <SView center row><SIconApp name='history' width={12} height={12} fill={STheme.color.lightGray} />
                    <SText color={STheme.color.lightGray}> {e.row?.hora}</SText></SView>} />
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
                            <SText center color={STheme.color.lightGray}>{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />
        </DinamicTable >
    }
    render() {
        return (
            <SPage title="Reporte de Conteo de Inventario" disableScroll>
                {this.mostrarTabla()}
            </SPage>
        );
    }
}