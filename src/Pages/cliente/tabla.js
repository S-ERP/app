import React, { Component } from 'react';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import PopupCrearCliente from './Components/PopupCrearCliente';
import SIconApp from '../../Assets/SIconApp';
import AdminsitrarHabilidades from './Components/AdministrarHabilidades';
import FiltroSelector from '../productos/modelo/Components/FiltroSelector';
const URL = "/crm/cliente";
export default class ListaClientes extends Component {
    onSelect = SNavigation.getParam("onSelect");

    constructor(props) {
        super(props);
        this.state = { selectedEstadoPago: null, };
        this.DinamicTable = null;
    }

    componentDidMount() {
        MDL.rolesPermisos
            .getPermisoAsync({ url: URL, permiso: 'ver' })
            .then(e => {
                if (!e) {
                    return;
                }
                this.forceUpdate();
            })
            .catch(error => {
                console.error('Error al verificar permisos:', error);
                SNotification.send({
                    title: 'Error',
                    body: 'No se pudo verificar los permisos.',
                    time: 3000,
                    color: STheme.color.danger,
                });
            });

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
            const [clientes, transacciones, empresa] = await Promise.all([
                MDL.crm.cliente.getAll(),
                MDL.compra_venta.getTransaccion('venta', '2024-09-01', '2036-09-05'),
                MDL.empresa.getFull(),
            ]);
            if (!clientes || !Object.keys(clientes).length) {
                SNotification.send({
                    title: 'Advertencia',
                    body: 'No se encontraron clientes.',
                    time: 3000,
                    color: STheme.color.warning,
                });
                return [];
            }
            const transaccionesArr = Array.isArray(transacciones)
                ? transacciones
                : Object.values(transacciones || {});
            if (!transaccionesArr.length) {
                SNotification.send({
                    title: 'Advertencia',
                    body: 'No se encontraron ventas en el rango de fechas especificado.',
                    time: 3000,
                    color: STheme.color.warning,
                });
            }
            const keysUsuarios = Object.values(clientes)
                .map(c => c.key_usuario)
                .filter(Boolean);
            const [usuarios, registros, habilidad] = await Promise.all([
                MDL.usuario.getByKeys(keysUsuarios),
                MDL.compra_venta.getCuotasResumenTotal_ventas(),
                MDL.habilidad.getAllWithUsuarios(),
            ]);
            const usuariosArr  = Array.isArray(usuarios)  ? usuarios  : Object.values(usuarios  || {});
            const registrosArr = Array.isArray(registros) ? registros : Object.values(registros || {});
            const habilidadArr = Array.isArray(habilidad) ? habilidad : Object.values(habilidad || {});

            let data = Object.values(clientes).map(cliente => {
                const c = { ...cliente };
                c.usuario = usuariosArr.find(u => u.key === c.key_usuario) || null;
                c.resumen_cuota = registrosArr.find(r => r.key_cliente === c.key) || null;
                c.ventas = transaccionesArr.filter(t => t.key_cliente === c.key);
                c.habilidades = habilidadArr.filter(h => h.key_usuarios?.includes(c.key));
                c.empresa = empresa;
                const total_map = {}, pagado_map = {}, mora_map = {};
                let total_base = 0, pagado_base = 0, mora_base = 0;
                c.ventas.forEach(v => {
                    const key = v.key_moneda || 'desconocida';
                    const tot = Number(v.cuotas?.total || 0);
                    const pag = Number(v.monto_amortizado || 0);
                    const mora = Number(v.cuotas_en_mora?.monto || 0);
                    if (tot > 0) total_map[key] = (total_map[key] || 0) + tot;
                    if (pag > 0) pagado_map[key] = (pagado_map[key] || 0) + pag;
                    if (mora > 0) mora_map[key] = (mora_map[key] || 0) + mora;
                    total_base += Number(v.cuotas?.total_base || 0);
                    pagado_base += Number(v.monto_amortizado_base || 0);
                    mora_base += Number(v.cuotas_en_mora?.monto_base || 0);
                });
                const deuda_map = {};
                Object.keys(total_map).forEach(k => {
                    const d = (total_map[k] || 0) - (pagado_map[k] || 0);
                    if (d > 0) deuda_map[k] = d;
                });
                c.total_por_moneda = total_map;
                c.pagado_por_moneda = pagado_map;
                c.deuda_por_moneda = deuda_map;
                c.mora_por_moneda = mora_map;
                c.totales_base = { total: total_base, pagado: pagado_base, mora: mora_base, deuda: total_base - pagado_base };
                return c;
            });

            if (this.state.selectedEstadoPago?.key) {
                const filtro = this.state.selectedEstadoPago.key;
                data = data.filter(c => {
                    const r = c.resumen_cuota;
                    if (!r) return filtro === "Sin Deuda";
                    if (r.cantidad_en_mora > 0 || r.monto_en_mora > 0) return filtro === "En Mora";
                    if (r.monto_pendiente <= 0) return filtro === "Sin Deuda";
                    return filtro === "Deudor";
                });
            }

            return data;

        } catch (error) {
            console.error('Error al cargar los datos iniciales:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo cargar la lista de clientes.',
                time: 3000,
                color: STheme.color.danger,
            });
            return [];
        }
    }

    renderUsuario(usuario = {}) {
        const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    {usuario?.key ? (<SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ resizeMode: "cover" }} />) : null}
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={{ fontSize: 13 }} color={STheme.color.lightGray}> {nombre} </SText>
            </SView>
        );
    }

    renderCliente(cliente = {}) {
        const nombre = `${cliente?.nombres || "Sin Nombre"} ${cliente?.apellidos || ""}`;
        return (
            <SView col="xs-12" center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} >
                    {cliente?.key ? (<SImage src={`${SSocket.api.root}usuario/${cliente.key}`} style={{ resizeMode: "cover" }} />) : null}
                </SView>
                <SView width={8} />
                <SText flex numberOfLines={1} style={{ fontSize: 12 }}> {nombre} </SText>
            </SView>
        );
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
                    return (
                        <SText key={key_moneda} style={{ fontSize: 11, color }}>
                            {fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`}
                        </SText>
                    );
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
                loadData={() => this.loadInitialData()}
                loadInitialState={async () => ({
                    cols: { "total_base_col": { hidden: true }, "pagado_base_col": { hidden: true }, "deuda_base_col": { hidden: true }, },
                    sorters: [
                        { key: "estado_pago", order: "asc", type: "string" },
                        { key: "nombre_completo", order: "asc", type: "string" },
                    ]
                })}
                onSelect={e => {
                    const { row, evt } = e;
                    const nombreCliente = `CLIENTE: ${row?.nombres ?? 'Sin nombre'}`;
                    const options = [];


                    options.push({
                        label: 'Ver perfil',
                        icon: <SIcon name="Eyes" fill={STheme.color.text} />,
                        onPress: () => {
                            SNavigation.navigate("/cliente/perfil", { key: e.row.key })
                        },
                    });

                    options.push({
                        label: 'Ver trasabilidadd',
                        icon: <SIcon name="Eyes" fill={STheme.color.text} />,
                        onPress: () => {
                            SNavigation.navigate("/cliente/transacciones", { key: e.row.key })
                        },
                    });


                    if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'edit' })) {
                        options.push({
                            label: 'Editar',
                            icon: <SIcon name="Edit" fill={STheme.color.text} />,
                            onPress: () => {
                                const cliente = { ...row, key_usuario: MDL.usuario.session?.key };
                                PopupCrearCliente.open({
                                    editObject: cliente,
                                    key_empresa: cliente.key_empresa,
                                    onSuccess: () => this.DinamicTable.loadData(),
                                });
                            },
                        });
                    }
                    if (row.ventas.length > 0) {
                        options.push({
                            label: 'Pagar Deuda',
                            icon: <SIconApp name="addUser" fill={STheme.color.text} />,
                            onPress: () => SNavigation.navigate('/caja/cuotas', { key_cliente: row?.key }),
                        });
                    }
                    if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
                        options.push({
                            label: 'Eliminar',
                            icon: <SIcon name="Delete" fill={STheme.color.text} />,
                            onPress: () => {
                                SPopup.confirm({
                                    title: 'Eliminar Cliente',
                                    message: `¿Estás seguro de eliminar a ${nombreCliente}?`,
                                    onPress: () => {
                                        SSocket.sendPromise({
                                            service: 'crm',
                                            component: 'cliente',
                                            type: 'editar',
                                            data: { ...row, estado: 0 },
                                        })
                                            .then(() => {
                                                SNotification.send({
                                                    key: 'eliminar_ok',
                                                    title: 'Éxito',
                                                    body: `${nombreCliente} fue eliminado correctamente.`,
                                                    time: 1500,
                                                    color: STheme.color.success,
                                                });
                                                this.DinamicTable.loadData();
                                            })
                                            .catch(err => {
                                                console.error('Error al eliminar cliente:', err);
                                                SNotification.send({
                                                    key: 'eliminar_error',
                                                    title: 'Error',
                                                    body: 'Ocurrió un error al eliminar. Intenta nuevamente.',
                                                    time: 3000,
                                                    color: STheme.color.danger,
                                                });
                                            });
                                    },
                                });
                            },
                        });
                    }
                    if (this.onSelect) {
                        options.push({
                            label: "Seleccionar usuario",
                            icon: <SIcon name="bien" fill={STheme.color.text} />,
                            onPress: () => {
                                this.onSelect(e.row);
                            }
                        })
                    }
                    options.push({
                        label: "Administrar Habilidades",
                        icon: <SIcon name="Engranaje" fill={STheme.color.text} />,
                        onPress: () => {
                            AdminsitrarHabilidades.open({
                                key_usuario: e.row.key,
                                onSuccess: () => {
                                    this.DinamicTable.loadData();
                                }
                            });
                        }
                    })
                    FloatMenu.open({
                        e: evt,
                        label: nombreCliente,
                        options,
                    });
                }}
            >
                <DinamicTable.Col key="index" label="#" width={40} data={e => e.index + 1} />
                <DinamicTable.Col key="key-" label="Ver" width={40} data={e => ""} customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/cliente/perfil", { key: e.row.key }) }}> <SIcon name='Eyes' height={14} fill={STheme.color.lightGray} ></SIcon> </SView>} />
                <DinamicTable.Col key="nombre_completo" label="Cliente" width={200} data={(e) => e.row?.nombres ?? "Sin Nombre"} customComponent={e => this.renderCliente(e.row)} />

                <DinamicTable.Col key={"tipo_cliente"} label="Tipo" data={e => ((e.row.tipo_cliente ?? []).map(a => a.titulo))} width={160}
                    cellStyle={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        gap: 4,
                    }}
                    customComponent={e => {
                        return (e.row.tipo_cliente ?? []).map((tc) => {
                            return <SView style={{
                                borderWidth: 1,
                                backgroundColor: (tc.color ?? STheme.colorFromText(tc.titulo)) + "15",
                                borderColor: (tc.color ?? STheme.colorFromText(tc.titulo)) + "50",
                                padding: 2,
                                paddingHorizontal: 4,
                                borderRadius: 4,
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 2,
                            }} row>
                                <SView style={{
                                    width: 12,
                                    height: 12, borderRadius: 100,
                                    backgroundColor: (tc.color ?? STheme.colorFromText(tc.titulo)),

                                }}></SView>
                                <SText key={tc.key} fontSize={10}  >{tc.titulo}</SText>
                            </SView>
                        })
                    }}
                />

                <DinamicTable.Col key='key-habilidades' label='# habilidades' data={e => (e.row.habilidades ?? []).map(h => h.descripcion)} wrap width={160} />


                <DinamicTable.Col key="estado_pago" wrap label="Estado de Pago" width={80}
                    data={e => {
                        const resumen = e.row?.resumen_cuota;
                        if (!resumen) return 'Sin Deuda';
                        if (resumen.cantidad_en_mora > 0 || resumen.monto_en_mora > 0) return 'En Mora';
                        if (resumen.monto_pendiente <= 0) return 'Sin Deuda';
                        // if (resumen.monto_pendiente <= 0) return 'Pagado';
                        return 'Deudor';
                        // return 'Al Día';
                    }}
                    customComponent={e => {
                        const statesTipo = {
                            'Sin Deuda': { color: STheme.color.gray, label: 'Sin Deuda' },
                            'Deudor': { color: STheme.color.warning, label: 'Deudor' },
                            // 'Al Día': { color: STheme.color.warning, label: 'Al Día' },
                            'En Mora': { color: STheme.color.danger, label: 'En Mora' },
                            // 'Sin Deuda': { color: STheme.color.success, label: 'Sin Deuda' },
                            // 'Pagado': { color: STheme.color.success, label: 'Pagado' },
                        }[e.data] || { color: STheme.color.gray, label: 'Desconocido' };
                        return (
                            <SView row center>
                                <SView backgroundColor={statesTipo.color} style={{ borderRadius: 4, padding: 5 }}>
                                    <SText color={STheme.color.text} fontSize={10}>
                                        {statesTipo.label}
                                    </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />




                <DinamicTable.Col key="cuota_6" wrap label="# Cuotas Pendientes" width={60} data={e => e.row?.resumen_cuota?.cantidad_pendiente ?? ''} cellStyle={{ alignItems: 'flex-end', backgroundColor: `${STheme.color.warning}33`, }} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />




                <DinamicTable.Col key="monto_deuda_col" wrap label="Monto Pendiente" width={40}
                    data={e => this.formatMap(e.row?.deuda_por_moneda, e.row?.empresa?.monedas)}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.warning + '33' }}
                    customComponent={e => this.renderMoneyList(e.row?.deuda_por_moneda, e.row?.empresa?.monedas, STheme.color.warning)} />


                <DinamicTable.Col key="deuda_base_casdol" wrap label="M. Pendiente Base" width={90}
                    data={e => this.formatBase(e.row?.totales_base?.deuda, e.row?.empresa?.monedas)}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.warning + '33' }} />


                <DinamicTable.Col key="cuota_4" wrap label="# Cuotas Mora" width={60} data={e => e.row?.resumen_cuota?.cantidad_en_mora ?? ''} cellStyle={{ alignItems: 'flex-end', backgroundColor: `${STheme.color.danger}33`, }} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />


                <DinamicTable.Col key="en_mora_col" wrap label="Monto Mora" width={90}
                    data={e => this.formatMap(e.row?.mora_por_moneda, e.row?.empresa?.monedas)}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.danger + '33' }}
                    customComponent={e => this.renderMoneyList(e.row?.mora_por_moneda, e.row?.empresa?.monedas, STheme.color.danger)} />


                <DinamicTable.Col key="mora_base_casdol" wrap label="Monto Mora Base" width={90}
                    data={e => e.row?.totales_base?.mora || ''}
                    cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.danger + '33' }}
                    format={e => { if (!e.data) return ''; const sim = e.row?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs'; const fmt = SMath.formatMoney(e.data); return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`; }} />
                <DinamicTable.Col key="fecha_on" label="F. Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, 'yyyy-MM-ddThh:mm:ss').date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="key_usuario" label="Administrador" width={100} data={(e) => e.row?.usuario?.Nombres ?? ""} customComponent={e => this.renderUsuario(e.row?.usuario)} />
            </DinamicTable>
        );
    }
    render() {
        return (
            <SPage title="Gestión de Clientes" disableScroll>
                <SView row col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", paddingVertical: 8, paddingHorizontal: 12, }} >
                    <SView col={"xs-12 sm-5 lg-2"} row center style={{ flexWrap: "wrap", }}>
                        <FiltroSelector
                            ref={ref => this.filtroEstadoRef = ref}
                            label="Estado de Pago"
                            loadData={async () => [
                                { key: "Sin Deuda", nombre: "Sin Deuda" },
                                { key: "Deudor", nombre: "Deudor" },
                                { key: "En Mora", nombre: "En Mora" },
                            ]}
                            mapOption={a => ({ key: a.key, nombre: a.nombre })}
                            onSelect={item => {
                                this.setState({ selectedEstadoPago: item }, () => {
                                    this.DinamicTable?.loadData();
                                });
                            }}
                        />
                    </SView>
                    <SHr height={8} />
                </SView>
                {this.mostrarTabla()}
                {MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'new' }) && (
                    <FloatButtom
                        onPress={() =>
                            PopupCrearCliente.open({
                                onSuccess: () => this.DinamicTable.loadData(),
                            })
                        }
                    />
                )}
            </SPage>
        );
    }
}