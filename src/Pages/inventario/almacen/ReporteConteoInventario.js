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
import Informar from './Informar';
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

    colorEstado(estado) {
        switch (estado?.toUpperCase()) {
            case "CONFIRMADO":
                return "#4CAF50"; // verde
            case "PENDIENTE":
                return "#FF9800"; // naranja
            case "ANULADO":
                return "#F44336"; // rojo
            default:
                return "#9E9E9E"; // gris neutro por defecto
        }
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

                        ...(!e.row?.fecha_confirmacion ? [{
                            label: "Consolidar en Cardex",
                            icon: <SIconApp name='Arrow' fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                SNotification.send({
                                    key: "proceso_consolidacion",
                                    title: "Procesando Inventario",
                                    body: `Consolidando inventario Nro. ${e.row?.key_conteo}...`,
                                    color: STheme.color.warning,
                                    type: "loading"
                                });

                                SPopup.confirm({
                                    title: "¿Seguro que quieres aplicar cambios cardex?",
                                    message: `El inventario Nro. ${e.row?.key_conteo} será consolidado.`,
                                    onClose: () => {
                                        SNotification.remove("proceso_consolidacion");
                                        console.log("❌ Consolidación cancelada por el usuario");
                                    },
                                    onPress: async () => {
                                        try {
                                            const resp = await MDL.inventario.aplicar_cardex(e.row?.key_conteo);
                                            console.log("✅ aplicar_cardex", resp);
                                            SNotification.remove("proceso_consolidacion");
                                            SNotification.send({
                                                key: "proceso_consolidacion",
                                                title: "✅ Consolidación Exitosa",
                                                body: `Inventario Nro. ${e.row?.key_conteo} consolidado.`,
                                                time: 5000,
                                                color: STheme.color.success
                                            });
                                        } catch (error) {
                                            console.error("❌ Error aplicar_cardex:", error);

                                            SNotification.remove("proceso_consolidacion");
                                            SNotification.send({
                                                key: "proceso_consolidacion",
                                                title: "❌ Error en la Consolidación",
                                                body: `No se consolidó el inventario ${e.row?.key_conteo}.`,
                                                time: 6000,
                                                color: STheme.color.danger
                                            });
                                        }

                                        this.table.loadData();

                                    }
                                });
                            }
                        }] : []),

                        // ...(e.row?.fecha_confirmacion ? [{
                        //     label: "Anular Registro Cardex",
                        //     icon: <SIconApp name='Cerrar' fill="#e00b0bff" width={16} />,
                        //     onPress: () => {

                        //         const fecha = new SDate(e.row?.fecha_confirmacion, "yyyy-MM-ddThh:mm:ss");
                        //         if (!fecha) {
                        //             return SNotification.send({
                        //                 title: "⚠️ Sin fecha de confirmación",
                        //                 body: `No se puede consolidar el inventario.`,
                        //                 time: 5000,
                        //                 color: STheme.color.danger
                        //             });
                        //         }


                        //         SPopup.confirm({
                        //             title: "¿Seguro que quieres eliminar el inventario?",
                        //             message: "El inventario Nro." + e.row?.key_conteo + " será eliminado, si alguien es miembro de la nota puede invitarlo nuevamente.",
                        //             onPress: () => {
                        //                 console.log("Anular Registro Cardex", e.row?.key_conteo);
                        //             }
                        //         })

                        //         this.table.loadData();

                        //     }
                        // }] : [])

                        ...(e.row?.fecha_confirmacion ? [{
                            label: "Anular Registro Cardex",
                            icon: <SIconApp name='Cerrar' fill="#e00b0bff" width={16} />,
                            onPress: () => {
                                const fecha = new SDate(e.row?.fecha_confirmacion, "yyyy-MM-ddThh:mm:ss");
                                if (!fecha) {
                                    return SNotification.send({
                                        key: `anular_${e.row?.key_conteo}`,
                                        title: "⚠️ Sin fecha de confirmación",
                                        body: `No se puede anular el inventario.`,
                                        time: 5000,
                                        color: STheme.color.danger
                                    });
                                }

                                // Notificación de proceso en curso
                                SNotification.send({
                                    key: `proceso_anulacion_${e.row?.key_conteo}`,
                                    title: "Procesando Anulación",
                                    body: `Anulando inventario Nro. ${e.row?.key_conteo}...`,
                                    color: STheme.color.warning,
                                    type: "loading"
                                });

                                // Confirmación del usuario antes de anular
                                SPopup.confirm({
                                    title: "¿Seguro que quieres eliminar el inventario?",
                                    message: `El inventario Nro. ${e.row?.key_conteo} será eliminado. Si alguien es miembro de la nota, podrá ser invitado nuevamente.`,
                                    onClose: () => {
                                        SNotification.remove(`proceso_anulacion_${e.row?.key_conteo}`);
                                        console.log("❌ Anulación cancelada por el usuario");
                                    },
                                    onPress: async () => {
                                        try {
                                            const resp = await MDL.inventario.anular_cardex(e.row?.key_conteo);
                                            console.log("✅ Anular Registro Cardex", resp);

                                            SNotification.remove(`proceso_anulacion_${e.row?.key_conteo}`);
                                            SNotification.send({
                                                key: `anulado_${e.row?.key_conteo}`,
                                                title: "✅ Inventario Anulado",
                                                body: `El inventario Nro. ${e.row?.key_conteo} fue anulado correctamente.`,
                                                time: 5000,
                                                color: STheme.color.success
                                            });

                                            // Recargar la tabla
                                            this.table.loadData();

                                        } catch (error) {
                                            console.error("❌ Error al anular inventario:", error);

                                            SNotification.remove(`proceso_anulacion_${e.row?.key_conteo}`);
                                            SNotification.send({
                                                key: `error_anular_${e.row?.key_conteo}`,
                                                title: "❌ Error al Anular",
                                                body: `No se pudo anular el inventario Nro. ${e.row?.key_conteo}.`,
                                                time: 6000,
                                                color: STheme.color.danger
                                            });
                                        }
                                    }
                                });
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
                customComponent={e => <SText style={e.textStyle} center color={(e.row?.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}>{e.row?.total_perdida}</SText>}
            />
            <DinamicTable.Col key="total_perdida_costo" label="Costo Pérdidas" center width={100} data={(e) => e.row?.total_perdida_costo || "0"}
                cellStyle={{ backgroundColor: STheme.color.danger + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    return (e.row.total_perdida_costo ?
                        <SView col={"xs-12"} row center  >
                            <SIconApp name='Egreso' width={10} />
                            <SView width={8} />
                            <SText style={e.textStyle} color={(e.row.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}>{SMath.formatMoney(e.row.total_perdida_costo, 2, "Bs ", "bolivianos")}</SText>
                        </SView>
                        : null);
                }}
            />
            <DinamicTable.Col key="total_baja" label="T.Baja" width={80} data={(e) => e.row?.total_baja || "0"}
                cellStyle={{ backgroundColor: STheme.color.warning + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={e => <SText style={e.textStyle} center color={(e.row.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}>{e.row?.total_baja}</SText>}
            />
            <DinamicTable.Col key="total_baja_costo" label="T.Baja Costo" width={90} data={(e) => e.row?.total_baja_costo || "0"}
                cellStyle={{ backgroundColor: STheme.color.warning + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    return (e.row.total_baja_costo ?
                        <SText style={e.textStyle} color={(e.row.total_perdida >= 1) ? STheme.color.text : STheme.color.lightGray}> {SMath.formatMoney(e.row.total_baja_costo, 2, "Bs ", "bolivianos")}  </SText>
                        : null);
                }}
            />
            <DinamicTable.Col key="total_excedente" label="T.Excedente" width={90} data={(e) => e.row?.total_excedente || "0"}
                cellStyle={{ backgroundColor: STheme.color.success + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={e => <SText style={e.textStyle} center color={(e.row.total_excedente >= 1) ? STheme.color.text : STheme.color.lightGray}>{e.row?.total_excedente}</SText>}
            />
            <DinamicTable.Col key="total_excedente_costo" label="T.Excedente Costo" width={110} data={(e) => e.row?.total_excedente_costo || "0"}
                cellStyle={{ backgroundColor: STheme.color.success + "33" }}
                textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    return <SView col={"xs-12"} row center  >
                        <SIconApp name='Ingreso' width={10} />
                        <SView width={8} />
                        <SText style={e.textStyle} color={(e.row.total_excedente_costo >= 1) ? STheme.color.text : STheme.color.lightGray}>{SMath.formatMoney(e.row.total_excedente_costo, 2, "Bs ", "bolivianos")}</SText>
                    </SView>
                }}
            />

            <DinamicTable.Col
                key="estado"
                label="Estado"
                width={120}
                data={e => e.row?.estado ?? ""}
                customComponent={e => {
                    // Determinamos el estado basado en fecha_confirmacion
                    const estado = e.row?.fecha_confirmacion ? "CONFIRMADO" : "PENDIENTE";
                    return (
                        <SView col={"xs-12"} row center >
                            <SView width={80} center style={{
                                ...e.textStyle,
                                backgroundColor: this.colorEstado(estado) + "60" || STheme.color.card,
                                borderWidth: 1, borderColor: this.colorEstado(estado) + "33" || STheme.color.card,
                                paddingHorizontal: 2, paddingVertical: 3, borderRadius: 4
                            }}> <SText fontSize={11}> {estado} </SText>
                            </SView>
                        </SView>
                    );
                }}
            />



            <DinamicTable.Col key="fecha_confirmacion" label="F. Confirmación" width={100}
                data={(e) => e.row?.fecha_confirmacion || null}
                textStyle={{ fontWeight: "bold" }}
                customComponent={(e) => {
                    return (e.row?.fecha_confirmacion ? <SText style={e.textStyle} fontSize={14} color={STheme.color.lightGray}> {e.row?.fecha_confirmacion}  </SText> : null);
                }}
            />




            <DinamicTable.Col key="fecha" label="Fecha Creación" width={120} data={(e) => e.row?.fecha}
                customComponent={e => <SView center row><SIconApp name='Evento' width={12} height={12} fill={STheme.color.lightGray} />
                    <SText style={e.textStyle} color={STheme.color.lightGray} > {e.row?.fecha}</SText></SView>}
            />
            <DinamicTable.Col key="hora" label="Hora Creación" width={80} data={(e) => e.row?.hora}
                customComponent={e => <SView center row><SIconApp name='history' width={12} height={12} fill={STheme.color.lightGray} />
                    <SText style={e.textStyle} color={STheme.color.lightGray}> {e.row?.hora}</SText></SView>} />
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
                            <SText  style={e.textStyle} center color={STheme.color.lightGray}>{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />
        </DinamicTable >
    }
    render() {
        return (
            <SPage title="Reporte de Conteo de Inventario" disableScroll>
                {this.mostrarTabla()}
                {/* <Informar></Informar> */}
            </SPage>
        );
    }
}