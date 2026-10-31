import React, { Component } from 'react';
import { SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../../MDL';
import Config from '../../../Config';
import FloatMenu from '../../../Components/FloatMenu';
import { anularToken, getTokens } from './api';
import PopupNuevoToken from './PopupNuevoToken';

const URL = "/empresa/mcp";
const puede = (permiso) => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso });
const fecha = (f) => f ? String(f).replace("T", " ").slice(0, 16) : "";

const estadoToken = (row) => {
    if (row.estado <= 0) return { label: "Anulado", color: STheme.color.danger };
    if (row.fecha_vencimiento && new Date(row.fecha_vencimiento) < new Date()) return { label: "Vencido", color: STheme.color.warning };
    return { label: "Activo", color: STheme.color.success };
}

// Tokens MCP de la empresa: crear, ver último uso y anular.
export default class index extends Component {
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
            const tokens = await getTokens();
            return tokens.sort((a, b) => String(b.fecha_on).localeCompare(String(a.fecha_on)));
        } catch (e) {
            SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar los tokens.", color: STheme.color.danger, time: 4000 });
            return [];
        }
    }

    anular(row) {
        SPopup.confirm({
            title: "Anular token",
            message: `¿Anular "${row.descripcion}"? Quien lo use dejará de tener acceso de inmediato.`,
            onPress: () => {
                anularToken(row.key).then(() => {
                    SNotification.send({ title: "Token anulado", body: row.descripcion, color: STheme.color.success, time: 3000 });
                    this.table?.loadData();
                }).catch(e => {
                    SNotification.send({ title: "No se pudo anular", body: e?.error ?? "", color: STheme.color.danger, time: 5000 });
                })
            }
        })
    }

    render() {
        return <SPage title={"Tokens MCP"} disableScroll>
            {!puede("new") ? null : <SView row style={{ padding: 8, justifyContent: "flex-end" }}>
                <SView card center onPress={() => PopupNuevoToken.open({ onCreate: () => this.table?.loadData() })}
                    style={{ height: 34, paddingHorizontal: 14, borderRadius: 8, backgroundColor: STheme.color.success }}>
                    <SText color={"#fff"} bold>+ Nuevo token</SText>
                </SView>
            </SView>}
            <DinamicTable
                ref={ref => this.table = ref}
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                loadData={this.loadData.bind(this)}
                onSelect={(e) => {
                    if (!puede("delete") || e.row.estado <= 0) return;
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.descripcion,
                        options: [{
                            label: "Anular token",
                            icon: <SIcon name="Delete" fill={STheme.color.text} />,
                            onPress: () => this.anular(e.row),
                        }]
                    })
                }}
            >
                <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
                <DinamicTable.Col key='descripcion' label='Descripción' data={e => e.row.descripcion} width={220} />
                <DinamicTable.Col key='alcance' label='Alcance' data={e => e.row.alcance == "escritura" ? "Lectura y escritura" : "Solo lectura"} width={130} />
                <DinamicTable.Col key='token_prefijo' label='Token' data={e => (e.row.token_prefijo ?? "") + "…"} width={120} />
                <DinamicTable.Col key='estado' label='Estado' width={90}
                    data={e => estadoToken(e.row).label}
                    customComponent={e => { const s = estadoToken(e.row); return <SText color={s.color}>{s.label}</SText> }} />
                <DinamicTable.Col key='fecha_on' label='Creado' data={e => fecha(e.row.fecha_on)} width={130} />
                <DinamicTable.Col key='fecha_ultimo_uso' label='Último uso' data={e => fecha(e.row.fecha_ultimo_uso) || "Nunca"} width={130} />
                <DinamicTable.Col key='fecha_vencimiento' label='Vence' data={e => fecha(e.row.fecha_vencimiento) || "—"} width={130} />
            </DinamicTable>
        </SPage>
    }
}
