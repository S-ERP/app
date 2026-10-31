import React, { Component } from 'react';
import { Text } from 'react-native';
import { SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import { accionPuerta, fechaEvento, getAccesos, getMolinetes, probarConexion, sincronizarSucursal, TIPO_INBIO } from './api';
import PopupHistorial, { formatFecha } from './PopupHistorial';
import PopupUsuariosDispositivo from './PopupUsuariosDispositivo';

const URL = "/molinete";
const PUERTAS = [1, 2];

// Solo el InBio puede cerrar a pedido; la Raspberry abre con un pulso y se cierra sola.
const puedeCerrar = (row) => row.key_tipo_dispositivo == TIPO_INBIO;
const puedeAbrir = () => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso: "abrir" });
const puedeSincronizar = () => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso: "sincronizar" });

const BtnPuerta = ({ label, color, onPress }) => <SView card center onPress={onPress}
    style={{ paddingHorizontal: 8, height: 24, borderRadius: 4, marginRight: 4, backgroundColor: color + "33", borderWidth: 1, borderColor: color }}>
    <SText fontSize={10} color={STheme.color.text}>{label}</SText>
</SView>

const Badge = ({ label, color, textStyle }) => <SView row center style={{ justifyContent: "flex-start", flex: 1 }}>
    <SView width={8} height={8} style={{ borderRadius: 4, backgroundColor: color }} />
    <SView width={6} />
    <Text style={[textStyle, { flex: 1, color }]} numberOfLines={1}>{label}</Text>
</SView>

// Estado segun el ultimo evento de conexion del historial (300 conectado / 301 desconectado).
const estadoConexion = (row) => {
    const ev = row.historial?.conexion?.data?.EventType;
    if (ev == "300") return { label: "Conectado", color: STheme.color.success };
    if (ev == "301") return { label: "Desconectado", color: STheme.color.danger };
    return { label: "Sin datos", color: STheme.color.gray };
}

// Ultima sincronizacion: evento 302/303 del historial, o ultima_modificacion del dispositivo.
const ultimaSincronizacion = (row) => {
    const h = row.historial?.sincronizacion;
    if (h) return { fecha: fechaEvento(h), ok: h.data?.EventType == "302" };
    if (row.ultima_modificacion) return { fecha: row.ultima_modificacion, ok: true };
    return null;
}

