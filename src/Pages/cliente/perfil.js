import React, { Component } from 'react';
import { SDate, SHr, SIcon, SImage, SLoad, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from "servisofts-socket";
import MDL from '../../MDL';
import PopupCrearCliente from './Components/PopupCrearCliente';
import AdminsitrarHabilidades from './Components/AdministrarHabilidades';
import TurnoComponent from '../../Components/TurnoComponent';
import PopupArticulos from './Components/PopupArticulos';
const URL = "/crm/cliente";
const COLOR_PROVEEDOR_BORDER = "#a046e8";
const COLOR_PROVEEDOR_BG = "#a046e844";
const COLOR_VENTA_BORDER = "#198754";
const cardTintStyle = (cliente) => cliente?.esProveedor
    ? { backgroundColor: COLOR_PROVEEDOR_BG, borderWidth: 1, borderColor: COLOR_PROVEEDOR_BORDER }
    : cliente?.esVenta
        ? { borderWidth: 1, borderColor: COLOR_VENTA_BORDER }
        : {};
const itemBorderColor = (cliente) => cliente?.esProveedor
    ? COLOR_PROVEEDOR_BORDER
    : cliente?.esVenta
        ? COLOR_VENTA_BORDER
        : STheme.color.card;
const itemBgColor = (cliente) => cliente?.esProveedor ? COLOR_PROVEEDOR_BG : STheme.color.card;
const SkeletonLine = ({ width = 120, height = 14, style }) => (
    <SLoad type="skeleton" style={{ width, height, borderRadius: 4, ...style }} />
);
const InfoField = ({ label, value, loading, skeletonWidth = 120 }) => (
    <SView style={{ marginBottom: 12 }}>
        <SText color={STheme.color.lightGray} fontSize={11} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</SText>
        <SHr height={3} />
        {loading ? <SkeletonLine width={skeletonWidth} height={15} /> : <SText fontSize={14} bold numberOfLines={1}>{value || "---"}</SText>}
    </SView>
);
export default class Perfil extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            allArticulos: [],
            notFound: false,
            loading: true,
        };
        this.key = SNavigation.getParam("key");
        this.esProveedor = SNavigation.getParam("tipo") === "proveedor";
        this.esVenta = !this.esProveedor;
    }
    componentDidMount() {
        this.loadData();
    }
    loadData = async () => {
        const notificationKey = 'cargando_perfil_cliente';
        if (!this.key) {
            this.setState({ notFound: true, loading: false });
            SNotification.send({
                key: notificationKey,
                title: 'Cliente no especificado',
                body: 'No se recibió una referencia válida de cliente para mostrar.',
                time: 4000,
                color: STheme.color.danger,
            });
            return;
        }
        SNotification.send({
            key: notificationKey,
            title: 'Cargando datos...',
            type: 'loading',
        });
        try {
            let habilidad = await MDL.habilidad.getAllWithUsuarios();
            let ventas = await MDL.compra_venta.getTransaccion('venta', '2024-09-01', '2026-09-05');
            let registros = await MDL.compra_venta.getCuotasResumenTotal_ventas();
            let turnos = await MDL.empresa.getTurnosHorariosAtencion();
            let allArticulos = await MDL.inventario.getAllModeloStock();
            let articulos = await MDL.inventario.getModelosByCliente(this.key);
            const tipo_costos = await MDL.inventario.getAllTipoCosto();
            const cuentas_contable_obj = await MDL.contabilidad.getCuentas();
            const cuentas_contable = Object.values(cuentas_contable_obj || []);
            let e = await MDL.crm.cliente.getByKey(this.key);
            if (!e) {
                this.setState({ notFound: true, loading: false });
                SNotification.send({
                    key: notificationKey,
                    title: 'Cliente no encontrado',
                    body: 'El cliente solicitado no existe o fue eliminado.',
                    time: 4000,
                    color: STheme.color.danger,
                });
                return;
            }
            e.esProveedor = this.esProveedor;
            e.esVenta = this.esVenta;
            e.habilidades = habilidad.filter(hab => hab.key_usuarios?.includes(e.key));
            e.ventas = ventas.filter(venta => venta.key_cliente == e.key);
            e.resumen_cuotas = registros ? registros.find(reg => reg.key_cliente == e.key) : [];
            e.turno = turnos ? Object.values(turnos).find(t => t.key == e.key_turno) : null;
            let art = articulos.map(a => {
                return {
                    ...a,
                    modelo: allArticulos.find(m => m.key == a.key_modelo) || { descripcion: "MODELO ELIMINADO" },
                    tipo_costo: tipo_costos.find(m => m.key == a.key_tipo_costo) || { descripcion: "" },
                    cuenta_contable: cuentas_contable.find(m => m.key == a.key_cuenta_contable) || { descripcion: "" },
                }
            });
            e.articulos = art;
            await SSocket.sendPromise({
                service: "inventario",
                component: "suscripcion",
                estado: "cargando",
                type: "getByKeyCliente",
                key_cliente: this.key
            }).then(f => {
                e.suscripcion = f.data;
            }).catch(console.error);
            this.setState({ data: e, allArticulos: allArticulos, loading: false });
            SNotification.send({
                key: notificationKey,
                title: 'Datos cargados',
                color: STheme.color.success,
                time: 1500,
            });
        } catch (error) {
            console.error('Error al cargar datos del cliente:', error);
            SNotification.send({
                key: notificationKey,
                title: 'Error',
                body: 'No se pudo cargar los datos del cliente.',
                time: 3000,
                color: STheme.color.danger,
            });
            this.setState({ loading: false });
        }
    }
    render() {
        if (this.state.notFound) {
            return (
                <SPage title="Cliente no encontrado">
                    <SView col={"xs-12"} center padding={30}>
                        <SText fontSize={16} color={STheme.color.lightGray}>No se encontró el cliente solicitado.</SText>
                    </SView>
                </SPage>
            );
        }
        if (!this.state.data) return <SView />
        this.data = this.state.data;
        return (
            <SPage title={this.esProveedor ? "Perfil del proveedor " : "Perfil del Cliente"} >
                <SView col={"xs-12"} row padding={10}>
                    <SView col={"xs-12 md-6 lg-3"} padding={5}>
                        <Resumen cliente={this.data} loading={this.state.loading} />
                    </SView>
                    <SView col={"xs-12 md-6 lg-4.5"} padding={5} >
                        <InfoGeneral cliente={this.data} onReload={this.loadData} loading={this.state.loading} />
                    </SView>
                    <SView col={"xs-12 md-6 lg-4.5"} padding={5}>
                        <Calendario cliente={this.data} />
                    </SView>
                    <SView col={"xs-12 md-6 lg-4"} padding={5} height={300}>
                        <Habilidades cliente={this.data} onReload={this.loadData} loading={this.state.loading} />
                    </SView>
                    <SView col={"xs-12 md-6 lg-4"} padding={5}>
                        <Horarios cliente={this.data} onReload={this.loadData} loading={this.state.loading} />
                    </SView>
                    <SView col={"xs-12 md-6 lg-4"} padding={5}>
                        <CompraVentas cliente={this.data} loading={this.state.loading} />
                    </SView>
                    <SView col={"xs-12 md-12 lg-5"} padding={5}>
                        <Articulos cliente={this.data} onReload={this.loadData} loading={this.state.loading} />
                    </SView>
                    <SView col={"xs-12 md-12 lg-7"} padding={5}>
                        <Suscripcion cliente={this.data} onReload={this.loadData} loading={this.state.loading} />
                    </SView>
                </SView>
            </SPage>
        );
    }
}
const Resumen = ({ cliente, loading }) => {
    return <SView col={"xs-12"} card center padding={15} height style={cardTintStyle(cliente)}>
        { }
        <SView col="xs-12" center row >
            {loading ? (
                <SLoad type="skeleton" style={{ width: 110, height: 110, borderRadius: 100 }} />
            ) : (
                <SView
                    style={{
                        width: 110,
                        height: 110,
                        borderRadius: 100,
                        overflow: 'hidden',
                        backgroundColor: cliente?.esProveedor ? COLOR_PROVEEDOR_BG : `${STheme.color.card}66`,
                        borderWidth: 2,
                        borderColor: STheme.color.primary,
                    }}
                >
                    <SImage src={SSocket.api.root + "usuario/" + cliente?.key} style={{ resizeMode: 'cover' }} enablePreview />
                </SView>
            )}
        </SView>
        <SHr height={10} />
        {loading ? <SkeletonLine width={150} height={18} /> : <SText bold fontSize={18}>{cliente.razon_social}</SText>}
        <SHr height={5} />
        {loading ? <SkeletonLine width={90} /> : <SText>{cliente.nit}</SText>}
        <SHr height={5} />
        {loading ? <SkeletonLine width={110} /> : <SText underLine center color={STheme.color.link}>{cliente.telefono}</SText>}
        <SHr height={5} />
        {loading ? <SkeletonLine width={160} height={12} /> : <SText color={STheme.color.lightGray} fontSize={12}>{cliente.correo}</SText>}
        <SHr height={5} />
    </SView>
}
const InfoGeneral = ({ cliente, onReload, loading }) => {
    return <SView col={"xs-12"} card padding={15} height style={cardTintStyle(cliente)}>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'edit' })) {
                    PopupCrearCliente.open({
                        editObject: cliente,
                        key_empresa: cliente.key_empresa,
                        onSuccess: () => onReload(),
                    });
                }
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Información General</SText>
        <SHr height={16} />
        <InfoField label="Nombre completo" value={[cliente.nombres, cliente.apellidos].filter(Boolean).join(" ")} loading={loading} skeletonWidth={180} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <InfoField label="Teléfono" value={cliente.telefono} loading={loading} skeletonWidth={100} />
            </SView>
            <SView col={"xs-6"}>
                <InfoField label="Correo" value={cliente.correo} loading={loading} skeletonWidth={120} />
            </SView>
        </SView>
        <InfoField label="Dirección" value={cliente.direccion} loading={loading} skeletonWidth={200} />
        <SView col={"xs-12"} row>
            <SView col={"xs-6"}>
                <InfoField label="Razón social" value={cliente.razon_social} loading={loading} skeletonWidth={110} />
            </SView>
            <SView col={"xs-6"}>
                <InfoField label="NIT" value={cliente.nit} loading={loading} skeletonWidth={70} />
            </SView>
        </SView>
    </SView>
}
const Habilidades = ({ cliente, onReload, loading }) => {
    return <SView col={"xs-12"} card padding={15} height style={cardTintStyle(cliente)}>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                AdminsitrarHabilidades.open({
                    key_usuario: cliente.key,
                    onSuccess: () => {
                        onReload();
                    }
                });
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Habilidades</SText>
        <SHr height={30} />
        <SView col={"xs-12"}>
            {loading ? (
                <>
                    <SLoad type="skeleton" style={{ width: "100%", height: 28, borderRadius: 4, marginBottom: 5 }} />
                    <SLoad type="skeleton" style={{ width: "100%", height: 28, borderRadius: 4, marginBottom: 5 }} />
                    <SLoad type="skeleton" style={{ width: "60%", height: 28, borderRadius: 4 }} />
                </>
            ) : (<>
                {cliente?.habilidades?.length === 0 && (<SText fontSize={16} color={STheme.color.lightGray}>No se han asignado habilidades.</SText>)}
                {cliente?.habilidades?.map((hab, index) => {
                    return <SView col={"xs-12"} key={index} flex
                        style={{
                            padding: 5,
                            borderWidth: 1,
                            borderColor: itemBorderColor(cliente),
                            borderRadius: 4,
                            marginBottom: 5,
                            backgroundColor: itemBgColor(cliente),
                        }}>
                        <SText style={{ textTransform: "uppercase" }}>{hab?.descripcion}</SText>
                    </SView>
                })}
            </>)}
        </SView>
    </SView>
}
const horaToMinutos = (hora) => {
    const [h, m, s] = hora.split(":").map(Number);
    return h * 60 + m + (s || 0) / 60;
};
const agruparPorDia = (data) => {
    return data.reduce((acc, item) => {
        if (!acc[item.dia]) acc[item.dia] = [];
        acc[item.dia].push(item);
        return acc;
    }, {});
};
const ordenarHorariosPorDia = (data) => {
    const agrupado = agruparPorDia(data);
    Object.keys(agrupado).forEach((dia) => {
        agrupado[dia].sort(
            (a, b) =>
                horaToMinutos(a.hora_inicio) -
                horaToMinutos(b.hora_inicio)
        );
    });
    return agrupado;
};
const Horarios = ({ cliente, onReload, loading }) => {
    let dataTurnOrdenado = [];
    if (cliente?.turno) {
        dataTurnOrdenado = ordenarHorariosPorDia(cliente.turno.horario_atencion);
    }
    let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return <SView col={"xs-12"} card padding={15} height style={cardTintStyle(cliente)}>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                SPopup.open({
                    key: "popup_config_horario",
                    content: (
                        <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                            <SView col={"xs-12"} height={600} center >
                                <TurnoComponent key_turno={cliente?.key_turno} onReload={async (res) => {
                                    cliente.horario_atencion = res;
                                    let data = {
                                        key: cliente.key,
                                        key_turno: res.key,
                                        key_usuario: MDL.usuario.session?.key,
                                    }
                                    await MDL.crm.cliente.editar(data).then(() => {
                                        onReload();
                                    }).catch(err => {
                                        console.error("Error al actualizar el horario de atención en el cliente:", err)
                                    });
                                }}
                                ></TurnoComponent>
                            </SView>
                        </SView>
                    )
                });
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Horarios de atención</SText>
        <SView col={"xs-12"}>
            <SHr height={30} />
            {loading ? (
                <>
                    <SLoad type="skeleton" style={{ width: "100%", height: 24, borderRadius: 4, marginBottom: 10 }} />
                    <SLoad type="skeleton" style={{ width: "100%", height: 40, borderRadius: 4, marginBottom: 5 }} />
                    <SLoad type="skeleton" style={{ width: "100%", height: 40, borderRadius: 4 }} />
                </>
            ) : cliente?.turno ? (<SView col={"xs-12"} row>
                <SView col={"xs-6"} row >
                    <SText col={"xs-12"} color={STheme.color.lightGray}>Turno: </SText>
                    <SText col={"xs-12"} bold>{cliente?.turno?.nombre}</SText>
                </SView>
                <SView col={"xs-6"} row style={{ alignItems: "flex-end" }}>
                    <SText col={"xs-12"} style={{ alignItems: "flex-end" }} color={STheme.color.lightGray}>¿Atención en feriado?</SText>
                    <SText col={"xs-12"} style={{ alignItems: "flex-end" }}>{cliente?.turno?.atiende_feriado === 0 ? "No" : "Sí"}</SText>
                </SView>
                <SHr height={10} />
                <SView col={"xs-12"}>
                    {Object.keys(dataTurnOrdenado).map((dia) => (
                        <SView col={"xs-12"} row key={dia}
                            style={{
                                marginBottom: 5,
                                borderWidth: 1,
                                borderColor: itemBorderColor(cliente),
                                borderRadius: 4,
                                backgroundColor: itemBgColor(cliente),
                                overflow: "hidden",
                            }}>
                            <SView col={"xs-4"} backgroundColor={STheme.color.background + "80"} padding={5} center>
                                <SText bold>{dias[dia]}</SText>
                            </SView>
                            <SView col={"xs-8"} row padding={5}>
                                {dataTurnOrdenado[dia].map((horario, index) => (
                                    <SView col={"xs-12"} row key={index} padding={5}>
                                        <SText>{`${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`}</SText>
                                    </SView>
                                ))}
                            </SView>
                        </SView>
                    ))}</SView>
            </SView>
            ) : (
                <SText fontSize={16} color={STheme.color.lightGray}>No se ha configurado un horario de atención.</SText>
            )}
        </SView>
        <SHr height={10} />
    </SView>
}
const Calendario = ({ cliente }) => {
    return <SView col={"xs-12"} card padding={15} height style={cardTintStyle(cliente)}>
        <SText bold fontSize={16}>Calendario</SText>
        <SHr height={10} />
    </SView>
}
const CompraVentas = ({ cliente, loading }) => {
    return <SView col={"xs-12"} card padding={15} height row style={cardTintStyle(cliente)}>
        <SText bold fontSize={16}>Compra / Venta</SText>
        <SHr height={20} />
        {loading ? [0, 1, 2, 3, 4, 5].map(i => (
            <SView key={i} col={"xs-6"} padding={5}>
                <SkeletonLine width={90} height={12} style={{ marginBottom: 6 }} />
                <SLoad type="skeleton" style={{ width: "100%", height: 30, borderRadius: 4 }} />
            </SView>
        )) : (<>
            <BloqueVentas dato={`Bs ${SMath.formatMoney((cliente?.resumen_cuotas?.monto_pagado ?? 0))}`} color={STheme.color.success} title="Monto Pagado" />
            <BloqueVentas dato={cliente?.resumen_cuotas?.cantidad_pagada ?? "--"} color={STheme.color.success} title="Cuotas Pagadas" />
            <BloqueVentas dato={`Bs ${SMath.formatMoney(cliente?.resumen_cuotas?.monto_en_mora ?? 0)}`} color={STheme.color.danger} title="Monto en Mora" />
            <BloqueVentas dato={cliente?.resumen_cuotas?.cantidad_en_mora ?? "--"} color={STheme.color.danger} title="Cuotas en Mora" />
            <BloqueVentas dato={`Bs ${SMath.formatMoney(cliente?.resumen_cuotas?.monto_pendiente ?? 0)}`} color={STheme.color.warning} title="Monto Pendiente" />
            <BloqueVentas dato={cliente?.resumen_cuotas?.cantidad_pendiente ?? "--"} color={STheme.color.warning} title="Cuotas Pendientes" />
        </>)}
    </SView>
}
const BloqueVentas = ({ dato, color, title }) => {
    return <SView col={"xs-6"} padding={5}>
        <SText col={"xs-12"} bold>{title}</SText>
        <SView col={"xs-12"}
            style={{
                padding: 5,
                borderWidth: 1,
                borderColor: color,
                borderRadius: 4,
                marginBottom: 5,
                backgroundColor: color + "22",
            }}>
            <SText style={{ textTransform: "uppercase" }}>{dato}</SText>
        </SView>
    </SView>
}
const Articulos = ({ cliente, onReload, loading }) => {
    return <SView col={"xs-12"} card padding={15} height style={cardTintStyle(cliente)}>
        <SView width={40} height={40} style={{
            position: "absolute",
            top: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10
        }}
            onPress={() => {
                PopupArticulos.open({
                    key_cliente: cliente.key,
                    onSuccess: () => {
                        onReload();
                    }
                });
            }} center>
            <SIcon name='crmeditar' width={20} height={20} fill={STheme.color.text} />
        </SView>
        <SText bold fontSize={16}>Artículos</SText>
        <SHr height={25} />
        {loading ? (
            <SView col={"xs-12"}>
                <SLoad type="skeleton" style={{ width: "100%", height: 60, borderRadius: 4, marginBottom: 15 }} />
                <SLoad type="skeleton" style={{ width: "100%", height: 60, borderRadius: 4, marginBottom: 15 }} />
                <SLoad type="skeleton" style={{ width: "100%", height: 60, borderRadius: 4 }} />
            </SView>
        ) : (<>
            {cliente?.articulos?.length > 0 && (
                <SView col={"xs-12"}>
                    {cliente?.articulos?.map((articulo, index) => {
                        return <SView col={"xs-12"} key={index} row
                            style={{
                                padding: 5,
                                borderWidth: 1,
                                borderColor: itemBorderColor(cliente),
                                borderRadius: 4,
                                marginBottom: 15,
                                backgroundColor: itemBgColor(cliente),
                            }} center onPress={() => {
                                let newdata = { ...articulo, estado: 0 };
                                SPopup.confirm({
                                    title: "Eliminar Artículo",
                                    message: `¿Estás seguro de eliminar el artículo "${articulo?.modelo?.descripcion}" del cliente?`,
                                    onPress: () => {
                                        MDL.inventario.editModeloCliente(newdata).then((resp) => {
                                            SNotification.send({
                                                title: 'Éxito',
                                                body: 'Artículo del cliente eliminado correctamente.',
                                                time: 3000,
                                                color: STheme.color.success,
                                            });
                                            onReload();
                                        }).catch((err) => {
                                            console.error("Error al eliminar el artículo del cliente", err);
                                            SNotification.send({
                                                title: 'Error',
                                                body: 'No se pudo eliminar el artículo del cliente.',
                                                time: 3000,
                                                color: STheme.color.danger,
                                            });
                                        });
                                    }
                                });
                            }}>
                            <SView width={25} height={25} center style={{
                                backgroundColor: STheme.color.danger,
                                borderRadius: 50,
                                position: "absolute",
                                top: -10,
                                right: -10,
                                cursor: "pointer",
                            }}>
                                <SIcon name='remove' width={25} height={25} fill={STheme.color.text} />
                            </SView>
                            <SImage src={SSocket.api.inventario + "modelo/.128_" + articulo?.modelo?.key} style={{
                                width: 50, height: 50, resizeMode: "contain", borderWidth: 1,
                                borderColor: itemBorderColor(cliente), borderRadius: 4
                            }} />
                            <SView width={5} />
                            <SView flex >
                                <SText >{articulo?.modelo?.descripcion}</SText>
                                <SHr h={4} />
                                <SView col={"xs-12"} row>
                                    {articulo?.tipo_costo?.descripcion && (<>
                                        <SView width={220} row style={{ borderWidth: 1, borderColor: itemBorderColor(cliente), borderRadius: 2, backgroundColor: itemBgColor(cliente), overflow: "hidden", }}>
                                            <SView col={"xs-4"} backgroundColor={STheme.color.background + "80"} padding={2} center>
                                                <SText bold fontSize={9} color={STheme.color.text}>Tipo Costo</SText>
                                            </SView>
                                            <SView flex style={{ paddingVertical: 4, paddingHorizontal: 6 }}>
                                                <SText fontSize={9} color={STheme.color.text} numberOfLines={1} >{articulo.tipo_costo.descripcion}</SText>
                                            </SView>
                                        </SView>
                                        <SHr h={4} />
                                    </>
                                    )}
                                    {articulo?.cuenta_contable?.descripcion && (<SView width={220} row style={{ borderWidth: 1, borderColor: itemBorderColor(cliente), borderRadius: 2, backgroundColor: itemBgColor(cliente), overflow: "hidden", }}>
                                        <SView col={"xs-4"} backgroundColor={STheme.color.background + "80"} padding={2} center>
                                            <SText bold fontSize={9} color={STheme.color.text}>Cuenta Contable</SText>
                                        </SView>
                                        <SView flex style={{ paddingVertical: 4, paddingHorizontal: 6 }}>
                                            <SText fontSize={9} color={STheme.color.text} numberOfLines={1}>{articulo.cuenta_contable.descripcion}</SText>
                                        </SView>
                                    </SView>
                                    )}
                                </SView>
                                <SHr h={4} />
                                <SView col={"xs-12"} row>
                                    <SView flex>
                                        <SText >{SMath.formatMoney(articulo?.modelo?.precio_venta ?? 0)}</SText>
                                    </SView>
                                    <SView width={100} style={{ alignItems: "flex-end" }}>
                                        <SText style={{ fontSize: 12, color: STheme.color.lightGray }}>Comisión {articulo?.comision ?? 0}%</SText>
                                    </SView>
                                </SView>
                                <SView col={"xs-12"} row>
                                    <SText fontSize={8} color={STheme.color.lightGray}>{articulo.key_cuenta_contable}</SText>
                                </SView>
                            </SView>
                        </SView>
                    })}
                </SView>
            )}
            {(!cliente.articulos || cliente.articulos.length === 0) && (<SText fontSize={16} color={STheme.color.lightGray}>No se han asignado artículos.</SText>)}
        </>)}
    </SView>
}
const procesarData = (data) => {
    const hoy = new Date();
    return data
        .filter(item => item.estado !== 0)
        .map(item => {
            const inicio = new Date(item.fecha_inicio);
            const fin = new Date(item.fecha_fin);
            let activo = 0;
            if (hoy >= inicio && hoy <= fin) {
                activo = 1;
            } else if (hoy > fin) {
                activo = 0;
            } else if (hoy < inicio) {
                activo = 2;
            }
            return {
                ...item,
                activo
            };
        })
        .sort((a, b) => new Date(b.fecha_on) - new Date(a.fecha_on));
};
const Suscripcion = ({ cliente, loading }) => {
    let suscripciones = []
    if (cliente?.suscripcion) {
        suscripciones = procesarData(cliente?.suscripcion || []);
    }
    return <SView col={"xs-12"} card padding={15} height style={cardTintStyle(cliente)}>
        <SText bold fontSize={16}>Suscripción</SText>
        <SHr height={20} />
        {loading ? (
            <SView col={"xs-12"}>
                <SLoad type="skeleton" style={{ width: "100%", height: 50, borderRadius: 4, marginBottom: 5 }} />
                <SLoad type="skeleton" style={{ width: "100%", height: 50, borderRadius: 4 }} />
            </SView>
        ) : (<>
            {suscripciones.length === 0 && (<SText fontSize={16} color={STheme.color.lightGray}>No hay suscripciones registradas.</SText>)}
            <SView col={"xs-12"} >
                {suscripciones.map(suscrip => (
                    <SView col={"xs-12"} row
                        style={{
                            marginBottom: 5,
                            borderWidth: 1,
                            borderColor: itemBorderColor(cliente),
                            borderRadius: 4,
                            backgroundColor: itemBgColor(cliente),
                            overflow: "hidden",
                        }}>
                        <SView col={"xs-4"} backgroundColor={suscrip.activo == 0 ? STheme.color.danger + "90" : suscrip.activo == 1 ? STheme.color.success + "90" : STheme.color.background + "90"} padding={5} center>
                            <SText bold>{suscrip.activo == 0 ? "Vencido" : suscrip.activo == 1 ? "Activo" : "Futuro"}</SText>
                        </SView>
                        <SView col={"xs-8"} row padding={5}>
                            <SView col={"xs-12"} row>
                                <SText bold>{suscrip.producto?.nombre}</SText>
                                <SHr height={3} />
                                <SText>{new SDate(suscrip.fecha_inicio).toString("dd MON yyyy")}</SText>
                                <SText> - </SText>
                                <SText>{new SDate(suscrip.fecha_fin).toString("dd MON yyyy")}</SText>
                            </SView>
                        </SView>
                    </SView>
                ))}
            </SView>
        </>)}
    </SView>
}