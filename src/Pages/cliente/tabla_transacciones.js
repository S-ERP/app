import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification, SLoad, SInput } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter2 from '../../Components/FechaFullFilter2';
import SIconApp from '../../Assets/SIconApp';
import SelectTipoPago from '../caja2/components/SelectTipoPago';

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
            selectedCuotas: {},

        };
        this.key = SNavigation.getParam("key");
    }

    RowWithImage = ({ keyEntity, label, srcPrefix, styleText }) => {
        if (!keyEntity) return null;
        return (
            <SView col={"xs-12"} center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={`${srcPrefix}${keyEntity}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={styleText}>{label}</SText>
            </SView>
        );
    }

    componentDidMount() {
        this.loadInitialData();
    }
    async loadInitialData() {
        try {
            const keyEmpresa = await MDL?.empresa?.select?.key;
            const keyCliente = this.key;
            const fecha_inicio = this.state.fecha_inicio;
            // const fecha_inicio = this.state.fecha_inicio;
            const fecha_fin = this.state.fecha_fin;

            if (!keyEmpresa || !keyCliente) return [];

            const ventas = await MDL.compra_venta.execute_function(
                "_get_detalles_bycliente2",
                [keyEmpresa, keyCliente, fecha_inicio, fecha_fin]
            );

            const cliente = await MDL.crm.cliente.getByKey(keyCliente);

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

            // 🔥 Fila de saldo anterior (puedes cambiar el valor dinámicamente)
            ventasEnriquecidas = [
                {
                    key: `saldo_anterior_${new Date().getTime()}`,
                    fecha_on: fecha_inicio,
                    tipo: "saldo",
                    descripcion: "Saldo anterior",
                    debe: 10,
                    haber: 0,
                    saldo: 0, // se recalcula abajo
                    moneda,
                    sucursal: {},
                    usuario: {},
                    almacen: {},
                    cliente: cliente || {}
                },
                ...ventasEnriquecidas
            ];

            // 🔥 CALCULAR SALDO ACUMULADO
            let saldoAcumulado = 0;

            ventasEnriquecidas = ventasEnriquecidas.map((item) => {
                const debe = item.debe || 0;
                const haber = item.haber || 0;

                saldoAcumulado += (debe - haber);

                return {
                    ...item,
                    saldo: saldoAcumulado
                };
            });

            const lastRow = ventasEnriquecidas[ventasEnriquecidas.length - 1];
            const saldo = lastRow?.saldo || 0;

            this.setState({
                cliente: cliente || {},
                moneda,
                ventasEnriquecidas,
                saldo,
            });

            console.clear();
            console.log("%c" + JSON.stringify(ventasEnriquecidas, null, 2), "color: #2ECC40; font-weight: bold;");
            console.log("%cSaldo final: " + saldo, "color: #2ECC40; font-weight: bold;");

            return ventasEnriquecidas;

        } catch (error) {
            console.error("Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos.");
            return [];
        }
    }

    mostrarTabla() {

        return (
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
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => (e?.index ?? 0) + 1} />
                <DinamicTable.Col key="fecha" label="Fecha" width={140} data={e => e?.row?.fecha_on ? new SDate(e.row.fecha_on).toString("dd/MM/yyyy") : ""} />
                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e?.row?.tipo || "-"} />
                <DinamicTable.Col key="detalle" label="Detalle" width={200} data={(e) => e?.row?.descripcion || "-"}

                    customComponent={(e) => {
                        const isSaldoAnterior = e?.row?.descripcion === "Saldo anterior";

                        return (
                            <SText
                                color={isSaldoAnterior ? '#fc0505' : STheme.color.text}
                                bold={isSaldoAnterior}
                            >
                                {e?.row?.descripcion || "-"}
                            </SText>
                        );
                    }}

                    footerComponent={() => (
                        <SView style={{ alignItems: "flex-end", paddingRight: 8 }}>
                            <SText bold>Total</SText>
                        </SView>
                    )}
                />
                <DinamicTable.Col
                    key="debe"
                    label="Debe"
                    width={100}
                    data={(e) => e?.row?.debe ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.data ? `${SMath.formatMoney(e.data || 0)}` : ""}
                    footerComponent={(e) => {
                        let total = 0;
                        e.dinamicTable.data.map(a => { total += a.debe || 0 });
                        return <SView style={{ alignItems: "center" }}><SText>{`${SMath.formatMoney(total || 0)}`}</SText></SView>
                    }}
                />
                <DinamicTable.Col
                    key="haber"
                    label="Haber"
                    width={100}
                    data={(e) => e?.row?.haber ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.data ? `${SMath.formatMoney(e.data || 0)}` : ""}
                    footerComponent={(e) => {
                        let total = 0;
                        e.dinamicTable.data.map(a => { total += a.haber || 0 });
                        return <SView style={{ alignItems: "center" }}><SText>{`${SMath.formatMoney(total || 0)}`}</SText></SView>
                    }}
                />
                <DinamicTable.Col
                    key="saldo"
                    label="Saldo"
                    width={120}
                    data={(e) => e?.row?.saldo ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => `${SMath.formatMoney(e.data || 0)}`}
                    footerComponent={(e) => {
                        const lastRow = e.dinamicTable.data[e.dinamicTable.data.length - 1];
                        const totalSaldo = lastRow?.saldo || 0;
                        return <SView style={{ alignItems: "flex-end", paddingRight: 8 }}><SText>{`${SMath.formatMoney(totalSaldo)}`}</SText></SView>
                    }}
                />
            </DinamicTable>
        );
    }

    async showVentaPopup() {
        const saldo = this.state.saldo || 0;
        let monto = 0;
        const moneda = this.state.moneda || {};
        const simboloBase = moneda?.observacion || 'BOB';



        try {
            // Verificar caja activa
            const activa = await MDL.caja.getActiva();
            if (!activa) {
                SNotification.send({
                    title: 'Caja no aperturada',
                    body: 'Abre la caja primero.',
                    color: STheme.color.danger,
                    time: 5000
                });
                return;
            }

            SelectTipoPago.openPopup({
                key_punto_venta: activa.key_punto_venta,
                key_moneda: moneda.key,
                montoMaximo: saldo,
                monedaSymbol: simboloBase,
                onSelect: (item, selectedCuotas = []) => {
                    const enviar = { tipos_pago: item, cuotas: cuotasData };
                    // item.monto_nacional
                    console.log("Amortización:", JSON.stringify(enviar));



                    // se hara un funcion para amortizar con ricky porque esta dificil

                    // SSocket.sendPromise({
                    //     service: "caja",
                    //     component: "caja_detalle",
                    //     type: "amortizarCuotaCompra",
                    //     data: enviar,
                    //     key_usuario: MDL.usuario.session?.key,
                    //     key_empresa: MDL.empresa.select?.key,
                    //     key_caja: MDL.caja.activa?.key,
                    // }).then(resp => {
                    //     if (resp?.estado === "exito") {
                    //         SNotification.send({ title: "Éxito", body: "Pago registrado.", color: STheme.color.success, time: 3000 });
                    //         // this.props.onSuccess?.();
                    //         if (this.props.onSuccess) this.props.onSuccess(resp)
                    //         SelectTipoPago.closePopup();
                    //     }
                    // }).catch(err => {
                    //     SNotification.send({ title: 'Error', body: "dd" + err?.message || 'Falló el pago.', color: STheme.color.danger });
                    // });


                    SPopup.close("popup-venta-completada");
                }
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
 
    registrarAmortizacion(monto) {
        const saldoActual = this.state.saldo || 0;
        const nuevoSaldo = saldoActual - monto;

        // console.clear();
        console.log("%c" + "saldo amortizar", `color: #2ECC40; font-weight: bold;`);
        console.log("%c" + "saldo " + saldoActual, `color: #2ECC40; font-weight: bold;`);
        console.log("%c" + "nuevo saldo " + nuevoSaldo, `color: #2ECC40; font-weight: bold;`);

        this.setState({ saldo: nuevoSaldo }, () => {
            if (this.DinamicTable) this.DinamicTable.loadData();
            SPopup.alert("Amortización realizada");
        });
    }

    render() {
        const { cliente } = this.state;

        return (
            <SPage title="Kardex Individual" disableScroll>
                <SView row col={"xs-12"}>
                    <SHr /><SHr />
                    <SView col={"xs-12"} row center style={{ flexWrap: "wrap", gap: 12 }}>
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
                    <SView col={"xs-12"} row>
                        <SText fontSize={15}>Cliente: {cliente?.nombres + " " + cliente?.apellidos || "-"}</SText>
                    </SView>
                </SView>
                <SHr height={10} />
                {this.mostrarTabla()}
                <SHr height={20} />

                <SView col={'xs-12'} center>
                    <SView col={'xs-12'} style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: STheme.color.lightGray + '66' }}>
                        <SView
                            col={'xs-12'}
                            onPress={() => {
                                if (!this.state.saldo || this.state.saldo <= 0) { SPopup.alert("No hay saldo pendiente"); return; }
                                this.showVentaPopup();
                            }}
                            backgroundColor={"red"}
                            style={{ padding: 12, borderRadius: 6, borderWidth: 1, borderColor: "blue" }}
                            center
                        >
                            <SView row center>
                                <SIconApp name="pagotarjeta" width={16} height={16} fill={STheme.color.text} />
                                <SView width={4} />
                                <SText color={STheme.color.text}>Amortizar</SText>
                            </SView>
                        </SView>
                    </SView>
                </SView>

                <SHr height={20} />
            </SPage>
        );
    }
}