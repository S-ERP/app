import React, { Component } from 'react';
import MDL from '../../../MDL';
import { SDate, SHr, SIcon, SImage, SLanguage, SMath, SNavigation, SNotification, SPage, SPopup, SStorage, SText, STheme, SView } from 'servisofts-component';
// import Config from '../../Config';
import { DinamicTable } from 'servisofts-table';
import Model from '../../../Model';
import Config from '../../../Config';
import SSocket from 'servisofts-socket';

const StorageGetItem = (key) => {
    return new Promise((resolve, reject) => {
        SStorage.getItem(key, (resp) => {
            if (!resp) reject("No existe el item");
            resolve(JSON.parse(resp));
        })
    })
}

export default class DetalleTabla extends Component {

    static openPopup = (props: { F_Descarga?: any, lUsuario_id?: any, valor: any, estado: any, tipo: "gestor" | null, key_sucursal?: string, fecha_inicio?: string, fecha_fin?: string }) => {
        SPopup.open({
            key: "popup_detalleTabla",
            content: <SView col={"xs-12"}
                style={{
                    maxheight: 620,
                    maxHeight: "100%",
                    // maxWidth: 1280,
                    borderRadius: 4,
                    borderWidth: 1,
                    overflow: "hidden",
                    borderColor: STheme.color.lightGray + "66",
                }}
                height={620} padding={10}
                withoutFeedback backgroundColor={STheme.color.background}>
                <DetalleTabla {...props} />
            </SView>
        })
    }
    // static PERMISO = "ver"
    constructor(props) {
        super(props);
        this.state = {
        };
        this.F_Descarga = this.props.F_Descarga ?? SNavigation.getParam("F_Descarga", false);
        this.valor = this.props.valor ?? SNavigation.getParam("valor", false);
        this.estado = this.props.estado ?? SNavigation.getParam("estado", false);
        this.key = this.props.key_sucursal ?? this.props.keySucursal ?? SNavigation.getParam("key_sucursal", false) ?? SNavigation.getParam("key", false);
        this.fecha_inicio = this.props.fecha_inicio ?? SNavigation.getParam("fecha_inicio", false);
        this.fecha_fin = this.props.fecha_fin ?? SNavigation.getParam("fecha_fin", false);
        console.log("props en DetalleTabla:", props);
        console.log("F_Descarga", this.F_Descarga);
        console.log("valor", this.valor);
        console.log("estado", this.estado);
        console.log("key", this.key);
        console.log("fecha_inicio", this.fecha_inicio);
        console.log("fecha_fin", this.fecha_fin);
    }

    async loadInitialData() {
        try {
            const registros = await MDL.compra_venta.getTransaccion("venta", this.fecha_inicio || "2025-01-01", this.fecha_fin || "2030-09-05");
            if (!registros) throw new Error("No se encontraron registros.");
            const empresa = await MDL.empresa.getFull();
            if (!empresa) throw new Error("No se pudo obtener la empresa.");
            const sucursales = empresa.sucursales || [];
            const ventas = Object.values(registros).filter(cv => cv.tipo === "venta" && cv.key_sucursal === this.key);
            if (ventas.length === 0) throw new Error("No se encontraron ventas.");
            const keysUsuarios = [];
            ventas.forEach(cv => {
                if (cv.key_usuario && !keysUsuarios.includes(cv.key_usuario)) {
                    keysUsuarios.push(cv.key_usuario);
                }
            });
            const proveedores = await MDL.inventario.proveedor.getAllProveedor();
            if (!proveedores) throw new Error("No se pudieron obtener proveedores.");
            const clientes = await MDL.crm.cliente.getAll();
            if (!clientes) throw new Error("No se pudieron obtener clientes.");
            const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
            const usuariosMap = Array.isArray(usuarios)
                ? Object.fromEntries(usuarios.map(u => [u.key, u]))
                : usuarios || {};
            let totales = {};
            try {
                totales = Model.compra_venta_detalle.Action.getTotales({ key_compra_venta: ventas[0]?.key }) || {};
            } catch (e) {
                console.error("No se pudieron obtener los totales de la primera venta:", e);
            }
            const ventasEnriquecidas = await Promise.all(
                ventas.map(async (cv) => {
                    return {
                        ...cv,
                        moneda: empresa.monedas?.find(m => m.key === cv.key_moneda) || {},
                        sucursal: sucursales.find(s => s?.key === cv?.key_sucursal) || {},
                        usuario: usuariosMap[cv?.key_usuario] || {},
                        empresa,
                        proveedor: proveedores.find(p => p.key === cv.key_proveedor) || {},
                        cliente: clientes.find(c => c?.key === cv.key_cliente) || {},
                        subtotal: totales?.subtotal || "0",
                    };
                })
            );
            console.log("Ventas lista:", ventasEnriquecidas);
            return ventasEnriquecidas;
        } catch (error) {
            console.error("❌ Error en loadInitialData:", error?.message || error, error);
            SPopup.alert("Error al cargar los datos. Intenta nuevamente.");
            return [];
        }
    }

