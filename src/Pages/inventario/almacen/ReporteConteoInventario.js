import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom, SMath } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
// import MDL from '../../../MDL';
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
            // const api = await MDL.inventario.getAllAlmacen();
            // const keysUsuarios = Object.values(api).map(p => p.key_usuario).filter(Boolean);
            // const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            // const sucursales = await MDL.empresa.getAllSucursales();
            // const empresa = MDL.empresa.select?.razon_social;
            // Object.values(api).forEach(itm => {
            //     itm.usuario = usuarios.find(u => u.key === itm.key_usuario);
            //     itm.sucursal = sucursales.find(u => u.key === itm.key_sucursal);
            //     itm.razon_social = empresa
            // });
            // return api;

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
                            // icon: <SIconApp name='Eyes' fill="#e4e4e4ff" width={20} />,
                            icon: <SIconApp name='Arrow' fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                SNavigation.navigate("/inventario/almacen/profile/registro_inventario", { pk: e.row.key_almacen, key_conteo: e.row.key_conteo })
                            }
                        },

                        {
                            label: "Anular Registro Cardex",
                             icon: <SIconApp name='Cerrar' fill="#e00b0bff" width={16} />,
                            onPress: () => {
                                SPopup.confirm({
                                    title: "¿Seguro que quieres eliminar el inventario?",
                                    message: "El inventario Nro." + e.row?.key_conteo + " será eliminado, si alguien es miembro de la nota puede invitarlo nuevamente.",
                                    onPress: () => {
                                        MDL.inventario.anular_cardex(e.row?.key_conteo).then((resp: any) => {
                                            console.log("anular_cardex", resp);
                                            this.table.loadData();
                                        })
                                    }
                                })
                            }
                        },
                        // {
                        //     label: "Imprimir tamaño carta",
                        //     icon: <SIcon name='imprimir' />,
                        //     onPress: () => {
                        //         ReciboCarta.imprimir(e?.row?.key)
                        //     }
                        // },
                        // {
                        //     label: "Imprimir tipo rollo",
                        //     icon: <SIcon name='imprimir' stroke="#710505ff" fill='blue' />,
                        //     onPress: () => {
                        //         ReciboRollo.imprimir(e?.row?.key)
                        //     }
                        // },
                    ]
                });
            }}

            loadData={this.loadInitialData.bind(this)}
        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
            <DinamicTable.Col key="key_almacen" label="Almacén" width={140} data={(e) => e.row?.key_almacen ?? ""}
                customComponent={e => <>
                    {(e.row?.key_almacen) ?

                        <SView col={"xs-12"} row center  >
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView style={{ width: 26 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_almacen}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.descripcion}</SText>
                        </SView> : null}
                </>}
            />

            {/* customComponent={e => <SText flex numberOfLines={e.colData.wrap ? 0 : 1} color={STheme.color.lightGray}>{e.row?.total_perdida}</SText>} */}



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



            <DinamicTable.Col key="key_asiento" label="Contabilidad" width={124} data={(e) => e.row?.key_conteo}
                customComponent={e => <SView center style={{ height: 24, borderRadius: 4, overflow: "hidden", backgroundColor: STheme.color.lightGray + "66", borderWidth: 1, borderColor: STheme.color.secondary }}
                    onPress={() => { alert("Generar Asiento contable") }} >
                    <SText >Generar Asiento</SText>
                </SView>} />



            {/* <DinamicTable.Col key="key_cardex" label="Inv.Cardex" width={180} data={(e) => e.row?.key_conteo}
                customComponent={e => {

                    return !(e.row.fecha_confirmacion) ? <SView center style={{ height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", borderWidth: 1, borderColor: STheme.color.secondary }}
                        onPress={() => {
                            // alert("trabajandolo... Registrar en Cardex")
                            MDL.inventario.aplicar_cardex(e.row?.key_conteo).then((resp: any) => {
                                console.log("aplicar_cardex" + JSON.stringify(resp));
                                // this.table.loadData();
                            })
                        }} >
                        <SText >Registrar en Cardex</SText>
                    </SView>
                        : null;
                }
                }
            /> */}


            <DinamicTable.Col key={"-keyprofile"} label='Ver' width={40} data={(e) => e.row?.key}
                customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/venta/profile", { pk: e.row.key }) }}>
                    <SIconApp name='Eyes' height={14} fill={STheme.color.lightGray} ></SIconApp>
                </SView>} />

            {/* <DinamicTable.Col key={"codigo"} label='Código' width={90} center data={(e) => e?.row?.codigo ?? "AL790"} customComponent={(e) => this.renderCodigo(e.data)} /> */}



            {/* <DinamicTable.Col key="key_cardex_anular" label="Inv." width={180} data={(e) => e.row?.key_conteo}
                customComponent={e => {
                    return (e.row.fecha_confirmacion) ?
                        <SView center style={{ height: 24, width: 150, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.danger + "66", borderWidth: 1, borderColor: STheme.color.secondary }}
                            onPress={() => {
                                SPopup.confirm({
                                    title: "¿Seguro que quieres eliminar el inventario?",
                                    message: "El inventario Nro." + e.row?.key_conteo + " será eliminado, si alguien es miembro de la nota puede invitarlo nuevamente.",
                                    onPress: () => {
                                        MDL.inventario.anular_cardex(e.row?.key_conteo).then((resp: any) => {
                                            console.log("anular_cardex", resp);
                                            this.table.loadData();
                                        })
                                    }
                                })
                            }}>
                            <SText >Anular Reg.Cardex</SText>
                        </SView>
                        : null;
                }
                }

            /> */}



            <DinamicTable.Col key="fecha" label="Fecha Creación" width={120} data={(e) => e.row?.fecha}
                customComponent={e => <SView center row><SIconApp name='Evento' width={12} height={12} fill={STheme.color.lightGray} />
                    <SText color={STheme.color.lightGray} > {e.row?.fecha}</SText></SView>}
            />
            <DinamicTable.Col key="hora" label="Hora Creación" width={80} data={(e) => e.row?.hora}
                customComponent={e => <SView center row><SIconApp name='history' width={12} height={12} fill={STheme.color.lightGray} />
                    <SText color={STheme.color.lightGray}> {e.row?.hora}</SText></SView>} />


        

            <DinamicTable.Col key={"fecha_confirmacion"} label="F. Confirmacion" width={120} dataType="date" data={e => new SDate(e.row?.fecha_confirmacion, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
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