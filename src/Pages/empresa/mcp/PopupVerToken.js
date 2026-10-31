import React, { Component } from 'react';
import { SHr, SLoad, SPopup, SText, STheme, SView } from 'servisofts-component';
import SCopy from '../../../Components/SCopy';
import { verToken } from './api';

const KEY = "PopupVerToken";

// Muestra un token guardado (lo descifra el server; solo el dueño, quien lo creó o /empresa/mcp otro_usuario).
export default class PopupVerToken extends Component {
    static open(props) {
        SPopup.open({
            key: KEY,
            content: <SView style={{
                width: "100%", maxWidth: 520, borderRadius: 12, padding: 16,
                borderColor: STheme.color.card, borderWidth: 1, backgroundColor: STheme.color.background,
            }} withoutFeedback>
                <PopupVerToken {...props} />
            </SView>
        });
    }

    state = { token: null, error: null };

    componentDidMount() {
        verToken(this.props.row.key)
            .then(token => this.setState({ token }))
            .catch(e => this.setState({ error: e?.error ?? "No se pudo obtener el token" }));
    }

    render() {
        const { row, usuario } = this.props;
        return <SView col={"xs-12"}>
            <SView row center>
                <SText fontSize={16} bold flex>{row.descripcion}</SText>
                <SView width={32} height={32} center onPress={() => SPopup.close(KEY)}>
                    <SText fontSize={18} color={STheme.color.gray}>✕</SText>
                </SView>
            </SView>
            <SText fontSize={12} color={STheme.color.gray}>{`Usuario: ${usuario || row.key_usuario} · ${row.alcance == "escritura" ? "Lectura y escritura" : "Solo lectura"}`}</SText>
            <SHr height={12} />
            {this.state.error ? <SText color={STheme.color.danger}>{this.state.error}</SText>
                : !this.state.token ? <SLoad />
                    : <>
                        <SView card style={{ padding: 12, borderRadius: 8 }} onPress={() => SCopy.copy(this.state.token)}>
                            <SText fontSize={13} style={{ fontFamily: "monospace" }}>{this.state.token}</SText>
                        </SView>
                        <SHr height={6} />
                        <SText fontSize={11} color={STheme.color.gray}>Toque el token para copiarlo. Trátelo como una contraseña.</SText>
                    </>}
        </SView>
    }
}
