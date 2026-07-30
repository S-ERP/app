import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification, SLoad, SInput } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter2 from '../../Components/FechaFullFilter2';
import SIconApp from '../../Assets/SIconApp';
import SSocket from 'servisofts-socket';
import SelectTipoPagoCompra from '../caja2/components/SelectTipoPagoCompra';

export default class TablaTransaccionesProveedor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            moneda: null,
            proveedor: null,
            comprasEnriquecidas: null,
            saldo: 0,
        };
        this.key = SNavigation.getParam("key");
        this.keysCuotas = [];
    }

    componentDidMount() {
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            console.log("========== [tabla_transacciones proveedor] loadInitialData: INICIO ==========");
            const keyEmpresa = await MDL?.empresa?.select?.key;
            const fecha_inicio_total = "2024-01-01";
            const fecha_inicio = this.state.fecha_inicio;
            const fecha_fin = this.state.fecha_fin;
            console.log("[loadInitialData] this.key (key_proveedor):", this.key);
            console.log("[loadInitialData] keyEmpresa:", keyEmpresa);
            console.log("[loadInitialData] fecha_inicio_total:", fecha_inicio_total, "fecha_inicio:", fecha_inicio, "fecha_fin:", fecha_fin);
            if (!keyEmpresa || !this.key) {
                console.log("[loadInitialData] ABORTA: falta keyEmpresa o this.key");
                return;
            }

            console.log("[loadInitialData] llamando execute_function _get_detalles_bycliente4 con params:", [keyEmpresa, this.key, fecha_inicio_total, fecha_fin]);
            const compras = await MDL.compra_venta.execute_function("_get_detalles_bycliente4", [keyEmpresa, this.key, fecha_inicio_total, fecha_fin]);
            console.log("[loadInitialData] resultado _get_detalles_bycliente4 (compras):", compras);

            const proveedor = await MDL.crm.cliente.getByKey(this.key);
            console.log("[loadInitialData] resultado MDL.crm.cliente.getByKey (proveedor):", proveedor);

            console.log("[loadInitialData] llamando execute_function _get_cuotas_pendientes con params:", [keyEmpresa, this.key]);
            const cuotas = await MDL.compra_venta.execute_function("_get_cuotas_pendientes", [keyEmpresa, this.key]);
            console.log("[loadInitialData] resultado _get_cuotas_pendientes (cuotas):", cuotas);
            this.cuotasDetalle = cuotas || [];
            this.keysCuotas = this.cuotasDetalle.map(c => c.key_cuota);
            console.log("[loadInitialData] this.keysCuotas:", this.keysCuotas);

            if (!compras || compras.length === 0) {
                console.log("[loadInitialData] SIN COMPRAS: seteando estado vacío y saliendo");
                this.setState({ proveedor: proveedor || {}, moneda: null, saldo: 0 });
                return [];
            }

            console.log("[loadInitialData] cargando empresa, usuarios y almacenes en paralelo...");
            const [empresa, usuarios = [], almacenes = []] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.usuario.getByKeys([...new Set(compras.map(v => v?.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen(),
            ]);
            console.log("[loadInitialData] empresa:", empresa);
            console.log("[loadInitialData] usuarios:", usuarios);
            console.log("[loadInitialData] almacenes:", almacenes);

            const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));
            console.log("[loadInitialData] sucursalesMap:", sucursalesMap);
            console.log("[loadInitialData] monedasMap:", monedasMap);
            console.log("[loadInitialData] usuariosMap:", usuariosMap);
            console.log("[loadInitialData] almacenesMap:", almacenesMap);

            let comprasEnriquecidas = compras.map(v => ({
                ...v,
                moneda: monedasMap[v?.key_moneda] || {},
                sucursal: sucursalesMap[v?.key_sucursal] || {},
                usuario: usuariosMap[v?.key_usuario] || {},
                almacen: almacenesMap[v?.key_almacen] || {},
                proveedor: proveedor || {},
            }));
            console.log("[loadInitialData] comprasEnriquecidas (antes de saldo):", comprasEnriquecidas);

            const moneda = comprasEnriquecidas[0]?.moneda || null;
            console.log("[loadInitialData] moneda base tomada de la primera fila:", moneda);
            let saldoAcumulado = 0;
            comprasEnriquecidas = comprasEnriquecidas.map((item) => {
                const debe = item.debe || 0;
                const haber = item.haber || 0;
                saldoAcumulado += (debe - haber);
                return { ...item, saldo: saldoAcumulado };
            });
            console.log("[loadInitialData] comprasEnriquecidas (con saldo acumulado):", comprasEnriquecidas);

            let saldoAnterior = 0;
            comprasEnriquecidas.forEach(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                if (fechaItem < fecha_inicio) {
                    saldoAnterior = item.saldo;
                }
            });
            console.log("[loadInitialData] saldoAnterior (previo a fecha_inicio):", saldoAnterior);

            let comprasFiltradas = comprasEnriquecidas.filter(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                return fechaItem >= fecha_inicio && fechaItem <= fecha_fin;
            });
            console.log("[loadInitialData] comprasFiltradas (rango de fechas):", comprasFiltradas);

            if (saldoAnterior !== 0) {
                comprasFiltradas = [
                    {
                        key: `saldo_anterior_${new Date().getTime()}`,
                        fecha_on: "",
                        tipo: "saldo",
                        descripcion: "Saldo anterior",
                        debe: 0,
                        haber: 0,
                        saldo: saldoAnterior,
                        moneda,
                        sucursal: {},
                        usuario: {},
                        almacen: {},
                        proveedor: proveedor || {}
                    },
                    ...comprasFiltradas
                ];
                console.log("[loadInitialData] se insertó fila 'Saldo anterior'. comprasFiltradas final:", comprasFiltradas);
            }

            const lastRow = comprasFiltradas[comprasFiltradas.length - 1];
            const saldo = lastRow?.saldo || 0;
            console.log("[loadInitialData] lastRow:", lastRow, "saldo final:", saldo);

            this.setState({
                proveedor: proveedor || {},
                moneda,
                comprasEnriquecidas: comprasFiltradas,
                saldo,
            });
            console.log("========== [tabla_transacciones proveedor] loadInitialData: FIN OK ==========");
            return comprasFiltradas;
        } catch (error) {
            console.error("[loadInitialData] ERROR:", error);
            SPopup.alert("Error al cargar los datos.");
            return [];
        }
    }

    mostrarTabla() {
        return (
            <SView col={'xs-12'} style={{ width: 950, alignSelf: 'center' }} flex>

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
                    <DinamicTable.Col key="index" label="N°" width={30} data={(e) => (e?.index ?? 0) + 1} cellStyle={(e) => e?.row?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}} />
                    <DinamicTable.Col key="fecha" label="Fecha" width={80} data={e => e?.row?.fecha_on ? new SDate(e.row.fecha_on).toString("dd/MM/yyyy") : ""} cellStyle={(e) => e?.row?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}} />
                    <DinamicTable.Col key="tipo" label="Tipo" width={80} data={(e) => e?.row?.tipo || "-"} cellStyle={(e) => e?.row?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}} customComponent={(e) => {
                        const isSaldoAnterior = e?.row?.tipo === "saldo";
                        return <SView style={{ padding: 2, borderRadius: 4, backgroundColor: isSaldoAnterior ? STheme.color.success + "44" : null, borderWidth: 1, borderColor: isSaldoAnterior ? STheme.color.success : "transparent" }} center >
                            <SText fontSize={10} style={{ textTransform: "uppercase" }} >{e.data}</SText>
                        </SView>
                    }}
                    />

                    <DinamicTable.Col key="detalle" label="Detalle" width={340} data={(e) => e?.row?.descripcion || "-"}
                        customComponent={(e) => {
                            return (
                                <SText color={STheme.color.text}>
                                    {e?.row?.descripcion || "-"}
                                </SText>
                            );
                        }}
                        cellStyle={(e) => e?.row?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}}
                        footerComponent={() => (
                            <SView style={{ alignItems: "flex-end", paddingRight: 8 }}>
                                <SText bold>Total</SText>
                            </SView>
                        )}
                    />
                    <DinamicTable.Col key="debe" label="Debe" width={100} data={(e) => SMath.formatMoney(e?.row?.debe) ?? 0} cellStyle={(e) => ({ alignItems: "flex-end", ...(e?.row?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}) })}
                        format={(e) => e.data ? `${SMath.formatMoney(e.data || 0)}` : ""}
                        footerComponent={(e) => {
                            let total = 0;
                            e.dinamicTable.data.map(a => { total += a.debe || 0 });
                            return <SView ><SText color={STheme.color.lightGray}>{`${SMath.formatMoney(total || 0)}`}</SText></SView>
                        }}
                    />
                    <DinamicTable.Col key="haber" label="Haber" width={100} data={(e) => e?.row?.haber ?? 0} cellStyle={(e) => ({ alignItems: "flex-end", ...(e?.row?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}) })}
                        format={(e) => e.data ? `${SMath.formatMoney(e.data || 0)}` : ""}
                        footerComponent={(e) => {
                            let total = 0;
                            e.dinamicTable.data.map(a => { total += a.haber || 0 });
                            return <SView><SText color={STheme.color.lightGray} >{`${SMath.formatMoney(total || 0)}`}</SText></SView>
                        }}
                    />
                    <DinamicTable.Col key="saldo" label="Saldo" width={120} data={(e) => SMath.formatMoney(e?.row?.saldo) ?? 0} cellStyle={(e) => ({ alignItems: "flex-end", ...(e?.row?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}) })}
                        customComponent={(e) => {
                            return <SView><SText style={{ alignItems: "flex-end", paddingRight: 8, fontSize: 12 }}>{`${SMath.formatMoney(e?.data || 0)}`}</SText></SView>
                        }}
                        format={(e) => `${SMath.formatMoney(e.data || 0)}`}
                        footerComponent={(e) => {
                            const lastRow = e.dinamicTable.data[e.dinamicTable.data.length - 1];
                            const totalSaldo = lastRow?.saldo || 0;
                            return <SView style={{ alignItems: "flex-end", paddingRight: 8 }}><SText>{`${SMath.formatMoney(totalSaldo || "0")}`}</SText></SView>
                        }}
                    />
                </DinamicTable>
            </SView>
        );
    }

    async showPagoPopup() {
        try {
            const activa = await MDL.caja.getActiva();
            const saldo = this.state.saldo || 0;
            let monto = 0;
            const moneda = this.state.moneda || {};
            const simboloBase = moneda?.observacion || 'BOB';
            const cuotas = this.keysCuotas || [];
            if (!activa) {
                SNotification.send({
                    title: 'Caja no aperturada',
                    body: 'Abre la caja primero.',
                    color: STheme.color.danger,
                    time: 5000
                });
                return;
            }
            SPopup.open({
                key: "popup-compra-completada",
                content: (
                    <SView col="xs-11 md-4"
                        backgroundColor={STheme.color.background}
                        padding={24}
                        withoutFeedback
                        style={{ borderRadius: 16, alignItems: "center" }}>
                        <SText bold fontSize={20} center style={{ marginBottom: 8 }}>¡Amortizar Deuda!</SText>
                        <SText fontSize={14} center style={{ marginBottom: 16 }}>Saldo pendiente: {SMath.formatMoney(saldo)}</SText>
                        <SInput col={"xs-12"} type='money2' placeholder="Ingrese monto" onChangeText={(val) => { monto = parseFloat(val) || 0; }} />
                        <SHr height={16} />
                        <SView row col="xs-12" style={{ gap: 12 }}>
                            <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text} onPress={() => SPopup.close("popup-compra-completada")}> <SText color={STheme.color.background}>Cancelar</SText> </SView>
                            <SView flex height={40} borderRadius={8} center
                                backgroundColor={STheme.color.card}
                                border={STheme.color.success}
                                onPress={() => {
                                    if (monto <= 0) {
                                        SNotification.send({
                                            title: "Monto inválido",
                                            body: "El monto debe ser mayor a 0",
                                            color: STheme.color.danger,
                                            time: 4000
                                        });
                                        return;
                                    }
                                    if (monto > saldo) {
                                        SNotification.send({
                                            title: "Monto inválido",
                                            body: "No puede ser mayor al saldo",
                                            color: STheme.color.danger,
                                            time: 4000
                                        });
                                        return;
                                    }
                                    SelectTipoPagoCompra.openPopup({
                                        key_punto_venta: activa.key_punto_venta,
                                        key_moneda: moneda.key,
                                        montoMaximo: monto,
                                        monedaSymbol: simboloBase,
                                        onSelect: (item) => {
                                            const enviar = { tipos_pago: item, cuotas: cuotas };
                                            SSocket.sendPromise({
                                                service: "caja",
                                                component: "caja_detalle",
                                                type: "amortizarCuotaCompra",
                                                data: enviar,
                                                key_usuario: MDL.usuario.session?.key,
                                                key_empresa: MDL.empresa.select?.key,
                                                key_caja: MDL.caja.activa?.key,
                                            }).then(resp => {
                                                if (resp?.estado === "exito") {
                                                    SNotification.send({ title: "Éxito: Pago registrado", body: "Pago registrado.", color: STheme.color.success, time: 3000 });
                                                    this.DinamicTable.loadData();
                                                    if (this.props.onSuccess) this.props.onSuccess(resp)
                                                    SelectTipoPagoCompra.closePopup();
                                                }
                                            }).catch(err => {
                                                SNotification.send({ title: 'Error', body: err?.message || 'Falló el pago.', color: STheme.color.danger });
                                            });
                                            SelectTipoPagoCompra.closePopup();
                                            SPopup.close("popup-compra-completada");
                                        }
                                    });
                                }}>
                                <SText>Confirmar</SText>
                            </SView>
                        </SView>
                    </SView>
                )
            });
        } catch (e) {
            console.error(e);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo verificar la caja.',
                color: STheme.color.danger,
                time: 5000
            });
        }
    }

    render() {
        const { proveedor } = this.state;
        const proveedorNombre = `${proveedor?.nombres || ''} ${proveedor?.apellidos || ''}` || '-';
        return (
            <SPage title="Kardex Proveedor" disableScroll>
                <SView row col={"xs-12"}>
                    <SHr /><SHr />
                    <SView col={"xs-12"} row center style={{ flexWrap: "wrap", gap: 12 }} border={"transparent"} >
                        <SView col={"xs-12 sm-7.5"} row center>
                            <FechaFullFilter2
                                label="fecha"
                                key_opciones="hoy"
                                onChange={e => {
                                    this.state.fecha_inicio = e.fecha_inicio;
                                    this.state.fecha_fin = e.fecha_fin;
                                    this.DinamicTable.loadData();
                                }}
                            />
                        </SView>
                    </SView>
                    <SHr /><SHr height={10} />
                    <SView col={"xs-12"} row style={{ justifyContent: 'center' }}>
                        <SText fontSize={15} style={{ textAlign: 'left' }}>PROVEEDOR: {proveedorNombre}</SText>
                    </SView>
                </SView>
                <SHr height={10} />
                {this.mostrarTabla()}
                <SHr height={20} />
                <SView col={'xs-12'} style={{ width: 820, paddingVertical: 12, alignSelf: 'center', borderTopWidth: 1, borderColor: STheme.color.lightGray + '66' }}>
                    <SView row col={'xs-12'} style={{ justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                        {this.state.saldo > 0 && (
                            <SView
                                onPress={() => this.showPagoPopup()}
                                backgroundColor={STheme.color.lightGray + '66'}
                                style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.primary || '#1565c0' }}
                                center
                            >
                                <SView row center>
                                    <SIconApp name="pagotarjeta" width={16} height={16} fill={STheme.color.text} />
                                    <SView width={6} />
                                    <SText color={STheme.color.text} bold>AMORTIZAR</SText>
                                </SView>
                            </SView>
                        )}
                    </SView>
                </SView>
                <SHr height={20} />
            </SPage>
        );
    }
}
