import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SNavigation, SDate, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import { Dimensions } from 'react-native';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter2 from '../../Components/FechaFullFilter2';
import SIconApp from '../../Assets/SIconApp';
import SSocket from 'servisofts-socket';
import SelectTipoPagoCompra from '../caja2/components/SelectTipoPagoCompra';
import SInput2 from '../../Components/SForm2/SInput2';

export default class TablaTransaccionesProveedor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            moneda: null,
            proveedor: null,
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
            const compras = await MDL.compra_venta.execute_function("_get_detalles_bycliente44", [keyEmpresa, this.key, fecha_inicio_total, fecha_fin]);
            const proveedor = await MDL.crm.cliente.getByKey(this.key);

            const cuotas = await MDL.compra_venta.execute_function("_get_cuotas_pendientes", [keyEmpresa, this.key]);
            this.cuotasDetalle = cuotas || [];
            this.keysCuotas = this.cuotasDetalle.map(c => c.key_cuota);

            if (!compras || compras.length === 0) {
                this.setState({ proveedor: proveedor || {}, moneda: null, saldo: 0 });
                return [];
            }

            const [empresa, usuarios = [], almacenes = []] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.usuario.getByKeys([...new Set(compras.map(v => v?.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen(),
            ]);

            const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));

            let comprasEnriquecidas = compras.map((v, idx) => ({
                ...v,
                key: `${v?.key_compra_venta || 'row'}_${idx}`,
                moneda: monedasMap[v?.key_moneda] || {},
                sucursal: sucursalesMap[v?.key_sucursal] || {},
                usuario: usuariosMap[v?.key_usuario] || {},
                almacen: almacenesMap[v?.key_almacen] || {},
                proveedor: proveedor || {},
            }));

            const moneda = comprasEnriquecidas[0]?.moneda || null;
            let saldoAcumulado = 0;
            comprasEnriquecidas = comprasEnriquecidas.map((item) => {
                const debe = item.debe || 0;
                const haber = item.haber || 0;
                saldoAcumulado += (debe - haber);
                return { ...item, saldo: saldoAcumulado };
            });

            let saldoAnterior = 0;
            comprasEnriquecidas.forEach(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                if (fechaItem < fecha_inicio) {
                    saldoAnterior = item.saldo;
                }
            });

            let comprasFiltradas = comprasEnriquecidas.filter(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                return fechaItem >= fecha_inicio && fechaItem <= fecha_fin;
            });

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
            }

            const lastRow = comprasFiltradas[comprasFiltradas.length - 1];
            const saldo = lastRow?.saldo || 0;

            this.setState({
                proveedor: proveedor || {},
                moneda,
                saldo,
            });
            return comprasFiltradas;
        } catch (error) {
            console.error("Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos.");
            return [];
        }
    }

    formatMonto(value) {
        const sim = this.state.moneda?.observacion || 'Bs';
        const fmt = SMath.formatMoney(value || 0, 2);
        return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
    }

    footerBarStyle(align = 'center') {
        return {
            flex: 1,
            width: '100%',
            height: '100%',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderTopWidth: 2,
            borderTopColor: STheme.color.primary || '#1565c0',
            alignItems: align,
            justifyContent: 'center',
        };
    }

    esAmortizacionAnulable(row, dinamicTable) {
        const rows = dinamicTable?.dataFiltrada || [];
        const esUltimo = rows.length > 0 && rows[rows.length - 1]?.__original?.key === row?.key;
        const esAmortizacion = Number(row?.haber) > 0;
        return esUltimo && esAmortizacion;
    }

    renderMenuTransacciones(row, dinamicTable) {
        const RenderOption = ({ label, icon, iconProps, onPress }) => {
            return (
                <>
                    <SView col={"xs-11"} row center onPress={() => { if (onPress) onPress(); SPopup.close("popup_menu_transacciones_proveedor"); }}>
                        <SView col={"xs-2"} center height={32}>
                            <SIconApp name={icon} height={18} fill={iconProps?.fill || STheme.color.text} stroke={iconProps?.stroke} />
                        </SView>
                        <SView width={8} />
                        <SView flex> <SText fontSize={14}>{label}</SText> </SView>
                    </SView>
                    <SHr height={1} color={STheme.color.card} />
                </>
            );
        };
        const keyProveedor = row?.proveedor?.key || this.key;
        const groups = [
            {
                title: "CONSULTA",
                items: [
                    row?.key_compra_venta && {
                        label: "Ver detalle compra",
                        icon: "compraCarro",
                        onPress: () => { SNavigation.navigate("/venta/profile2", { pk: row.key_compra_venta }); },
                    },
                    keyProveedor && {
                        label: "Ver proveedor",
                        icon: "profile2",
                        onPress: () => { SNavigation.navigate("/cliente/perfil", { key: keyProveedor, tipo: "proveedor" }); },
                    },
                ].filter(Boolean),
            },
            {
                title: "GESTIÓN",
                items: [
                    this.esAmortizacionAnulable(row, dinamicTable) && {
                        label: "Anular Amortización",
                        icon: "eliminar",
                        iconProps: { fill: STheme.color.danger, stroke: STheme.color.danger },
                        onPress: () => {
                            SPopup.confirm({
                                title: 'Anular Amortización',
                                message: '¿Estás seguro de anular esta amortización?',
                                onPress: () => {
                                    SPopup.alert('Trabajando en la función de anulación...');
                                },
                            });
                        },
                    },
                ].filter(Boolean),
            },
        ].filter(group => group && group.items.length > 0);
        return (
            <SView col={"xs-12"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#66666699" }}>
                {groups.map((group, gi) => (
                    <SView key={gi} col={"xs-12"}>
                        <SView col={"xs-12"} style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 1 }}>
                            <SText color={STheme.color.text + "99"}>{group.title}</SText>
                        </SView>
                        {group.items.map((opt, i) => (<RenderOption key={i} {...opt} />))}
                        {gi !== groups.length - 1 && <SHr height={1} color={STheme.color.card} />}
                    </SView>
                ))}
            </SView>
        );
    }

    mostrarTabla() {
        return (
            <SView col={'xs-12'} style={{ width: 900, alignSelf: 'center' }} flex>
                <DinamicTable
                    ref={ref => (this.DinamicTable = ref)}
                    loadData={this.loadInitialData.bind(this)}
                    key="id"
                    language="es"
                    center
                    {...Config.table.applyTheme()}
                    keyExtractor={(e) => e?.key}
                    textTitleStyle={{ fontWeight: "bold" }}
                    style={{ flex: 1 }}
                    iconSize={22}
                    padding={8}
                    adjustColumnWidth
                    listFooterComponent={() => <SHr height={60} />}

                    hoverStyle={{ backgroundColor: STheme.color.card + "30" }}
                    buildRowStyle={({ item }) => item?.__original?.descripcion === "Saldo anterior" ? { backgroundColor: '#e8f4fd' } : {}}
                    renderHeaderActions={() => null}
                    renderNoResults={() => (
                        <SView col={"xs-12"} center padding={24}>
                            <SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron transacciones en el rango seleccionado.</SText>
                        </SView>
                    )}
                    onSelect={(e) => {
                        let top = e.evt.nativeEvent.pageY;
                        const h = Dimensions.get("window").height;
                        if (h < top + 300) top = h - 300;
                        SPopup.open({
                            key: "popup_menu_transacciones_proveedor",
                            type: "2",
                            content: (
                                <SView withoutFeedback style={{ position: "absolute", top, left: e.evt.nativeEvent.pageX, width: 250 }} center>
                                    {this.renderMenuTransacciones(e.row, e.dinamicTable)}
                                </SView>
                            )
                        });
                    }}
                >
                    <DinamicTable.Col key="index" label="N°" width={30} data={(e) => (e?.index ?? 0) + 1}
                        footerComponent={() => <SView style={this.footerBarStyle('center')} />}
                    />
                    <DinamicTable.Col key="fecha" label="Fecha" width={80} data={e => e?.row?.fecha_on ? new SDate(e.row.fecha_on).toString("dd/MM/yyyy") : ""}
                        footerComponent={() => <SView style={this.footerBarStyle('center')} />}
                    />
                    <DinamicTable.Col key="tipo" label="Tipo" width={80} data={(e) => e?.row?.tipo || "-"} customComponent={(e) => {
                        const isSaldoAnterior = e?.row?.tipo === "saldo";
                        return <SView style={{ padding: 2, borderRadius: 4, backgroundColor: isSaldoAnterior ? STheme.color.success + "44" : null, borderWidth: 1, borderColor: isSaldoAnterior ? STheme.color.success : "transparent" }} center >
                            <SText fontSize={10} style={{ textTransform: "uppercase" }} >{e.data}</SText>
                        </SView>
                    }}
                        footerComponent={() => <SView style={this.footerBarStyle('center')} />}
                    />

                    <DinamicTable.Col key="detalle" label="Detalle" width={340} data={(e) => e?.row?.descripcion || "-"}
                        customComponent={(e) => (
                            <SText color={STheme.color.text}>
                                {e?.row?.descripcion || "-"}
                            </SText>
                        )}
                        footerComponent={() => (
                            <SView style={this.footerBarStyle('flex-end')}>
                                <SText bold fontSize={13} color={STheme.color.text}>TOTAL</SText>
                            </SView>
                        )}
                    />
                    <DinamicTable.Col key="debe" label="Debe" width={100} data={(e) => e?.row?.debe ?? 0} cellStyle={{ alignItems: "flex-start" }}
                        format={(e) => e.data ? this.formatMonto(e.data) : ""}
                        footerComponent={(e) => {
                            let total = 0;
                            e.dinamicTable.data.map(a => { total += a.debe || 0 });
                            return <SView style={this.footerBarStyle('flex-start')}><SText bold fontSize={13} color={STheme.color.text}>{this.formatMonto(total)}</SText></SView>
                        }}
                    />
                    <DinamicTable.Col key="haber" label="Haber" width={100} data={(e) => e?.row?.haber ?? 0} cellStyle={{ alignItems: "flex-start" }}
                        format={(e) => e.data ? this.formatMonto(e.data) : ""}
                        footerComponent={(e) => {
                            let total = 0;
                            e.dinamicTable.data.map(a => { total += a.haber || 0 });
                            return <SView style={this.footerBarStyle('flex-start')}><SText bold fontSize={13} color={STheme.color.text}>{this.formatMonto(total)}</SText></SView>
                        }}
                    />
                    <DinamicTable.Col key="saldo" label="Saldo" width={120} data={(e) => e?.row?.saldo ?? 0} cellStyle={{ alignItems: "flex-end" }}
                        format={(e) => this.formatMonto(e.data)}
                        footerComponent={(e) => {
                            const lastRow = e.dinamicTable.data[e.dinamicTable.data.length - 1];
                            const totalSaldo = lastRow?.saldo || 0;
                            return (
                                <SView style={this.footerBarStyle('flex-end')}>
                                    <SText bold fontSize={14} color={STheme.color.primary || STheme.color.text}>{this.formatMonto(totalSaldo)}</SText>
                                </SView>
                            );
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
                        withoutFeedback
                        style={{ borderRadius: 20, overflow: "hidden", alignItems: "center" }}>
                        <SView col="xs-12" style={{ backgroundColor: STheme.color.success + "22", paddingVertical: 28, alignItems: "center" }}>
                            <SView style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: STheme.color.success, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                                <SIconApp name="pagotarjeta" width={26} height={26} fill="#fff" />
                            </SView>
                            <SText bold fontSize={20} center color={STheme.color.text}>Amortizar Deuda</SText>
                        </SView>

                        <SView col="xs-12" padding={24} style={{ alignItems: "center" }}>
                            <SView row col="xs-12" style={{ backgroundColor: STheme.color.card, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 20, alignItems: "center", justifyContent: "space-between" }}>
                                <SText fontSize={13} color={STheme.color.lightGray}>Saldo pendiente</SText>
                                <SText bold fontSize={16} color={STheme.color.text}>{this.formatMonto(saldo)}</SText>
                            </SView>

                            <SText fontSize={12} color={STheme.color.lightGray} style={{ alignSelf: "flex-start", marginBottom: 6 }}>Monto a pagar</SText>
                            <SView row col="xs-12" style={{ height: 46, borderRadius: 10, borderWidth: 1, borderColor: STheme.color.lightGray + "40", backgroundColor: STheme.color.card, alignItems: "center", paddingHorizontal: 12 }}>
                                <SText fontSize={12} color={STheme.color.lightGray} style={{ marginRight: 6 }}>{simboloBase}</SText>
                                <SView flex height>
                                    <SInput2
                                        type="money"
                                        style={{ width: "100%", textAlign: "right", fontSize: 14 }}
                                        placeholder="Ingrese monto"
                                        onChangeText={(val) => { monto = parseFloat(val) || 0; }}
                                    />
                                </SView>
                            </SView>
                            <SHr height={20} />
                            <SView row col="xs-12" style={{ gap: 12 }}>
                                <SView flex height={44} borderRadius={10} center backgroundColor={STheme.color.card} border={STheme.color.lightGray + "55"} onPress={() => SPopup.close("popup-compra-completada")}> <SText color={STheme.color.text}>Cancelar</SText> </SView>
                                <SView flex height={44} borderRadius={10} center
                                    backgroundColor={STheme.color.success}
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
            <SPage title="Kardex Individual Proveedor" disableScroll>

                <SView col={'xs-12'} center backgroundColor='transparent' row>
                    <SView col={'xs-12 md-7'} style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: STheme.color.lightGray + '66' }} >
                        <SHr height={20} />
                        <SView col={"xs-12"} row center >
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
                        <SHr height={20} />
                        <SView col={"xs-12"} row style={{ justifyContent: 'center' }}>
                            <SText fontSize={15} style={{ textAlign: 'left' }}>PROVEEDOR: {proveedorNombre}</SText>
                        </SView>
                    </SView>
                </SView>

                <SHr height={10} />
                {this.mostrarTabla()}

                <SHr height={20} />

                <SView col={'xs-12'} center backgroundColor='transparent' row>
                    <SView col={'xs-12 md-7'} style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: STheme.color.lightGray + '66' }} >
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
                </SView>
            </SPage>
        );
    }
}
