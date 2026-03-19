import React from "react";
import { SDate, SImage, SMath, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import SSocket from "servisofts-socket";
export default class root extends React.Component {

    async loadData() {
        try {
            const [costos, empresa, clientes, modelo_cliente] = await Promise.all([
                MDL.compra_venta.getAllCostos(),
                MDL.empresa.getFull(),
                MDL.crm.cliente.getAll(),
                MDL.inventario.getAllModeloCliente(),
            ]);

            if (!Array.isArray(costos) || costos.length === 0) {
                console.warn("No hay costos o formato inválido");
                return [];
            }

            const keysUsuarios = [
                ...new Set(
                    costos
                        .map(e => e.key_usuario)
                        .filter(Boolean)
                )
            ];

            const usuariosArr = keysUsuarios.length
                ? await MDL.usuario.getByKeys(keysUsuarios)
                : [];
            const usuariosMap = Object.fromEntries(
                (usuariosArr || []).map(u => [u.key, u])
            );
            const clientesMap = Object.fromEntries(
                (clientes || []).map(c => [c.key, c])
            );
            const monedasMap = Object.fromEntries(
                (empresa?.monedas || []).map(m => [m.key, m])
            );
            const sucursalesMap = Object.fromEntries(
                (empresa?.sucursales || []).map(s => [s.key, s])
            );
            const modeloClienteMap = Object.fromEntries(
                (modelo_cliente || []).map(m => [m.key, m])
            );
            const dataMejorada = costos.map(e => {
                const informacion = modeloClienteMap[e.key_costo] ?? null; // primero lo obtenemos
                return {
                    ...e,
                    usuario: usuariosMap[e.key_usuario] ?? null,
                    cliente: clientesMap[informacion?.key_cliente] ?? null, // luego lo usamos
                    moneda: monedasMap[e.key_moneda] ?? null,
                    sucursal: sucursalesMap[e.key_sucursal] ?? null,
                    empresa,
                    informacion,
                };
            });

            return dataMejorada;
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
                    onPress: () => {
                        SNavigation.navigate("/venta/profile2", { pk: e.row.key_venta });
                    }
                },
                {
                    label: "Generar Compra",
                    icon: <SIconApp name="Menu" />,
                    onPress: () => {
                        SSocket.sendPromise({
                            service: "compra_venta",
                            component: "compra_venta_detalle_costo",
                            type: "generarCompra",
                            key_costo: e.row.key,
                        })
                    }
                }
            ]
        })
    }

    renderUsuario(usuario = {}) {
        const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    {usuario?.key ? (
                        <SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ resizeMode: "cover" }} />
                    ) : null}
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
                    {nombre}
                </SText>
            </SView>
        );
    }

    renderCliente(usuario = {}) {
        const nombre = `${usuario?.nombres || "Sin"} ${usuario?.apellidos || "usuario"}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    {usuario?.key ? (
                        <SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ resizeMode: "cover" }} />
                    ) : null}
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}>
                    {nombre}
                </SText>
            </SView>
        );
    }

    renderSucursal(sucursal = {}) {
        if (!sucursal?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    <SImage
                        src={`${SSocket.api.empresa}sucursal/${sucursal.key}`}
                        style={{ resizeMode: "cover" }}
                    />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}> {sucursal?.descripcion || "Sucursal"} </SText>
            </SView>
        );
    }

    renderEmpresa(empresa = {}) {
        if (!empresa?.key) return null;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    <SImage src={`${SSocket.api.empresa}empresa/${empresa?.key}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 10 }}> {empresa?.razon_social || "empresa"} </SText>
            </SView>
        );
    }

    render() {
        return <SPage title={"Costos"} disableScroll>
            <SText>{JSON.stringify(this.state?.costos)}</SText>
            <DinamicTable
                {...Config.table.applyTheme()}
                loadData={this.loadData}
                onSelect={this.onSelect.bind(this)}
                loadInitialState={async () => {
                    return {
                        cols: {
                            "key_compra_venta_detalle": { hidden: true },
                            "key_costo": { hidden: true }
                        }
                    }
                }}
            >
                {/* <DinamicTable.Col key={"key"} label="key" data={e => e.row.key} /> */}
                <DinamicTable.Col key="key_sucursal" label="sucursal" width={130} data={(e) => e.row?.key_sucursal ?? ""} customComponent={e => this.renderSucursal(e.row?.sucursal)} />
                <DinamicTable.Col key="key_cliente" label="Cliente" width={140} data={(e) => e.row?.key_cliente ?? ""} customComponent={e => this.renderCliente(e.row?.cliente)} />
                <DinamicTable.Col key={"descripcion"} label="Descripción" data={e => e.row.descripcion} width={300} />
                <DinamicTable.Col key={"monto"} label='Monto' width={100}
                    // textStyle={{ color: STheme.color.danger }}
                    data={(e) => e.row?.monto} wrap
                    customComponent={e =>
                        <SView row center>
                            <SText flex numberOfLines={0} >{e.row?.monto ? SMath.formatMoney(e.row?.monto) : ""} {e.row?.moneda?.observacion ? e.row?.moneda?.observacion : ""}</SText>
                        </SView>}
                />

                {/* <DinamicTable.Col key={"monto"} label="monto" data={e => e.row.monto} /> */}
                {/* <DinamicTable.Col key="key_moneda_" label="moneda" width={50} data={(e) => e.row?.moneda.observacion} /> */}
                <DinamicTable.Col key={"key_asiento_contable"} width={140} label="key_asiento_contable" data={e => e.row.key_asiento_contable} />
                <DinamicTable.Col key={"key_compra"} label="key_compra" data={e => e.row.key_compra} />
                <DinamicTable.Col key={"key_compra_venta_detalle"} label="key_compra_venta" data={e => e.row.key_compra_venta_detalle} />
                <DinamicTable.Col key={"key_costo"} label="key_costo" data={e => e.row.key_costo} />
                {/* <DinamicTable.Col key="key_empresa" label="key_empresa" width={100} data={(e) => e.row?.key_empresa ?? ""} customComponent={e => this.renderEmpresa(e.row?.empresa)} /> */}
                <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={110} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray, }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="key_usuario" label="Administrador" width={100} data={(e) => e.row?.key_usuario ?? ""} customComponent={e => this.renderUsuario(e.row?.usuario)} />
            </DinamicTable>
        </SPage>
    }
}