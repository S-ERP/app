import React, { Component } from 'react';
import { SView, SPage, SHr, SScrollView2, STheme, SDate, SText, SImage, SPopup, SMath, SNavigation, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import DateTimeBetween from '../../Components/DateTimeBetween';
import SIconApp from '../../Assets/SIconApp';
import FloatMenu from '../../Components/FloatMenu';
import PopupSeeVoucher from '../caja2/components/PopupSeeVoucher';
import { color } from 'three/examples/jsm/nodes/Nodes';
import { Linking } from 'react-native';

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
                return "#4dbe52ff"; // Verde intenso y confiable
            case "VENTA":
                return "#3683dbff"; // Azul fuerte (profesional y moderno)
            case "COMPRA":
                return "#e0883fff"; // Naranja intenso (enérgico pero amigable)
            default:
                return "#979797ff"; // Gris claro por defecto (neutral)
        }
    }

    colorTipoPago(estado) {
        switch (estado?.toUpperCase()) {
            case "CAJA":
                return "#388E3C"; // Verde más profundo (confianza)
            case "CREDITO":
                return "#8E24AA"; // Violeta más saturado (moderno, llamativo)
            case "BANCO":
                return "#FB8C00"; // Naranja vivo (acceso rápido y claro)
            default:
                return "#B0BEC5"; // Gris azulado claro (neutro y elegante)
        }
    }


    async loadInitialData() {
        try {
            console.log("📦 Cargando movimientos de caja...");
            const empresaKey = MDL.empresa.select?.key;
            if (!empresaKey) throw new Error("Empresa no seleccionada.");
            const { fecha_inicio, fecha_fin } = this.state;
            const movimientos = await MDL.caja.getAllMovimientosCajasByEmpresa(empresaKey, fecha_inicio, fecha_fin);
            if (!Array.isArray(movimientos)) {
                console.warn("No se recibieron movimientos válidos.");
                return [];
            }
            const empresa = await MDL.empresa.getFull();
            const base = empresa.monedas.find(a => a.tipo == "base");
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
            // SPopup.alert("Error al cargar los movimientos. Intenta nuevamente.");
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
                {...Config.table.applyTheme()}

                onSelect={(e) => {
                    if (!e.row) {
                        console.warn('No row data provided for selection');
                        return;
                    }

                    const menuOptions = [
                        // View Vouchers
                        {
                            label: 'Ver Vouchers',
                            icon: <SIconApp name="Arrow" fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                const vouchers = Array.isArray(e.row?.vouchers) ? e.row.vouchers : [];
                                if (vouchers.length === 0) {
                                    SPopup.alert('No hay vouchers disponibles para este movimiento.');
                                    return;
                                }
                                PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, vouchers);
                            },
                        },
                        // View Accounting Voucher (Conditional)
                        ...(e.row?.key_comprobante ? [{
                            label: 'Ver Comprobante Contable',
                            icon: <SIconApp name="Ajustes" fill="#e4e4e4ff" width={16} />,
                            onPress: () => {


                                if (e.row?.codigo_comprobante === 0) {
                                    SPopup.alert('No hay comprobantes.');
                                    return;
                                }
                                SNavigation.navigate('/contabilidad/asiento_contable/profile', { pk: e.row.key_comprobante });
                            },
                        }] : []),
                    ];
                    FloatMenu.open({
                        e: e.evt,
                        label: 'Opciones',
                        options: menuOptions,
                    });
                }}

                loadInitialState={async () => ({
                    // sorters: [{ key: "fecha_apertura", order: "desc", type: "date" }],
                    sorters: [{ key: "fecha_movimiento", order: "desc", type: "date" }],
                })}
                {...Config.table.applyTheme()}

                listFooterComponent={() => {
                    return <SHr height={100} />

                }}

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
                            <SView col="xs-12" row center  >
                                <SView width={28}   >
                                    <SView style={{ width: 20, height: 20, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                        <SImage src={SSocket.api.empresa + "empresa/" + e.row?.key_empresa} />
                                    </SView>
                                    <SView style={{ width: 20, position: "absolute", left: 5 }}>
                                        <SView style={{ width: 20, height: 20, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                            <SImage src={`${SSocket.api.empresa}sucursal/${key}`} style={{ resizeMode: "cover" }} />
                                        </SView>
                                    </SView>
                                </SView>
                                <SText flex numberOfLines={1} style={e.textStyle}> {descripcion} </SText>
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
                    key="fecha_apertura"
                    label="APERTURA CAJA"
                    width={130}
                    center
                    dataType="date"
                    data={e => (e.row?.caja_fecha_on ? new SDate(e.row.caja_fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />
                <DinamicTable.Col
                    key="fecha_cierre"
                    label="CIERRE CAJA"
                    width={130}
                    center
                    dataType="date"
                    data={e => (e.row?.caja_fecha_cierre ? new SDate(e.row.caja_fecha_cierre, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />
                <DinamicTable.Col
                    key="fecha_movimiento"
                    label="FECHA TRANSACCIÓN"
                    width={140}
                    center
                    dataType="date"
                    data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                    dateFormat="yyyy-MM-dd hh:mm:ss"
                />

                <DinamicTable.Col
                    key="codigo_comprobante"
                    wrap
                    label="CÓDIGO COMPROBANTE"
                    width={100}
                    data={e => e.row?.codigo_comprobante ?? 0}
                    customComponent={e => {
                        if (!e.row?.codigo_comprobante) return null;
                        return (
                            <SView col={"xs-12"} center height={20}   >
                                <SView col={"xs-12"} row center height={20}   >
                                    <SView width={70} center style={{
                                        ...e.textStyle,
                                        borderWidth: 1, borderColor: STheme.color.link,
                                        borderRadius: 4
                                    }}
                                        onPress={() => {
                                            SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: e.row?.key_comprobante })
                                        }}
                                    > <SText color={STheme.color.link} underLine fontSize={12}> {e.row?.codigo_comprobante} </SText>
                                    </SView>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="tipo"
                    wrap
                    label="TIPO DE OPERACIÓN"
                    width={90}
                    data={e => e.row?.tipo ?? 0}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} center height={20}   >
                                <SView col={"xs-12"} row center height={20}   >
                                    <SView width={60} center style={{
                                        ...e.textStyle,
                                        backgroundColor: this.colorTipoOperacion(e.data) || STheme.color.card,
                                        borderWidth: 1, borderColor: this.colorTipoOperacion(e.data) || STheme.color.card,
                                        borderRadius: 4
                                    }}> <SText fontSize={12} style={{ textTransform: "capitalize" }} >{e.data}</SText>
                                    </SView>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="descripcion"
                    wrap
                    label="DESCRIPCIÓN"
                    width={180}
                    data={e => e.row?.descripcion ?? 0}
                />

                {/* <DinamicTable.Col
                    key="key_tipo_pago"
                    wrap
                    label="MÉTODO DE PAGO"
                    width={80}
                    data={e => e.row?.key_tipo_pago ?? ""}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} center height={20}   >
                                <SView col={"xs-12"} row center height={20}   >
                                    <SView width={60} center style={{
                                        ...e.textStyle,
                                        backgroundColor: this.colorTipoPago(e.row?.key_tipo_pago) || STheme.color.card,
                                        borderWidth: 1, borderColor: this.colorTipoPago(e.row?.key_tipo_pago) || STheme.color.card,
                                        borderRadius: 4
                                    }}> <SText fontSize={12}>{e.row?.key_tipo_pago}</SText>
                                    </SView>
                                </SView>
                            </SView>
                        );
                    }}
                /> */}

                <DinamicTable.Col
                    key="key_tipo_pagov2"
                    wrap label="TIPO DE PAGO"
                    width={110} data={e => e.row?.tag_tipo_pago ?? ""}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} row center>
                                <SView width={4} />
                                <SIconApp name={e.row?.icon || "Ajustes"} width={14} />
                                <SView width={4} />
                                <SView flex style={{ ...e.textStyle, paddingHorizontal: 2, paddingVertical: 3, borderRadius: 4 }} >
                                    <SText fontSize={12}>{e.data}</SText>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="empresa_tipo_pago"
                    wrap
                    label="DETALLE"
                    width={220}
                    data={e => e.row?.empresa_tipo_pago ?? 0}
                />





                <DinamicTable.Col
                    key="tag_transaccion_"
                    label="TAG"
                    width={90}
                    wrap
                    center
                    data={e => e.row?.tag_movimiento ?? 0}
                    customComponent={e => {
                        return (
                            <SView col="xs-12" row  >
                                <SIconApp name={e.data} width={12} height={12} />
                                <SView width={4} />
                                <SText fontSize={12} color={STheme.color.text}> {e.data} </SText>
                            </SView>
                        );
                    }}
                />



                <DinamicTable.Col
                    key="moneda_info"
                    wrap label="MONEDA"
                    width={90}
                    color={STheme.color.danger}
                    data={e => e.row?.moneda?.descripcion ?? 0}
                />


                <DinamicTable.Col
                    key="monto_total"
                    wrap label="MONTO"
                    width={90}
                    color={STheme.color.danger}
                    data={e => {
                        const monto = e.row?.monto ?? 0;
                        return SMath.formatMoney(monto, 2);
                    }}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#a8b1bb73", color: "blue" }}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} style={{ alignItems: "flex-end" }} >
                                <SText fontSize={12} color={e.row?.monto > 0 ? STheme.color.text : STheme.color.danger} >{e.row.moneda.observacion} {e.data}</SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="tipo_cambio"
                    wrap
                    center
                    label="TIPO CAMBIO"
                    width={50}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#a8b1bb73" }}
                    data={e => e.row?.moneda.tipo_cambio ?? 0}
                />

                <DinamicTable.Col
                    key="monto_base"
                    wrap label="MONTO BASE"
                    width={90}
                    data={e => {
                        const monto = e.row?.monto ?? 0;
                        const tipoCambio = e.row?.moneda?.tipo_cambio ?? 1;
                        return SMath.formatMoney((monto * tipoCambio), 2);
                    }}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#a8b1bb73" }}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} style={{ alignItems: "flex-end" }} >
                                <SText fontSize={12} color={e.row?.monto > 0 ? STheme.color.text : STheme.color.danger} >{e.row.moneda_base.observacion} {e.data}</SText>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="moneda_info2"
                    wrap label="MONEDA BASE"
                    width={90}
                    color={STheme.color.danger}
                    data={e => e.row?.moneda_base?.descripcion ?? 0}
                />



                <DinamicTable.Col key="vouchers" wrap center label="VOUCHERS TOTALES" width={80} data={e => e.row?.vouchers?.length ?? 0} customComponent={e => {
                    if (!e.data) return null; return (<SView col={"xs-12"} row center onPress={() =>
                        PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, e.row?.vouchers)} > <SText fontSize={12} color={STheme.color.text} >({e.data}) </SText> <SIconApp name='iconLista' width={8} /> </SView>);
                }} />



                <DinamicTable.Col key="voucherdsds" wrap center label="DOCUMENTOS" width={120}
                    data={(e) => (e.row.vouchers ?? []).map(p => p)}
                    customComponent={(e) => (
                        <SView row>
                            {(e.row.vouchers ?? []).map((p, index) => (
                                <SView key={index} style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4, marginRight: 4, }}
                                    onPress={() => {
                                        console.log("📦 VOUCHER..." + JSON.stringify(p));
                                        const url = `${SSocket.api.root}empresa/${e.row.key_empresa}/voucher/${e.row.key}/${p.name}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;
                                        Linking.openURL(url);
                                    }}
                                >
                                    <SText fontSize={10} numberOfLines={1}>Voucher {index + 1}</SText>
                                    {/* <SText fontSize={10} numberOfLines={1}>  {p.name ?? "Sin nombre"}  </SText> */}
                                </SView>
                            ))}
                        </SView>
                    )}
                />




                <DinamicTable.Col
                    key="estado_caja"
                    label="ESTADO CAJA"
                    width={100}
                    data={e => e.row?.estado_caja ?? "Desconocido"}
                    customComponent={e => {
                        const estado = e.row?.estado_caja ?? "Desconocido";
                        const isCerrada = estado === "Cerrada";
                        const color = isCerrada ? "#ef4444" : "#22c55e";
                        const bgColor = isCerrada ? "#503131ff" : "#2a533cff";

                        return (
                            <SView col={"xs-12"} center>
                                <SView padding={4} row center style={{ backgroundColor: bgColor, borderColor: color, borderWidth: 1, borderRadius: 20, }} >
                                    <SView center width={6} height={6} style={{ backgroundColor: color, borderRadius: 8, marginRight: 2, }} />
                                    <SText style={{ textTransform: "uppercase", fontSize: 11, color: color, }} > {estado} </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col
                    key="admin"
                    label="CAJERO"
                    width={120}
                    data={e => e.row?.cajero?.Nombres ?? "Sin cajero"}
                    customComponent={e => {
                        const key = e.row?.key_cajero;
                        const nombre = e.row?.cajero?.Nombres ?? "Sin cajero";

                        return key ? (
                            <SView col="xs-12" row center>
                                <SView
                                    width={20}
                                    height={20}
                                    style={{
                                        borderRadius: 100,
                                        overflow: "hidden",
                                        backgroundColor: STheme.color.card + "66",
                                        marginRight: 6,
                                    }}
                                >
                                    <SImage
                                        src={`${SSocket.api.root}usuario/${key}`}
                                        style={{ resizeMode: "cover", width: "100%", height: "100%" }}
                                    />
                                </SView>
                                <SText flex numberOfLines={1} style={e.textStyle}>
                                    {nombre}
                                </SText>
                            </SView>
                        ) : (
                            <SText>Sin cajero</SText>
                        );
                    }}
                />

            </DinamicTable >
        );
    }

    render() {
        return (
            <SPage title="Historial de Movimientos / Transacciones" disableScroll>
                <SHr height={8} />
                <SView width={260} center>
                    <DateTimeBetween
                        fecha_inicio={this.state.fecha_inicio}
                        fecha_fin={this.state.fecha_fin}
                        onChange={({ fecha_inicio, fecha_fin }) => {
                            this.setState({ fecha_inicio, fecha_fin }, () => {
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
                <SHr height={8} />

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