import React, { Component } from 'react';
import { SPage, SView, SText, STheme, SNavigation, SPopup, SHr, SNotification, SImage, SDate, SMath, SIcon } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearProveedor from './Components/PopupCrearProveedor';
import FiltroSelector from '../productos/modelo/Components/FiltroSelector';

export default class Lista extends Component {
    onSelect = SNavigation.getParam('onSelect');

    constructor(props) {
        super(props);
        this.state = { selectedEstadoPago: null };
        this.DinamicTable = null;
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown = (e) => {
        if (e.key === "Escape") {
            this.filtroEstadoRef?.reset();
            this.setState({ selectedEstadoPago: null }, () => {
                this.DinamicTable?.loadData();
            });
        }
    };

    async loadInitialData() {
        try {
            const [proveedores, transacciones, empresa] = await Promise.all([
                MDL.crm.cliente.getAll(),
                MDL.compra_venta.getTransaccion('compra', '2024-09-01', '2036-09-05'),
                MDL.empresa.getFull(),
            ]);
            if (!proveedores || !Object.keys(proveedores).length) {
                SNotification.send({ title: 'Advertencia', body: 'No se encontraron proveedores.', time: 3000, color: STheme.color.warning });
                return [];
            }
            const transaccionesArr = Array.isArray(transacciones)
                ? transacciones
                : Object.values(transacciones || {});
            if (!transaccionesArr.length) {
                SNotification.send({ title: 'Advertencia', body: 'No se encontraron compras en el rango de fechas especificado.', time: 3000, color: STheme.color.warning });
            }
            const keysUsuarios = Object.values(proveedores).map(p => p.key_usuario).filter(Boolean);
            const [usuarios, registros] = await Promise.all([
                MDL.usuario.getByKeys(keysUsuarios),
                MDL.compra_venta.getCuotasResumenTotal_compras(),
            ]);
            const usuariosArr  = Array.isArray(usuarios)  ? usuarios  : Object.values(usuarios  || {});
            const registrosArr = Array.isArray(registros) ? registros : Object.values(registros || {});

            let data = Object.values(proveedores).map(proveedor => {
                const p = { ...proveedor };
                p.usuario       = usuariosArr.find(u => u.key === p.key_usuario) || null;
                p.resumen_cuota = registrosArr.find(r => r.key_proveedor === p.key) || null;
                p.compras       = transaccionesArr.filter(t => t.key_proveedor === p.key);
                p.empresa       = empresa;
                const total_map = {}, pagado_map = {}, mora_map = {};
                let total_base = 0, pagado_base = 0, mora_base = 0;
                p.compras.forEach(v => {
                    const key  = v.key_moneda || 'desconocida';
                    const tot  = Number(v.cuotas?.total || 0);
                    const pag  = Number(v.monto_amortizado || 0);
                    const mora = Number(v.cuotas_en_mora?.monto || 0);
                    if (tot  > 0) total_map[key]  = (total_map[key]  || 0) + tot;
                    if (pag  > 0) pagado_map[key] = (pagado_map[key] || 0) + pag;
                    if (mora > 0) mora_map[key]   = (mora_map[key]   || 0) + mora;
                    total_base  += Number(v.cuotas?.total_base || 0);
                    pagado_base += Number(v.monto_amortizado_base || 0);
                    mora_base   += Number(v.cuotas_en_mora?.monto_base || 0);
                });
                const deuda_map = {};
                Object.keys(total_map).forEach(k => {
                    const d = (total_map[k] || 0) - (pagado_map[k] || 0);
                    if (d > 0) deuda_map[k] = d;
                });
                p.total_por_moneda  = total_map;
                p.pagado_por_moneda = pagado_map;
                p.deuda_por_moneda  = deuda_map;
                p.mora_por_moneda   = mora_map;
                p.totales_base = { total: total_base, pagado: pagado_base, mora: mora_base, deuda: total_base - pagado_base };
                return p;
            });

            if (this.state.selectedEstadoPago?.key) {
                const filtro = this.state.selectedEstadoPago.key;
                data = data.filter(p => {
                    const r = p.resumen_cuota;
                    if (!r) return filtro === "Sin Deuda";
                    if (r.cantidad_en_mora > 0 || r.monto_en_mora > 0) return filtro === "En Mora";
                    if (r.monto_pendiente <= 0) return filtro === "Sin Deuda";
                    return filtro === "Deudor";
                });
            }
            return data;
        } catch (error) {
            console.error('Error al cargar los datos iniciales:', error);
            SNotification.send({ title: 'Error', body: 'No se pudo cargar la lista de proveedores.', time: 3000, color: STheme.color.danger });
            return [];
        }
    }

    renderMoneyList(map, monedas, color) {
        const entries = Object.entries(map || {});
        if (!entries.length) return null;
        return (
            <SView col style={{ padding: 4, alignItems: 'flex-end' }}>
                {entries.map(([key_moneda, monto]) => {
                    const mon = (monedas || []).find(m => m.key === key_moneda);
                    const sim = mon?.observacion || 'Bs';
                    const fmt = SMath.formatMoney(monto);
                    return <SText key={key_moneda} style={{ fontSize: 11, color }}>{fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`}</SText>;
                })}
            </SView>
        );
    }

    sumMap(map) {
        return Object.values(map || {}).reduce((s, v) => s + v, 0) || '';
    }

    formatMap(map, monedas) {
        return Object.entries(map || {}).map(([k, monto]) => {
            const mon = (monedas || []).find(m => m.key === k);
            const sim = mon?.observacion || 'Bs';
            const fmt = SMath.formatMoney(monto);
            return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
        }).join('\n') || '';
    }

    formatBase(monto, monedas) {
        if (!monto) return '';
        const sim = (monedas || []).find(m => m.tipo === 'base')?.observacion || 'Bs';
        const fmt = SMath.formatMoney(monto);
        return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
    }

    renderUsuario(usuario = {}) {
        const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    {usuario?.key ? <SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ resizeMode: "cover" }} /> : null}
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 13 }} color={STheme.color.lightGray}>{nombre}</SText>
            </SView>
        );
    }

    renderProveedor(proveedor = {}) {
        const nombre = `${proveedor?.nombres || "Sin Nombre"} ${proveedor?.apellidos || ""}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    {proveedor?.key ? <SImage src={`${SSocket.api.root}usuario/${proveedor.key}`} style={{ resizeMode: "cover" }} /> : null}
                </SView>
                <SView width={8} />
                <SText flex numberOfLines={1} style={{ fontSize: 12 }}>{nombre}</SText>
            </SView>
        );
    }

    mostrarTabla() {
        return (
            <DinamicTable
                key="tabla"
                {...Config.table.applyTheme()}
                ref={ref => (this.DinamicTable = ref)}
                center
                language="es"
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                loadInitialState={async () => ({
                    cols: {},
                    sorters: [
                        { key: "estado_pago", order: "asc", type: "string" },
                        { key: "nombre_completo", order: "asc", type: "string" },
                    ]
                })}
                onSelect={e => {
                    if (this.onSelect) {
                        this.onSelect(e.row);
                        SNavigation.goBack();
                        return;
                    }
                    FloatMenu.open({
                        e: e.evt,
                        label: `Proveedor: ${e.row.razon_social}`,
                        options: [
                            {
                                label: 'Ver perfil',
                                icon: <SIcon name="Eyes" fill={STheme.color.text} />,
                                onPress: () => SNavigation.navigate("/cliente/perfil", { key: e.row.key }),
                            },
                            {
                                icon: <SIconApp name="Edit" />,
                                label: 'Actualizar Proveedor',
                                onPress: () => PopupCrearProveedor.open({
                                    editObject: { ...e.row, key_usuario: MDL.usuario.session?.key },
                                    key_empresa: e.row.key_empresa,
                                    onSuccess: () => this.DinamicTable.loadData(),
                                }),
                            },
                            e.row.compras?.length > 0 && {
                                icon: <SIconApp name="Ajustes" />,
                                label: 'Pagar Deuda',
                                onPress: () => SNavigation.navigate('/caja/cuotas', { key_proveedor: e.row?.key }),
                            },
                            {
                                icon: <SIconApp name="Delete" />,
                                label: 'Eliminar Proveedor',
                                onPress: () => SPopup.confirm({
                                    title: 'Eliminar Proveedor',
                                    message: '¿Estás seguro de eliminar este proveedor?',
                                    onPress: () => MDL.inventario.proveedor
                                        .editar({ ...e.row, estado: 0 })
                                        .then(() => {
                                            this.DinamicTable.loadData();
                                            SNotification.send({ title: 'Éxito', body: 'Proveedor eliminado correctamente.', time: 3000, color: STheme.color.success });
                                        })
                                        .catch(err => {
                                            console.error('Error al eliminar el proveedor:', err);
                                            SNotification.send({ title: 'Error', body: 'No se pudo eliminar el proveedor.', time: 3000, color: STheme.color.danger });
                                        }),
                                }),
                            },
                        ].filter(Boolean),
                    });
                }}
                loadData={() => this.loadInitialData()}
            >
                <DinamicTable.Col key="index" label="#" width={40} data={e => e.index + 1} />
                <DinamicTable.Col key="nombre_completo" label="Proveedor" width={200} data={e => e.row?.nombres ?? "Sin Nombre"} customComponent={e => this.renderProveedor(e.row)} />

                <DinamicTable.Col key="tipo_cliente" label="Categoría" data={e => (e.row.tipo_cliente ?? []).map(a => a.titulo)} width={160}
                    cellStyle={{ flexDirection: "row", justifyContent: "flex-start", flexWrap: "wrap", alignItems: "flex-start", gap: 4 }}
                    customComponent={e => (e.row.tipo_cliente ?? []).map(tc => (
                        <SView key={tc.key} style={{
                            borderWidth: 1,
                            backgroundColor: (tc.color ?? STheme.colorFromText(tc.titulo)) + "15",
                            borderColor: (tc.color ?? STheme.colorFromText(tc.titulo)) + "50",
                            padding: 2, paddingHorizontal: 4, borderRadius: 4,
                            justifyContent: "center", alignItems: "center", gap: 2,
                        }} row>
                            <SView style={{ width: 12, height: 12, borderRadius: 100, backgroundColor: tc.color ?? STheme.colorFromText(tc.titulo) }} />
                            <SText fontSize={10}>{tc.titulo}</SText>
                        </SView>
                    ))}
                />

                <DinamicTable.Col key="estado_pago" wrap label="Estado de Pago" width={100}
                    data={e => {
                        const r = e.row?.resumen_cuota;
                        if (!r) return 'Sin Deuda';
                        if (r.cantidad_en_mora > 0 || r.monto_en_mora > 0) return 'En Mora';
                        if (r.monto_pendiente <= 0) return 'Sin Deuda';
                        return 'Deudor';
                    }}
                    customComponent={e => {
                        const s = { 'Sin Deuda': { color: STheme.color.gray, label: 'Sin Deuda' }, 'Deudor': { color: STheme.color.warning, label: 'Deudor' }, 'En Mora': { color: STheme.color.danger, label: 'En Mora' } }[e.data] || { color: STheme.color.gray, label: 'Desconocido' };
                        return <SView row center><SView backgroundColor={s.color} style={{ borderRadius: 4, padding: 5 }}><SText color={STheme.color.text} fontSize={10}>{s.label}</SText></SView></SView>;
                    }}
                />

                <DinamicTable.Col key="nit" label="NIT" width={90} data={e => e.row?.nit} />
                <DinamicTable.Col key="razon_social" label="Razón Social" width={150} data={e => e.row?.razon_social} />
                <DinamicTable.Col key="telefono" label="Teléfono" width={130} data={e => e.row?.telefono} />

                <DinamicTable.Col key="cuota_6" wrap label="Cuotas Pend." width={60} data={e => e.row?.resumen_cuota?.cantidad_pendiente ?? ''} cellStyle={{ alignItems: 'center', backgroundColor: `${STheme.color.warning}33` }} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />

                <DinamicTable.Col key="monto_deuda_col" wrap label="Deuda" width={150}
                    data={e => this.formatMap(e.row?.deuda_por_moneda, e.row?.empresa?.monedas)}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.warning + '33' }}
                    customComponent={e => this.renderMoneyList(e.row?.deuda_por_moneda, e.row?.empresa?.monedas, STheme.color.warning)} />

                <DinamicTable.Col key="deuda_base_col" wrap label="Deuda Base" width={130}
                    data={e => this.formatBase(e.row?.totales_base?.deuda, e.row?.empresa?.monedas)}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.warning + '33' }} />

                <DinamicTable.Col key="cuota_4" wrap label="Cuotas Mora" width={60} data={e => e.row?.resumen_cuota?.cantidad_en_mora ?? ''} cellStyle={{ alignItems: 'center', backgroundColor: `${STheme.color.danger}33` }} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />

                <DinamicTable.Col key="en_mora_col" wrap label="Mora" width={150}
                    data={e => this.formatMap(e.row?.mora_por_moneda, e.row?.empresa?.monedas)}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.danger + '33' }}
                    customComponent={e => this.renderMoneyList(e.row?.mora_por_moneda, e.row?.empresa?.monedas, STheme.color.danger)} />

                <DinamicTable.Col key="mora_base_col" wrap label="Mora Base" width={130}
                    data={e => this.formatBase(e.row?.totales_base?.mora, e.row?.empresa?.monedas)}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.danger + '33' }} />

                <DinamicTable.Col key="fecha_on" label="F. Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, 'yyyy-MM-ddThh:mm:ss').date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="key_usuario" label="Responsable" width={100} data={e => e.row?.usuario?.Nombres ?? ""} customComponent={e => this.renderUsuario(e.row?.usuario)} />
            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Gestión de Proveedores" disableScroll>
                <SView row col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", paddingVertical: 8, paddingHorizontal: 12 }}>
                    <SView col={"xs-12 sm-5 lg-2"} row center style={{ flexWrap: "wrap" }}>
                        <FiltroSelector
                            ref={ref => this.filtroEstadoRef = ref}
                            label="Estado de Pago"
                            loadData={async () => [
                                { key: "Sin Deuda", nombre: "Sin Deuda" },
                                { key: "Deudor", nombre: "Deudor" },
                                { key: "En Mora", nombre: "En Mora" },
                            ]}
                            mapOption={a => ({ key: a.key, nombre: a.nombre })}
                            onSelect={item => this.setState({ selectedEstadoPago: item }, () => this.DinamicTable?.loadData())}
                        />
                    </SView>
                    <SHr height={8} />
                </SView>
                {this.mostrarTabla()}
                <SHr height={20} />
                <FloatButtom onPress={() => PopupCrearProveedor.open({ onSuccess: () => this.DinamicTable.loadData() })} />
            </SPage>
        );
    }
}
