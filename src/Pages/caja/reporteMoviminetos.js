import React, { Component } from 'react';
import { SView, SPage, SHr, SScrollView2, STheme, SDate, SText, SImage, SPopup, SMath, SNavigation } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import DateTimeBetween from '../../Components/DateTimeBetween';
import SIconApp from '../../Assets/SIconApp';
import FloatMenu from '../../Components/FloatMenu';
import PopupSeeVoucher from '../caja2/components/PopupSeeVoucher';

export default class reporteMoviminetos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate('2024-01-01', 'yyyy-MM-dd hh:mm').toString("yyyy-MM-dd"),
            // fecha_inicio: new SDate().addMonth(-10).setDay(1).toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            data: [], // Estado para almacenar los datos de la tabla
        };
    }

    componentDidMount() {
        this.loadInitialData().then(data => {
            this.setState({ data }); // Actualizar el estado con los datos iniciales
        });
    }



    colorTipoOperacion(estado) {
        switch (estado?.toUpperCase()) {
            case "APERTURA":
                return "#4CAF50"; // verde
            case "VENTA":
                return "#FF9800"; // naranja
            case "COMPRA":
                return "#F44336"; // rojo
            default:
                return "#9E9E9E"; // gris neutro por defecto
        }
    }

    colorTipoPagoaaaaaaaaaaaa(estado) {
        // console.log("punta-" + estado + "-")
        switch (estado?.toUpperCase()) {
            case "CAJA":
                return "#4CAF50"; // verde
            case "CREDITO":
                return "#FF9800"; // naranja
            case "BANCO":
                return "#F44336"; // rojo
            default:
                return "#9E9E9E"; // gris neutro por defecto
        }
    }



    async loadInitialData() {
        try {
            console.log("📦 Cargando movimientos de caja...");
            const empresaKey = MDL.empresa.select?.key;


            if (!empresaKey) throw new Error("Empresa no seleccionada.");
            const { fecha_inicio, fecha_fin } = this.state;
            // const fechaInicioRef = fecha_inicio ?? new SDate().addMonth(-1).setDay(1).toString('yyyy-MM-dd');
            // const fechaFinRef = fecha_fin ?? new SDate().toString('yyyy-MM-dd');
            const movimientos = await MDL.caja.getAllMovimientosCajasByEmpresa(empresaKey, fecha_inicio, fecha_fin);
            if (!Array.isArray(movimientos)) {
                console.warn("No se recibieron movimientos válidos.");
                return [];
            }
            // console.log("Movimientos recibidos:", JSON.stringify(movimientos));
            const empresa = await MDL.empresa.getFull();

            const base = empresa.monedas.find(a => a.tipo == "base");

            // console.log("fullllllllllllll " + JSON.stringify(base))


            const sucursales = empresa?.sucursales ?? [];
            const puntos_ventas = sucursales.flatMap(s => s.puntos_venta || []);
            const usuarioKeys = [...new Set(movimientos.map(m => m.key_usuario).filter(Boolean))];
            const usuarios = (await MDL.usuario.getByKeys(usuarioKeys)) ?? [];
            const usuarioMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
            const processedData = movimientos.map(mov => ({
                ...mov,
                usuario: usuarioMap[mov.key_usuario] ?? null,
                cajero: usuarioMap[mov.key_cajero] ?? null,
                puntos_venta: puntos_ventas.find(pv => pv.key === mov.key_punto_venta) ?? null,
                sucursal: sucursales.find(s => s.key === mov.key_sucursal) ?? null,
                moneda: empresa.monedas.find(m => m.key === mov.key_moneda) ?? null,
                moneda_base: base,
            }));
            // console.log("Datos procesados para la tabla:", JSON.stringify(processedData));
            return processedData;
        } catch (error) {
            console.error("❌ Error al cargar movimientos:", error);
            SPopup.alert("Error al cargar los movimientos. Intenta nuevamente.");
            return [];
        }
    }

    renderTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadInitialData()}
                data={this.state.data} // Pasar los datos del estado
                key="id"
                keyExtractor={e => e.key}
                language="es"
                center
                selectType="single"

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

                loadInitialState={async () => ({
                    sorters: [{ key: "fecha", order: "desc", type: "date" }],
                })}
                {...Config.table.applyTheme()}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />





                <DinamicTable.Col
                    key="sucursal_"
                    label="SUCURSAL"
                    width={150}
                    data={e => e.row?.sucursal?.descripcion ?? "Sin sucursal"}
                    customComponent={e => {
                        const key = e.row?.key_sucursal;
                        const descripcion = e.row?.sucursal?.descripcion ?? "Sin sucursal";
                        return key ? (
                            <SView col="xs-12" row center>
                                <SView
                                    style={{
                                        width: 40,
                                        height: 24,
                                        borderRadius: 100,
                                        overflow: "hidden",
                                        backgroundColor: STheme.color.card + "66",
                                    }}
                                >

                                    <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                        <SImage src={SSocket.api.empresa + "empresa/" + e.row?.key_empresa} />
                                    </SView>
                                    <SView style={{ width: 26, position: "absolute", left: 12 }}>
                                        <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                            <SImage src={`${SSocket.api.empresa}sucursal/${key}`} style={{ resizeMode: "cover" }} />
                                        </SView>
                                    </SView>
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={1} style={e.textStyle}>
                                    {descripcion}
                                </SText>
                            </SView>
                        ) : (
                            <SText>Sin sucursal</SText>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="punto"
                    label="P.VENTA"
                    width={60}
                    color={STheme}
                    data={e => e.row?.puntos_venta?.descripcion ? "PV-" + e.row?.puntos_venta?.descripcion : "Sin punto de venta"}
                />

                <DinamicTable.Col
                    key="fecha2"
                    label="APERTURA CAJA"
                    width={130}
                    center
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />
                <DinamicTable.Col
                    key="fecha3"
                    label="CIERRE CAJA"
                    width={130}
                    center
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />
                <DinamicTable.Col
                    key="fecha"
                    label="FECHA Y HORA TRANSACCIÓN"
                    width={130}
                    center
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />
                <DinamicTable.Col
                    key="horaa"
                    label=" HORA  "
                    width={130}
                    center
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />



                {/* <DinamicTable.Col key="fechaas" label="Fecha Creación" width={120} data={(e) => e.row?.fecha}
                    customComponent={e => <SView center row><SIconApp name='Evento' width={12} height={12} fill={STheme.color.lightGray} />
                        <SText style={e.textStyle} color={STheme.color.lightGray} > {e.row?.fecha}</SText></SView>}
                />
                <DinamicTable.Col key="horadsa" label="Hora Creación" width={80} data={(e) => e.row?.hora}
                    customComponent={e => <SView center row><SIconApp name='history' width={12} height={12} fill={STheme.color.lightGray} />
                        <SText style={e.textStyle} color={STheme.color.lightGray}> {e.row?.hora}</SText></SView>} /> */}


                <DinamicTable.Col
                    key="codigo_comprobante"
                    wrap
                    label="CÓDIGO COMPROBANTE"
                    width={110}
                    data={e => e.row?.codigo_comprobante ?? 0}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} row center >
                                <SView width={80} center style={{
                                    ...e.textStyle,
                                    borderWidth: 1, borderColor: STheme.color.link,
                                    paddingHorizontal: 2, paddingVertical: 3, borderRadius: 4
                                }}
                                    onPress={() => {
                                        SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: e.row?.key_comprobante })
                                    }}
                                > <SText color={STheme.color.link} underLine fontSize={11}> {e.row?.codigo_comprobante} </SText>
                                </SView>
                            </SView>
                        );
                    }}

                />

                {/* {item.codigo_comprobante && <><View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText color={STheme.color.link} underLine fontSize={10} onPress={() => {
                            SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: item.key_comprobante })
                        }}>{item.codigo_comprobante}</SText>
                    </View>
                        <SView width={8} />
                    </>} */}


                <DinamicTable.Col
                    key="tipo"
                    wrap
                    label="TIPO DE OPERACIÓN"
                    width={90}
                    data={e => e.row?.tipo ?? 0}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} row center >
                                <SView width={80} center style={{
                                    ...e.textStyle,
                                    backgroundColor: this.colorTipoOperacion(e.row?.tipo) + "60" || STheme.color.card,
                                    borderWidth: 1, borderColor: this.colorTipoOperacion(e.row?.tipo) + "33" || STheme.color.card,
                                    paddingHorizontal: 2, paddingVertical: 3, borderRadius: 4
                                }}> <SText fontSize={11}> {e.row?.tipo} </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />




                <DinamicTable.Col
                    key="descripcion"
                    wrap
                    label="DESCRIPCIÓN"
                    width={200}
                    data={e => e.row?.descripcion ?? 0}
                />



                <DinamicTable.Col
                    key="key_tipo_pago"
                    wrap
                    label="MÉTODO DE PAGO"
                    width={90}
                    data={e => e.row?.key_tipo_pago ?? ""}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} row center >
                                <SView width={80} center style={{
                                    ...e.textStyle,
                                    backgroundColor: this.colorTipoPagoaaaaaaaaaaaa(e.row?.key_tipo_pago) || STheme.color.card,
                                    // borderWidth: 1, borderColor: this.colorTipoPagoaaaaaaaaaaaa(e.row?.key_tipo_pago) || STheme.color.card,
                                    paddingHorizontal: 2, paddingVertical: 3, borderRadius: 4
                                }}> <SText fontSize={11}>{e.row?.key_tipo_pago}</SText>
                                </SView>
                            </SView>
                        );
                    }}
                />


                {/* iconLista
pagotarjeta
iconPesos */}

                <DinamicTable.Col
                    key="key_tipo_pago1"
                    wrap
                    label="TIPO DE PAGO"
                    width={110}
                    data={e => e.row?.key_tipo_pago ?? ""}
                    customComponent={e => {
                        const tipo = e.row?.key_tipo_pago;

                        // Definir texto descriptivo según el tipo de pago
                        let texto = "";
                        switch (tipo) {
                            case "caja":
                                texto = "Efectivo";
                                break;
                            case "banco":
                                texto = "Transferencia";
                                break;
                            case "credito":
                                texto = "Crédito";
                                break;
                            default:
                                texto = tipo ?? "N/A";
                        }

                        return (
                            <SView col={"xs-12"} row center>
                                <SView width={4} />
                                <SIconApp name={e.row?.icon || "Ajustes"} width={14} />

                                <SView width={4} />
                                <SView
                                    flex
                                    style={{
                                        ...e.textStyle,
                                        paddingHorizontal: 2,
                                        paddingVertical: 3,
                                        borderRadius: 4
                                    }}
                                >
                                    <SText fontSize={11}>{texto}</SText>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="empresa_tipo_pago"
                    wrap
                    label="DETALLE"
                    width={200}
                    data={e => e.row?.empresa_tipo_pago ?? 0}
                />








                {/* #14b77f
                #e6950c
                #7c44b4
                https://pinetools.com/es/obtener-colores-imagen */}
                {/* dedicar a crear mejores filtros de susursales, n cosas
                menu que lleve a comprbante
                menu que te muestre el vaucher
                elc caja fecha apertura */}


                <DinamicTable.Col
                    key="moneda_02"
                    wrap
                    label="MONTO"
                    width={90}
                    color={STheme.color.danger}
                    data={e => e.row?.monto ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#47a0ff33", color: "blue" }}
                    format={e => (!e.data ? "" : e.row?.moneda.observacion + " " + SMath.formatMoney(e.data))}

                // customComponent={e => {
                //     return (
                //         <SView col={"xs-12"} row center>
                //             {e.data < 0 ? <SIconApp name='Egreso' width={10} /> : <SIconApp name='Ingreso' width={10} />}
                //             <SText fontSize={11} color={e.data < 0 ? STheme.color.danger : STheme.color.text} >{e.data}</SText>
                //         </SView>
                //     );
                // }}

                />

                <DinamicTable.Col
                    key="moneda_01"
                    wrap
                    center
                    label="TIPO CAMBIO"
                    width={50}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#47a0ff33" }}

                    data={e => e.row?.moneda.tipo_cambio ?? 0}
                />




                <DinamicTable.Col
                    key="moneda_05"
                    wrap
                    label="MONTO BASE"
                    width={90}
                    data={e => (e.row?.moneda.tipo_cambio * e.row?.monto) ?? 0}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#818c97c7" }}
                    format={e => (!e.data ? "" : e.row?.moneda_base.observacion + " " + SMath.formatMoney(e.data))}
                />






                <DinamicTable.Col
                    key="vouchers"
                    wrap
                    center
                    label="VOUCHERS TOTALES"
                    width={80}
                    data={e => e.row?.vouchers?.length ?? 0}
                    customComponent={e => {
                        if (!e.data) return null;
                        return (
                            <SView col={"xs-12"} row center
                            onPress={() =>
                                PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, e.row?.vouchers)
                            }
                            >
                                <SText fontSize={12} color={STheme.color.text} >({e.data}) </SText>
                                <SIconApp name='iconLista' width={8} />
                            </SView>
                        );
                    }}
                />





                <DinamicTable.Col
                    key="estado_caja"
                    label="ESTADO CAJA"
                    width={80}
                    data={e => e.row?.estado_caja ?? "Desconocido"}
                    customComponent={e => {
                        const estado = e.row?.estado_caja ?? "Desconocido";
                        return (
                            <SView col={"xs-12"} row center padding={8}>
                                <SView
                                    padding={4}
                                    center
                                    row
                                    style={{
                                        backgroundColor: estado === "cerrada" ? "#503131ff" : "#2a533cff",
                                        borderColor: estado === "cerrada" ? "#ef4444" : "#22c45e",
                                        borderWidth: 1,
                                        borderRadius: 20,
                                    }}
                                >
                                    <SView
                                        width={6}
                                        height={6}
                                        style={{
                                            backgroundColor: estado === "cerrada" ? "#ef4545" : "#22c45e",
                                            borderRadius: 8,
                                        }}
                                    />
                                    <SText
                                        style={{
                                            textTransform: "uppercase",
                                            fontSize: 10,
                                            color: estado === "cerrada" ? "#ef4444" : "#22c45e",
                                        }}
                                    >
                                        {estado}
                                    </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />



                <DinamicTable.Col
                    key="admin"
                    label="CAJERO2"
                    width={120}
                    data={e => e.row?.cajero?.Nombres ?? "Sin cajero"}
                    customComponent={e => {
                        const key = e.row?.key_cajero;
                        const nombre = e.row?.cajero?.Nombres ?? "Sin cajero";
                        return key ? (
                            <SView col="xs-12" row center>
                                <SView
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 100,
                                        overflow: "hidden",
                                        backgroundColor: STheme.color.card + "66",
                                    }}
                                >
                                    <SImage
                                        src={`${SSocket.api.root}usuario/${key}`}
                                        style={{ resizeMode: "cover" }}
                                    />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={1} style={e.textStyle}>
                                    {nombre}
                                </SText>
                            </SView>
                        ) : (
                            <SText>Sin cajero</SText>
                        );
                    }}
                />
            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Historial de Movimientos / Transacciones" disableScroll>
                <SView width={260} center>
                    <DateTimeBetween
                        fecha_inicio={this.state.fecha_inicio}
                        fecha_fin={this.state.fecha_fin}
                        onChange={({ fecha_inicio, fecha_fin }) => {
                            // console.log("Fechas seleccionadas:", fecha_inicio, fecha_fin);
                            this.setState({ fecha_inicio, fecha_fin }, () => {
                                // Recargar los datos de la tabla al cambiar fechas
                                this.loadInitialData().then(data => {
                                    this.setState({ data });
                                    if (this.DinamicTable) {
                                        this.DinamicTable.loadData();
                                    }
                                });
                            });
                        }}
                    />
                </SView>
                {this.state.data.length === 0 ? (
                    <SView col="xs-12" center>
                        <SText>No hay datos disponibles</SText>
                    </SView>
                ) : (
                    this.renderTabla()
                )}
                <SHr h={16} />
            </SPage>
        );
    }
}