import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SImage, SInput, SLoad, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import SIconApp from '../../../Assets/SIconApp';
import ZKTeco from './zkteco';

const KEY = "PopupSucursalHuella";

// Selector de sucursal para el registro de huella.
// Las sucursales con huellero (punto de venta en zkteco) salen primero y marcadas.
export default class PopupSucursalHuella extends Component {
    static open(props) {
        SPopup.open({
            key: KEY,
            content: <SView style={{
                width: "100%",
                height: 520,
                maxHeight: "100%",
                maxWidth: 440,
                borderRadius: 12,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background,
                overflow: "hidden",
            }} withoutFeedback>
                <PopupSucursalHuella {...props} />
            </SView>
        });
    }

    static close() {
        SPopup.close(KEY);
    }

    state = {
        sucursales: null,
        conHuellero: {},
        search: "",
        error: null,
    };

    componentDidMount() {
        this.loadSucursales();
        ZKTeco.getPuntosVenta().then(puntos => {
            const conHuellero = {};
            puntos.forEach(p => conHuellero[p.key_sucursal] = true);
            this.setState({ conHuellero });
        }).catch(e => console.log("[zkteco] punto_venta getAll", e));
    }

    // Empresa seleccionada en redux (la misma que usa el perfil). MDL.empresa.select puede estar vacio aqui.
    loadSucursales() {
        const key_empresa = Model.empresa.Action.getKey();
        if (!key_empresa) {
            this.setState({ sucursales: [], error: "No hay una empresa seleccionada" });
            return;
        }
        SSocket.sendPromise({
            service: "empresa",
            component: "sucursal",
            type: "getByKeyEmpresa",
            estado: "cargando",
            key_empresa: key_empresa,
            key_usuario: Model.usuario.Action.getKey(),
        }, 15000).then(e => {
            if (e.estado != "exito") throw e;
            const sucursales = Object.values(e.data ?? {}).filter(s => s.estado != 0);
            this.setState({ sucursales });
        }).catch(e => {
            console.log("[huella] sucursal getByKeyEmpresa", e);
            this.setState({ sucursales: [], error: e?.error == "timeOut" ? "El servidor no respondio, intenta nuevamente" : "No se pudo cargar las sucursales" });
        });
    }

    getLista() {
        const search = this.state.search.trim().toLowerCase();
        return (this.state.sucursales ?? [])
            .filter(s => !search || `${s.descripcion ?? ""} ${s.direccion ?? ""}`.toLowerCase().includes(search))
            .sort((a, b) => {
                const ha = this.state.conHuellero[a.key] ? 0 : 1;
                const hb = this.state.conHuellero[b.key] ? 0 : 1;
                if (ha != hb) return ha - hb;
                return (a.descripcion ?? "").localeCompare(b.descripcion ?? "");
            });
    }

    select(sucursal) {
        PopupSucursalHuella.close();
        this.props.onSelect?.(sucursal);
    }

    renderHeader() {
        return <SView col={"xs-12"} style={{ padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: STheme.color.card }}>
            <SView col={"xs-12"} row center>
                <SView flex>
                    <SText fontSize={16} bold>{this.props.simular ? "Simular registro de huella" : "Registrar huella"}</SText>
                    <SText fontSize={12} color={STheme.color.gray}>Selecciona la sucursal donde esta el huellero</SText>
                </SView>
                <SView width={32} height={32} center onPress={() => PopupSucursalHuella.close()}>
                    <SText fontSize={18} color={STheme.color.gray}>✕</SText>
                </SView>
            </SView>
            <SHr height={12} />
            <SInput
                icon={<SIconApp fill={"#b8b9b9"} name="Search" height={16} />}
                placeholder="Buscar sucursal..."
                value={this.state.search}
                autoFocus
                style={{ height: 38, borderRadius: 8 }}
                onChangeText={text => this.setState({ search: text })}
            />
        </SView>
    }

    renderItem = ({ item }) => {
        const huellero = !!this.state.conHuellero[item.key];
        return <SView col={"xs-12"} row center
            style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: STheme.color.card }}
            onPress={() => this.select(item)}>
            <SView width={40} height={40} card style={{ borderRadius: 8, overflow: "hidden" }}>
                <SImage src={Model.sucursal._get_image_download_path(SSocket.api, item.key)} />
            </SView>
            <SView width={12} />
            <SView flex>
                <SText bold numberOfLines={1}>{item.descripcion}</SText>
                {item.direccion ? <SText fontSize={11} color={STheme.color.gray} numberOfLines={1}>{item.direccion}</SText> : null}
            </SView>
            {!huellero ? null : <SView row center style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: STheme.color.success + "22" }}>
                <SView width={12} height={12}><SIconApp name={"Fp"} fill={STheme.color.success} /></SView>
                <SView width={4} />
                <SText fontSize={10} color={STheme.color.success}>Huellero</SText>
            </SView>}
            <SView width={8} />
            <SText color={STheme.color.gray}>›</SText>
        </SView>
    }

    renderLista() {
        if (!this.state.sucursales) return <SView flex center><SLoad /></SView>
        const lista = this.getLista();
        if (!lista.length) return <SView flex center>
            <SText color={STheme.color.gray}>{this.state.error ?? (this.state.search ? "Ninguna sucursal coincide con la busqueda" : "No hay sucursales")}</SText>
        </SView>
        return <FlatList
            style={{ flex: 1, width: "100%" }}
            data={lista}
            keyExtractor={item => item.key}
            renderItem={this.renderItem}
            keyboardShouldPersistTaps="handled"
        />
    }

    render() {
        return <SView col={"xs-12"} flex style={{ height: "100%" }}>
            {this.renderHeader()}
            {this.renderLista()}
        </SView>
    }
}