    validarFecha = (fecha_) => {
        let fecha = new Date(fecha_);
        if (!isNaN(fecha.getTime())) {
            let opcionesFecha = { day: '2-digit', month: '2-digit', year: '2-digit' };
            let opcionesHora = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            let fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFecha).format(fecha);
            let horaFormateada = new Intl.DateTimeFormat('es-ES', opcionesHora).format(fecha);
            return !fecha_ ? "" : `${fechaFormateada} ${horaFormateada}`;
        } else {
            return "";
        }
    }

    // loadExportState = async (instance) => {
    //     const exportState = JSON.parse(JSON.stringify(instance.getExportState()))
    //     console.log("exportState", exportState);

    //     const ver_madres = MDL.usuario.getPermiso({ url: URLPAGE, code: "ver_madres" })
    //     const ver_hijas = MDL.usuario.getPermiso({ url: URLPAGE, code: "ver_hijas" })

    //     if (!ver_madres && !!ver_hijas) {
    //         exportState.filters.push({
    //             col: "cantidad_hijas",
    //             type: "number",
    //             operator: "<=",
    //             value: 0
    //         })
    //     } else if (!!ver_madres && !ver_hijas) {
    //         exportState.filters.push({
    //             col: "cantidad_hijas",
    //             type: "number",
    //             operator: ">",
    //             value: 0
    //         })
    //     } else if (!ver_madres && !ver_hijas) {

    //         throw new Error("No tienes permisos para ver expediciones");

    //     }
    //     const permiso_ver = MDL.usuario.getPermisoColumEstado({ url: URLPAGE, })

    //     exportState.filters.push({
    //         col: "sDescripcion",
    //         type: "string",
    //         operator: "contains",
    //         value: permiso_ver
    //     })
    //     console.log("permiso_ver", permiso_ver);

    //     if (MDL.usuario.session.restrictions.key_clients) {
    //         if (MDL.usuario.session.restrictions.key_clients.length > 0) {
    //             exportState.filters.push({
    //                 col: "lCliente_id",
    //                 type: "string",
    //                 operator: "=",
    //                 value: MDL.usuario.session.restrictions.key_clients
    //             })
    //         }
    //     }
    //     if (MDL.usuario.session.restrictions.key_transportistas) {
    //         if (MDL.usuario.session.restrictions.key_transportistas.length > 0) {
    //             exportState.filters.push({
    //                 col: "lTransportista_id",
    //                 type: "string",
    //                 operator: "=",
    //                 value: MDL.usuario.session.restrictions.key_transportistas
    //             })
    //         }
    //     }
    //     return exportState;
    // }


    mostrarTabla() {
        const wrap = true;
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={async () => {
                    return this.loadInitialData();
                }}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}


                // headerStyle={{
                // backgroundColor:STheme.color.danger,
                // paddingLeft:50,
                // marginLeft:20,
                // paddingHorizontal: 8,
                // height: 28,
                // alignContent: "center",
                // alignItems: "center",
                // }}

                // headerTextStyle={{
                //     height: 40,
                //     alignContent: "center",
                //     textAlign: "center",
                //     fontSize: 14,
                //     textTransform: "uppercase",
                //     paddingLeft: 10,
                // }}

                selectType="multiple"
            // keyExtractor={(e) => e.key}
            // onSelect={(e) => {
            //     let top = e.evt.nativeEvent.pageY;
            //     const h = Dimensions.get("window").height;
            //     if (h < top + 300) {
            //         top = h - 300;
            //     }
            //     SPopup.open({
            //         key: "popup_menu_ventas",
            //         type: "2",
            //         content: <SView withoutFeedback style={[{ position: "absolute", top: top, left: e.evt.nativeEvent.pageX, width: 250, }]} center>
            //             {this.renderMenuVentas(e.row)}
            //         </SView>
            //     })
            // }}
            // loadInitialState={async () => {
            //     return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
            // }}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"fecha_on"} label="Fecha" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" /><DinamicTable.Col key="nrofactura" label="Nro. Factura" width={100} data={(e) => e.row?.factura?.nro_factura}
                    customComponent={e => <>
                        {(e.row?.factura?.nro_factura) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="cliente" label="Cliente" width={100} data={(e) => e.row?.cliente?.nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.cliente?.key) ?
                            <SView col={"xs-12"} center row onPress={() => {
                                SNavigation.navigate("/cliente/perfil", { key: e.row?.cliente?.key });
                            }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33", }} border={STheme.color.text} center     >
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.cliente?.key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.cliente?.nombres}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="nit" label="NIT / CI" width={100} data={(e) => e.row?.factura?.nit ?? ""} />
                <DinamicTable.Col key="razon_social" label="Razón social" width={100} data={(e) => e.row?.factura?.razon_social ?? ""} />
                <DinamicTable.Col key="sucursal" label="Sucursal" width={180} data={(e) => e.row?.sucursal?.descripcion}
                    customComponent={e => <>
                        {(e.row?.key_sucursal) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33" }} border={STheme.color.card} center     >
                                    <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.sucursal?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />


                <DinamicTable.Col key="admin" label="Vendedor" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => <>
                        {(e.row?.key_usuario) ?
                            <SView col={"xs-12"} center row>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.text + "33" }} border={STheme.color.text} center     >
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.usuario?.Nombres}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key="tipo_pago" wrap label="Tipo Pago" width={80}
                    data={(e) => e.row?.tipo_pago ?? ""}
                    customComponent={e => {
                        const tipoPagoMap = {
                            "contado": { color: "#2563eb", label: "Contado" },
                            "credito": { color: "#16a34a", label: "Crédito" },
                            "transferencia": { color: "#6b7280", label: "Transferencia" },
                        };
                        const estilo = tipoPagoMap[e.data?.toLowerCase()] || { color: STheme.color.lightGray, label: e.data };
                        return (
                            <>
                                {(e.row?.tipo_pago) ?
                                    <SView col={"xs-12"} center row>
                                        <SView backgroundColor={estilo.color} style={{ borderRadius: 4, padding: 5 }}>
                                            <SText color={STheme.color.text} fontSize={10}>{estilo.label}</SText>
                                        </SView>
                                    </SView> : null}
                            </>
                        );
                    }}
                />
                <DinamicTable.Col key="estado_venta" label="Estado Venta" width={120} center data={(e) => e.row?.facturar ? "Facturado" : "No facturada"}
                    customComponent={e => {
                        const facturado = Boolean(e.row?.facturar);
                        return <SView col={"xs-12"} center row>
                            <SView style={{ borderRadius: 4, backgroundColor: facturado ? "#16a34a" : "#6b7280", padding: 5, }}>
                                <SText center style={{ color: STheme.color.text, fontSize: 11, fontWeight: "bold" }}>
                                    {facturado ? "Facturado" : "No facturada"}
                                </SText>
                            </SView>
                        </SView>
                    }}
                />
                <DinamicTable.Col key="estado_pago" wrap label="Estado Pago" width={80}
                    data={(e) => {
                        if (e.row?.cuotas_en_mora?.monto > 0) {
                            return "En Mora";
                        }
                        if (e.row?.cuotas?.total <= e.row?.monto_amortizado) {
                            return "Pagado";
                        }
                        return "Al Día";
                    }}
                    customComponent={(e) => {
                        const statesTipo = {
                            "Al Día": { color: "#f59e0b", label: "Al Día" },
                            "En Mora": { color: "#dc2626", label: "En Mora" },
                            "Pagado": { color: "#16a34a", label: "Pagado" },
                        }[e.data] || {};
                        return <SView row center>
                            <SView backgroundColor={statesTipo?.color} style={{ borderRadius: 4, padding: 5 }}>
                                <SText color={STheme.color.text} fontSize={10}>{statesTipo?.label}</SText>
                            </SView>
                        </SView>
                    }}
                />


                <DinamicTable.Col key="cuf" label="CUF" width={100} data={(e) => e.row?.factura?.cuf ?? ""}
                    customComponent={e => <>
                        {(e.row?.facturar) ?
                            <SView col={"xs-12"} center row>
                                <SView width={5} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.data}</SText>
                            </SView> : null}
                    </>}
                />

                <DinamicTable.Col key="leyenda" label="Leyenda" width={100} data={(e) => e.row?.factura?.leyenda ?? ""} />
                <DinamicTable.Col key="detalles_" label="Detalle" width={220} data={(e) => (e.row?.detalles ?? []).map(d => d.descripcion)} customComponent={(e) => (<SView col> {(e.row?.detalles ?? []).map((d, index) => (<SText key={index} fontSize={11}>• {d.descripcion} {d.precio_unitario_base} {e.row.moneda.observacion} x{d.cantidad}</SText>))} </SView>)} />
                <DinamicTable.Col key="cuotas_total" label="Total" wrap bold width={80}
                    data={(e) => (e.row?.cuotas.total ? e.row.cuotas.total : "0")}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.row?.moneda?.observacion + " " + SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col key="cuotas_cantidad" label="# Cuotas" width={60} cellStyle={{
                    alignItems: "center"
                }} data={(e) => e.row?.cuotas.cantidad ?? ""} />
                <DinamicTable.Col wrap key="cuotas_cantidad_mora" label="# Cuotas en Mora" width={60} cellStyle={{
                    alignItems: "center",
                    backgroundColor: STheme.color.danger + "33"
                }}
                    data={(e) => e.row?.cuotas_en_mora.cantidad ?? ""}
                />
                <DinamicTable.Col key="moneda" label="Moneda" wrap width={60}
                    data={(e) => e.row?.moneda?.descripcion ?? ""}
                />
                <DinamicTable.Col key="monto_amortizado" wrap label="Monto Pagado" width={60} data={(e) => e.row?.monto_amortizado ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.success + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="monto_deuda" wrap label="Deuda total" width={60}
                    data={(e) => (e.row?.cuotas?.total ?? 0) - (e.row?.monto_amortizado ?? 0) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.warning + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} /><DinamicTable.Col wrap key="en_mora" label="Monto en Mora" width={60} data={(e) => e.row?.cuotas_en_mora.monto ?? ""}
                        cellStyle={{
                            alignItems: "flex-end",
                            backgroundColor: STheme.color.danger + "33"
                        }}
                        format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col key="cuotas_total_base" wrap label="Monto Base" width={60}
                    data={(e) => (e.row?.cuotas.total_base ? e.row.cuotas.total_base : "0")}
                    cellStyle={{
                        alignItems: "flex-end"
                    }}
                    format={(e) => SMath.formatMoney(e.data)}
                />
                <DinamicTable.Col key="monto_amortizado_base" wrap label="Monto Pagado Base" width={60} data={(e) => e.row?.monto_amortizado_base ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.success + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col key="monto_deuda_base" wrap label="Deuda total Base" width={60}
                    data={(e) => (e.row?.cuotas?.total_base ?? 0) - (e.row?.monto_amortizado_base ?? 0) ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.warning + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)} />
                <DinamicTable.Col wrap key="en_mora_base" label="Monto en Mora Base" width={60} data={(e) => e.row?.cuotas_en_mora.monto_base ?? ""}
                    cellStyle={{
                        alignItems: "flex-end",
                        backgroundColor: STheme.color.danger + "33"
                    }}
                    format={(e) => !e.data ? "" : SMath.formatMoney(e.data)}
                />
            </DinamicTable>
        );
    }

    render() {
        const colorOrigen = STheme.color.success + "33";
        const colorDestino = STheme.color.danger + "33";
        const e = {
            data: {
                sDescripcion: "ANUNCIADA",
            }

        }
        const wrap = true;
        // return <SPageMenu disableScroll>
        return <SPage disableScroll preventBack title={"Detalle"}
            icon={<SIcon name='Mpizarra' fill={STheme.color.text} />}
            navBarContent={<SView flex row>
                <SView flex />
                <SView width={8} />
            </SView>}
        >
            {this.mostrarTabla()}
            <SHr height={20} />
        </SPage>
    }
}