export default class lista extends Component {
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(e => {
            if (!e) {
                SNavigation.goBack();
                return;
            }
            this.forceUpdate();
        })
    }

    async loadData() {
        try {
            return await getMolinetes();
        } catch (e) {
            console.log("[molinete] getMolinetes", e);
            SNotification.send({
                title: "Error",
                body: "No se pudo cargar los molinetes.",
                color: STheme.color.danger,
                time: 4000,
            });
            return [];
        }
    }

    probar(row) {
        const key = "probar_" + row.key;
        SNotification.send({ key, title: "Probando conexion...", body: row.descripcion, type: "loading" });
        probarConexion(row).then(() => {
            SNotification.send({ key, title: "Conectado", body: row.descripcion + " responde.", color: STheme.color.success, time: 4000 });
        }).catch(e => {
            SNotification.send({ key, title: "Sin conexion", body: e?.error == "timeOut" ? "El punto de venta no respondio." : (e?.error ?? "El dispositivo no responde."), color: STheme.color.danger, time: 5000 });
        })
    }

    // Abrir/cerrar una puerta fisica: siempre con confirmacion.
    puerta(row, puerta, cerrar = false) {
        const accion = cerrar ? "Cerrar" : "Abrir";
        SPopup.confirm({
            title: `${accion} puerta ${puerta}`,
            message: `¿${accion} la puerta ${puerta} de ${row.descripcion} (${row.sucursal?.descripcion ?? ""})?`,
            onPress: () => {
                const key = "puerta_" + row.key;
                SNotification.send({ key, title: `${accion} puerta ${puerta}...`, body: row.descripcion, type: "loading" });
                accionPuerta(row, puerta, cerrar).then(() => {
                    SNotification.send({ key, title: cerrar ? "Puerta cerrada" : "Puerta abierta", body: `${row.descripcion} · puerta ${puerta}`, color: STheme.color.success, time: 4000 });
                }).catch(e => {
                    SNotification.send({ key, title: `No se pudo ${accion.toLowerCase()} la puerta`, body: e?.error == "timeOut" ? "El punto de venta no respondio." : (e?.error ?? "El dispositivo no respondio."), color: STheme.color.danger, time: 5000 });
                })
            }
        })
    }

    // Carga en los molinetes de la sucursal a quienes tienen acceso hoy; saca a los que ya no (delete_all).
    async sincronizar(row) {
        const suc = row.sucursal;
        if (!suc?.key) return;
        const key = "sincronizar_" + suc.key;
        SNotification.send({ key, title: "Calculando accesos...", body: suc.descripcion, type: "loading" });
        let accesos;
        try {
            accesos = await getAccesos(suc.key);
            SNotification.remove(key);
        } catch (e) {
            SNotification.send({ key, title: "No se pudo calcular los accesos", body: e?.error ?? "", color: STheme.color.danger, time: 5000 });
            return;
        }
        const n = accesos?.keys?.length ?? 0;
        SPopup.confirm({
            title: "Sincronizar " + suc.descripcion,
            message: `Se cargaran ${n} personas (${accesos?.clientes?.length ?? 0} clientes con suscripcion vigente y ${accesos?.personal?.length ?? 0} del personal) en los molinetes de ${suc.descripcion}.`
                + (n == 0 ? " Los molinetes quedaran SIN NADIE con acceso." : " Quien no este en la lista dejara de tener acceso."),
            onPress: () => {
                SNotification.send({ key, title: "Sincronizando...", body: suc.descripcion + " · puede tardar unos minutos", type: "loading" });
                sincronizarSucursal(suc.key).then(res => {
                    const errores = res.filter(r => r.estado != "exito");
                    SNotification.send({
                        key,
                        title: errores.length ? "Sincronizacion con errores" : "Sincronizacion completa",
                        body: res.map(r => `${r.descripcion}: ${r.estado == "exito" ? r.usuarios + " personas" : (r.error ?? "error")}`).join(" · ") || "La sucursal no tiene molinetes",
                        color: errores.length ? STheme.color.warning : STheme.color.success,
                        time: 8000,
                    });
                    this.table?.loadData();
                }).catch(e => {
                    SNotification.send({ key, title: "No se pudo sincronizar", body: e?.error == "timeOut" ? "El servidor no respondio a tiempo." : (e?.error ?? ""), color: STheme.color.danger, time: 6000 });
                })
            }
        })
    }

    opcionesPuerta(row) {
        if (!puedeAbrir()) return [];
        const op = [];
        PUERTAS.forEach(p => op.push({ label: `Abrir puerta ${p}`, icon: <SIcon name="Engranaje" fill={STheme.color.text} />, onPress: () => this.puerta(row, p) }));
        if (puedeCerrar(row)) PUERTAS.forEach(p => op.push({ label: `Cerrar puerta ${p}`, icon: <SIcon name="Engranaje" fill={STheme.color.text} />, onPress: () => this.puerta(row, p, true) }));
        return op;
    }

    render() {
        return <SPage title={"Molinetes"} disableScroll>
            <DinamicTable
                ref={ref => this.table = ref}
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                loadData={this.loadData.bind(this)}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.descripcion,
                        options: [
                            {
                                label: "Usuarios y huellas",
                                icon: <SIcon name="Eyes" fill={STheme.color.text} />,
                                onPress: () => PopupUsuariosDispositivo.open({ dispositivo: e.row }),
                            },
                            {
                                label: "Ver historial",
                                icon: <SIcon name="Eyes" fill={STheme.color.text} />,
                                onPress: () => PopupHistorial.open({ dispositivo: e.row }),
                            },
                            {
                                label: "Pantalla de ingresos",
                                icon: <SIcon name="Eyes" fill={STheme.color.text} />,
                                onPress: () => SNavigation.navigate(URL + "/pantalla", { key_sucursal: e.row.sucursal?.key }),
                            },
                            {
                                label: "Probar conexion",
                                icon: <SIcon name="Engranaje" fill={STheme.color.text} />,
                                onPress: () => this.probar(e.row),
                            },
                            ...(puedeSincronizar() ? [{
                                label: "Sincronizar sucursal",
                                icon: <SIcon name="Engranaje" fill={STheme.color.text} />,
                                onPress: () => this.sincronizar(e.row),
                            }] : []),
                            ...this.opcionesPuerta(e.row),
                        ]
                    })
                }}
            >
                <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
                <DinamicTable.Col key='sucursal' label='Sucursal' data={e => e.row.sucursal?.descripcion} width={140} />
                <DinamicTable.Col key='punto_venta' label='Punto de venta' data={e => e.row.punto_venta?.descripcion} width={150} />
                <DinamicTable.Col key='descripcion' label='Dispositivo' data={e => e.row.descripcion} width={140} />
                <DinamicTable.Col key='tipo' label='Tipo' data={e => e.row.tipo?.descripcion ?? ""} width={130} />
                {/* DinamicTable no acepta hijos null: la columna siempre va y sin permiso queda vacia. */}
                <DinamicTable.Col key='puertas' label='Acciones' width={260}
                    data={e => ""}
                    customComponent={e => !puedeAbrir() && !puedeSincronizar() ? <SText color={STheme.color.gray}>—</SText> : <SView row center style={{ justifyContent: "flex-start", flex: 1 }}>
                        {puedeSincronizar() ? <BtnPuerta label={"Sincronizar"} color={STheme.color.primary ?? STheme.color.warning} onPress={() => this.sincronizar(e.row)} /> : null}
                        {!puedeAbrir() ? null : <>
                        {PUERTAS.map(p => <BtnPuerta key={"a" + p} label={`Abrir ${p}`} color={STheme.color.success} onPress={() => this.puerta(e.row, p)} />)}
                        {puedeCerrar(e.row) ? PUERTAS.map(p => <BtnPuerta key={"c" + p} label={`Cerrar ${p}`} color={STheme.color.danger} onPress={() => this.puerta(e.row, p, true)} />) : null}
                        </>}
                    </SView>} />
                <DinamicTable.Col key='estado' label='Estado' width={110}
                    data={e => estadoConexion(e.row).label}
                    customComponent={e => { const s = estadoConexion(e.row); return <Badge label={s.label} color={s.color} textStyle={e.textStyle} /> }} />
                <DinamicTable.Col key='ultima_conexion' label='Ultimo cambio de conexion' width={150}
                    data={e => formatFecha(fechaEvento(e.row.historial?.conexion))} />
                <DinamicTable.Col key='ultima_sincronizacion' label='Ultima sincronizacion' width={150}
                    data={e => formatFecha(ultimaSincronizacion(e.row)?.fecha)}
                    customComponent={e => {
                        const s = ultimaSincronizacion(e.row);
                        if (!s) return <Badge label="Nunca" color={STheme.color.gray} textStyle={e.textStyle} />
                        return <Badge label={formatFecha(s.fecha)} color={s.ok ? STheme.color.success : STheme.color.warning} textStyle={e.textStyle} />
                    }} />
                <DinamicTable.Col key='ultima_marcacion' label='Ultima marcacion' width={140}
                    data={e => formatFecha(fechaEvento(e.row.historial?.marcacion) || e.row.ultimo_evento)} />
                <DinamicTable.Col key='usuarios' label='Usuarios' width={70} data={e => e.row.usuarios ?? 0} />
                <DinamicTable.Col key='huellas' label='Huellas' width={70} data={e => e.row.huellas ?? 0} />
                <DinamicTable.Col key='ip' label='IP' width={120} data={e => e.row.ip ? e.row.ip + (e.row.puerto ? ":" + e.row.puerto : "") : ""} />
                <DinamicTable.Col key='mac' label='MAC' width={130} data={e => e.row.mac ?? ""} />
            </DinamicTable>
        </SPage>
    }
}
