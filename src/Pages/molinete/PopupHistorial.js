import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SDate, SHr, SLoad, SPopup, SText, STheme, SView } from 'servisofts-component';
import { EVENTOS, fechaEvento, getHistorial } from './api';

const KEY = "PopupHistorialMolinete";

const COLOR = {
    "300": () => STheme.color.success,
    "301": () => STheme.color.danger,
    "302": () => STheme.color.success,
    "303": () => STheme.color.warning,
};

export const formatFecha = (f) => {
    if (!f) return "";
    try { return new SDate(f.substring(0, 19), "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy hh:mm"); }
    catch (e) { return f; }
}

// Historial de un dispositivo: conexiones, sincronizaciones y marcaciones (mas recientes primero).
export default class PopupHistorial extends Component {
    static open(props) {
        SPopup.open({
            key: KEY,
            content: <SView style={{
                width: "100%", height: 560, maxHeight: "100%", maxWidth: 480,
                borderRadius: 12, borderColor: STheme.color.card, borderWidth: 1,
                backgroundColor: STheme.color.background, overflow: "hidden",
            }} withoutFeedback>
                <PopupHistorial {...props} />
            </SView>
        });
    }

    state = { historial: null, error: null };

    componentDidMount() {
        getHistorial(this.props.dispositivo.key)
            .then(h => this.setState({ historial: h.sort((a, b) => fechaEvento(b).localeCompare(fechaEvento(a))) }))
            .catch(e => this.setState({ historial: [], error: e?.error ?? "No se pudo cargar el historial" }));
    }

    renderItem = ({ item }) => {
        const code = item?.data?.EventType;
        const ev = EVENTOS[code];
        const color = COLOR[code]?.() ?? STheme.color.text;
        return <SView col={"xs-12"} row center style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: STheme.color.card }}>
            <SView width={8} height={8} style={{ borderRadius: 4, backgroundColor: ev ? color : STheme.color.gray }} />
            <SView width={10} />
            <SView flex>
                <SText bold color={ev ? color : STheme.color.text}>{ev ? ev.label : "Marcacion"}</SText>
                {ev ? null : <SText fontSize={11} color={STheme.color.gray}>Pin {item?.data?.Pin ?? "-"}{item?.data?.key_usuario ? " · " + item.data.key_usuario : ""}</SText>}
            </SView>
            <SText fontSize={11} color={STheme.color.gray}>{formatFecha(fechaEvento(item))}</SText>
        </SView>
    }

    render() {
        const d = this.props.dispositivo;
        return <SView col={"xs-12"} flex style={{ height: "100%" }}>
            <SView col={"xs-12"} row center style={{ padding: 16, borderBottomWidth: 1, borderColor: STheme.color.card }}>
                <SView flex>
                    <SText fontSize={16} bold>Historial · {d.descripcion}</SText>
                    <SText fontSize={12} color={STheme.color.gray}>{d.sucursal?.descripcion} · {d.punto_venta?.descripcion}</SText>
                </SView>
                <SView width={32} height={32} center onPress={() => SPopup.close(KEY)}>
                    <SText fontSize={18} color={STheme.color.gray}>✕</SText>
                </SView>
            </SView>
            {!this.state.historial ? <SView flex center><SLoad /></SView>
                : !this.state.historial.length ? <SView flex center><SText color={STheme.color.gray}>{this.state.error ?? "Sin eventos"}</SText></SView>
                    : <FlatList style={{ flex: 1, width: "100%" }} data={this.state.historial} keyExtractor={i => i.key} renderItem={this.renderItem} />}
            <SHr height={4} />
        </SView>
    }
}
