import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification, SLoad, SInput } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter2 from '../../Components/FechaFullFilter2';
import SIconApp from '../../Assets/SIconApp';
// import SelectTipoPago from '../caja2/components/SelectTipoPagoVenta';
import SSocket from 'servisofts-socket';
import ComprobanteRollo from '../../Components/PDF/compra/ComprobanteRollo';
import ComprobanteKardexIndividual from '../../Components/PDF/compra/ComprobanteKardexIndividual';
import SelectTipoPagoVenta from '../caja2/components/SelectTipoPagoCompra';

export default class TablaTransacciones extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            moneda: null,
            cliente: null,
            ventasEnriquecidas: null,
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
            const keyEmpresa = await MDL?.empresa?.select?.key;
            const fecha_inicio_total = "2024-01-01";
            const fecha_inicio = this.state.fecha_inicio;
            const fecha_fin = this.state.fecha_fin;
            if (!keyEmpresa || !this.key) return;
            const ventas = await MDL.compra_venta.execute_function("_get_detalles_bycliente4", [keyEmpresa, this.key, fecha_inicio_total, fecha_fin]);
            const cliente = await MDL.crm.cliente.getByKey(this.key);

            const cuotas = await MDL.compra_venta.execute_function("_get_cuotas_pendientes", [keyEmpresa, this.key]);
            this.cuotasDetalle = cuotas || [];
            this.keysCuotas = this.cuotasDetalle.map(c => c.key_cuota);

            // 
            // console.log("%cCUOTAS:", "color: #2ECC40; font-weight: bold;");
            // console.log(this.cuotasDetalle);



            if (!ventas || ventas.length === 0) {
                this.setState({ cliente: cliente || {}, moneda: null, saldo: 0 });
                return [];
            }

            const [empresa, usuarios = [], almacenes = []] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.usuario.getByKeys([...new Set(ventas.map(v => v?.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen(),
            ]);

            const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));

            let ventasEnriquecidas = ventas.map(v => ({
                ...v,
                moneda: monedasMap[v?.key_moneda] || {},
                sucursal: sucursalesMap[v?.key_sucursal] || {},
                usuario: usuariosMap[v?.key_usuario] || {},
                almacen: almacenesMap[v?.key_almacen] || {},
                cliente: cliente || {},
            }));

            const moneda = ventasEnriquecidas[0]?.moneda || null;
            let saldoAcumulado = 0;
            ventasEnriquecidas = ventasEnriquecidas.map((item) => {
                const debe = item.debe || 0;
                const haber = item.haber || 0;
                saldoAcumulado += (debe - haber);
                return { ...item, saldo: saldoAcumulado };
            });

            let saldoAnterior = 0;
            ventasEnriquecidas.forEach(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                if (fechaItem < fecha_inicio) {
                    saldoAnterior = item.saldo;
                }
            });

            let ventasFiltradas = ventasEnriquecidas.filter(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                return fechaItem >= fecha_inicio && fechaItem <= fecha_fin;
            });

            if (saldoAnterior !== 0) {
                ventasFiltradas = [
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
                        cliente: cliente || {}
                    },
                    ...ventasFiltradas
                ];
            }

            const lastRow = ventasFiltradas[ventasFiltradas.length - 1];
            const saldo = lastRow?.saldo || 0;

            this.setState({
                cliente: cliente || {},
                moneda,
                ventasEnriquecidas: ventasFiltradas,
                saldo,
            });
            return ventasFiltradas;
        } catch (error) {
            console.error("Error en loadInitialData:", error);
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
                            const isSaldoAnterior = e?.row?.descripcion === "Saldo anterior";
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

    async showVentaPopup() {
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
                key: "popup-venta-completada",
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
                            <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text} onPress={() => SPopup.close("popup-venta-completada")}> <SText color={STheme.color.background}>Cancelar</SText> </SView>
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
                                    SelectTipoPagoVenta.openPopup({
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
                                                    SelectTipoPagoVenta.closePopup();
                                                }
                                            }).catch(err => {
                                                SNotification.send({ title: 'Error', body: "dd" + err?.message || 'Falló el pago.', color: STheme.color.danger });
                                            });
                                            SelectTipoPagoVenta.closePopup();
                                            SPopup.close("popup-venta-completada");
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
        const { cliente } = this.state;
        const clienteNombre = `${cliente?.nombres || ''} ${cliente?.apellidos || ''}` || '-';
        return (
            <SPage title="Kardex Individual" disableScroll>
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
                        <SText fontSize={15} style={{ textAlign: 'left' }}>CLIENTE: {clienteNombre}</SText>
                    </SView>
                </SView>
                <SHr height={10} />
                {this.mostrarTabla()}
                <SHr height={20} />
                <SView col={'xs-12'} style={{ width: 820, paddingVertical: 12, alignSelf: 'center', borderTopWidth: 1, borderColor: STheme.color.lightGray + '66' }}>
                    <SView row col={'xs-12'} style={{ justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                        <SView
                            onPress={() => ComprobanteKardexIndividual.imprimir(this.key, this.state.fecha_inicio, this.state.fecha_fin)}
                            backgroundColor={STheme.color.card}
                            style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.primary || '#1565c0' }}
                            center
                        >
                            <SView row center>
                                <SIcon name="File" width={16} height={16} fill={STheme.color.primary || '#1565c0'} />
                                <SView width={6} />
                                <SText color={STheme.color.primary || '#1565c0'} bold>DESCARGAR PDF</SText>
                            </SView>
                        </SView>

                        {this.state.saldo > 0 && (
                            <SView
                                onPress={() => this.showVentaPopup()}
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