import React from "react";
import { SDate, SImage, SMath, SNavigation, SNotification, SPage, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import SSocket from "servisofts-socket";
export default class root extends React.Component {

    async loadData() {
        try {
            const [costos, empresa, clientes, almacen, modelo, modelo_cliente, tipo_costo] = await Promise.all([
                MDL.compra_venta.getAllCostos(),
                MDL.empresa.getFull(),
                MDL.crm.cliente.getAll(),
                MDL.inventario.getAllAlmacen(),
                MDL.inventario.getAllModelo(),
                MDL.inventario.getAllModeloCliente(),
                MDL.inventario.getAllTipoCosto(),
            ]);

            if (!Array.isArray(costos) || costos.length === 0) return [];

            const keysUsuarios = [...new Set(costos.map(e => e.key_usuario).filter(Boolean))];
            const usuariosArr = keysUsuarios.length ? await MDL.usuario.getByKeys(keysUsuarios) : [];

            const usuariosMap = Object.fromEntries((usuariosArr || []).map(u => [u.key, u]));
            const clientesMap = Object.fromEntries((clientes || []).map(c => [c.key, c]));
            const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
            const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
            const modeloClienteMap = Object.fromEntries((modelo_cliente || []).map(m => [m.key, m]));
            const tipoCostoMap = Object.fromEntries((tipo_costo || []).map(m => [m.key, m]));
            const almacenMap = Object.fromEntries((almacen || []).map(m => [m.key, m]));
            const modeloMap = Object.fromEntries((modelo || []).map(m => [m.key, m]));

            return costos.map(e => {
                const informacion = modeloClienteMap[e.key_costo] ?? null;
                return {
                    ...e,
                    key_modelo: informacion?.key_modelo ?? null,
                    usuario: usuariosMap[e.key_usuario] ?? null,
                    cliente: clientesMap[informacion?.key_cliente] ?? null,
                    moneda: monedasMap[e.key_moneda] ?? null,
                    sucursal: sucursalesMap[e.key_sucursal] ?? null,
                    almacen: almacenMap[e.key_almacen] ?? null,
                    empresa,
                    modeloCliente: informacion,
                    tipoCosto: tipoCostoMap[informacion?.key_tipo_costo] ?? null,
                    modelo: modeloMap[informacion?.key_modelo] ?? null,
                };
            });
        } catch (error) {
            console.error("Error en loadData:", error);
            return [];
        }
    }

    onSelect(e) {
        FloatMenu.open({
            e: e.evt,
            label: e.row.descripcion,
            options: [
                {
                    label: "Ver venta",
                    icon: <SIconApp name="Menu" />,
                    onPress: () => SNavigation.navigate("/venta/profile2", { pk: e.row.key_venta })
                },
                !e.row?.key_compra && {
                    label: "Generar Compra",
                    icon: <SIconApp name="Menu" />,
                    onPress: () => {
                        SSocket.sendPromise({
                            service: "compra_venta",
                            component: "compra_venta_detalle_costo",
                            type: "generarCompra",
                            key_costo: e.row.key,
                        })
                            .then(() => {
                                SNotification.send({
                                    title: "Compra generada",
                                    body: "La compra se generó correctamente.",
                                    color: STheme.color.success,
                                    time: 5000,
                                });
                                this.table.loadData();
                                this.forceUpdate();
                            })
                            .catch(mensaje => {
                                console.error("Error al generar compra:", JSON.stringify(mensaje.error)); // Para debug
                                SNotification.send({
                                    title: "Error al generar compra",
                                    body: JSON.stringify(mensaje.error),
                                    color: STheme.color.danger,
                                    time: 5000,
                                });
                            });
                    }
                }
            ].filter(Boolean)
        });
    }

    renderUsuario(usuario = {}) {
        const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }} >
                    {usuario?.key && <SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ resizeMode: "cover" }} />}
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>{nombre}</SText>
            </SView>
        );
    }

    renderCliente(cliente = {}) {
        const nombre = `${cliente?.nombres || "Sin"} ${cliente?.apellidos || "usuario"}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }} >
                    {cliente?.key && <SImage src={`${SSocket.api.root}usuario/${cliente.key}`} style={{ resizeMode: "cover" }} />}
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>{nombre}</SText>
            </SView>
        );
    }

    renderSucursal(sucursal = {}) {
        if (!sucursal?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }} >
                    <SImage src={`${SSocket.api.empresa}sucursal/${sucursal.key}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>{sucursal?.descripcion || "Sucursal"}</SText>
            </SView>
        );
    }

    renderAlmacen(almacen = {}) {
        if (!almacen?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }} >
                    <SImage src={`${SSocket.api.empresa}sucursal/${almacen.key}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>{almacen?.descripcion || "almacen"}</SText>
            </SView>
        );
    }

    renderModelo(modelo = {}) {
        if (!modelo?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden" }} card>
                    <SImage src={`${SSocket?.api?.inventario}modelo/.128${modelo?.key}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>{modelo?.descripcion || "modelo"}</SText>
            </SView>
        );
    }

    renderEmpresa(empresa = {}) {
        if (!empresa?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }} >
                    <SImage src={`${SSocket.api.empresa}empresa/${empresa?.key}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>{empresa?.razon_social || "empresa"}</SText>
            </SView>
        );
    }

    render() {
        return (
            <SPage title="Costos" disableScroll>
                <SText>{JSON.stringify(this.state?.costos)}</SText>
                <DinamicTable
                    {...Config.table.applyTheme()}
                    loadData={this.loadData}
                    onSelect={this.onSelect.bind(this)}
                    ref={ref => this.table = ref}
                    loadInitialState={async () => ({
                        sorters: [{ key: "fecha_on", order: "desc", type: "date" }],
                        cols: {
                            key_compra_venta_detalle: { hidden: true },
                            key_asiento_contable: { hidden: true },
                            key_compra: { hidden: true },
                            key: { hidden: true },
                            key_costo: { hidden: true }
                        }
                    })}
                >
                    <DinamicTable.Col key="index" label="#" width={40} data={e => e.index + 1} />
                    <DinamicTable.Col key="descripcion" label="Descripción" data={e => e.row.descripcion} width={300} />
                    <DinamicTable.Col key="key" label="key" data={e => e.row.key} />
                    <DinamicTable.Col key="key_asiento_contable" width={140} label="key_asiento_contable" data={e => e.row.key_asiento_contable} />
                    <DinamicTable.Col key="key_compra" label="key_compra" data={e => e.row.key_compra} />
                    <DinamicTable.Col key="key_compra_venta_detalle" label="key_compra_venta" data={e => e.row.key_compra_venta_detalle} />
                    <DinamicTable.Col key="key_costo" label="key_costo" data={e => e.row.key_costo} />
                    {/* <DinamicTable.Col key="es_compra_generada" label="es_compra_generada" data={e => e.row.es_compra_generada} /> */}
                    <DinamicTable.Col key="key_sucursal" label="Sucursal" width={130} data={e => e.row?.key_sucursal ?? ""} customComponent={e => this.renderSucursal(e.row?.sucursal)} />
                    <DinamicTable.Col key="key_almacen" label="Almacen" width={130} data={e => e.row?.key_almacen ?? ""} customComponent={e => this.renderAlmacen(e.row?.almacen)} />
                    <DinamicTable.Col key="key_cliente" label="Cliente" width={140} data={e => e.row?.key_cliente ?? ""} customComponent={e => this.renderCliente(e.row?.cliente)} />
                    <DinamicTable.Col key="monto" label="Monto" width={100} data={e => e.row?.monto} wrap
                        customComponent={e => (
                            <SView row center>
                                <SText flex numberOfLines={0}>{e.row?.monto ? SMath.formatMoney(e.row?.monto) : ""} {e.row?.moneda?.observacion ?? ""}</SText>
                            </SView>
                        )}
                    />
                    <DinamicTable.Col key="tipo" label="Tipo" data={e => e.row.tipo} width={60} />
                    <DinamicTable.Col key="tipo_pago" label="Tipo pago" data={e => e.row.tipo_pago} width={80} />
                    <DinamicTable.Col key="_estado" label="Estado" width={150} cellStyle={{ alignItems: "center" }} data={e => e.row.key_compra}
                        customComponent={e => {
                            const keyCompra = e.row?.key_compra;
                            const color = keyCompra ? STheme.color.success : STheme.color.gray;
                            return (
                                <SView backgroundColor={color} width={60} height={18} borderRadius={4} center>
                                    <SText fontSize={11} color="#fff" bold>{(keyCompra ? "COMPRA GENERADA" : "").toUpperCase()}</SText>
                                </SView>
                            );
                        }}
                    />
                    <DinamicTable.Col key="tipo_costo_descripcion" label="Tipo Costo" data={e => e.row.tipoCosto?.descripcion} />
                    <DinamicTable.Col key="key_modelo" label="Modelo" width={180} data={e => e.row?.key_modelo ?? ""} customComponent={e => this.renderModelo(e.row?.modelo)} />
                    <DinamicTable.Col key="fecha_on" label="F.Creación" width={110} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
                    <DinamicTable.Col key="key_usuario" label="Administrador" width={100} data={e => e.row?.key_usuario ?? ""} customComponent={e => this.renderUsuario(e.row?.usuario)} />
                </DinamicTable>
            </SPage>
        );
    }
}