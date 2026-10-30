import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SLoad, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import ZKTeco from './zkteco';
import iniciarRegistroHuella from './iniciarRegistroHuella';

// Equivalente a usuario_huella/Components/HuellasDeUsuario de Calistenia.
// Por ahora solo se usa la huella derecha (codigo 2), igual que en Calistenia.
const CODIGO = 2;

class HuellasUsuario extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            huellas: null,
            error: null,
        };
    }

    componentDidMount() {
        this.load();
        // Al volver de la pantalla de registro el perfil sigue montado: se actualiza con el mensaje de registro.
        this.onMessage = (obj) => this.onRegistro(obj);
        SSocket.addEventListener("onMessage", this.onMessage);
    }

    componentWillUnmount() {
        SSocket.removeEventListener("onMessage", this.onMessage);
    }

    onRegistro(obj) {
        if (obj?.component != "usuario_huella" || obj?.type != "registro" || obj?.estado != "exito") return;
        const data = obj.data ?? {};
        if (data.key_usuario != this.props.key_usuario) return;
        this.setState((st) => ({ huellas: [...(st.huellas ?? []).filter(h => h.codigo != data.codigo), data] }));
    }

    load() {
        this.setState({ loading: true, error: null });
        ZKTeco.getHuellasByKeyUsuario(this.props.key_usuario).then(huellas => {
            this.setState({ loading: false, huellas });
        }).catch(e => {
            console.log("[zkteco] usuario_huella getAll", e);
            this.setState({ loading: false, huellas: [], error: e?.error ?? "No se pudo conectar con el servicio de huellas" });
        })
    }

    getHuella() {
        return (this.state.huellas ?? []).find((x) => x.codigo == CODIGO);
    }

    // Con caja abierta se usa directo su sucursal (se puede cambiar en la pantalla del sensor);
    // sin caja se elige en el popup.
    seleccionarSucursal() {
        if (this.state.buscandoCaja) return;
        this.setState({ buscandoCaja: true });
        iniciarRegistroHuella({ key_usuario: this.props.key_usuario, nombre: this.props.nombre, huella: this.getHuella(), codigo: CODIGO })
            .finally(() => this.setState({ buscandoCaja: false }));
    }

    eliminar(huella) {
        SPopup.confirm({
            title: "Eliminar", message: "¿Esta seguro de eliminar la huella?", onPress: () => {
                ZKTeco.eliminarHuella(huella).then(() => this.load()).catch(e => {
                    console.log("[zkteco] usuario_huella editar", e);
                    SPopup.alert("No se pudo eliminar la huella");
                })
            }
        })
    }

    render() {
        if (!this.props.key_usuario) return null;
        if (this.state.loading) return <SLoad />
        const huella = this.getHuella();
        return <SView col={"xs-12"}>
            <SText fontSize={16} bold>Huella digital</SText>
            <SHr />
            <SView col={"xs-12"} card padding={8} row center>
                <SView width={60} height={60} center>
                    <SIcon name={"Fp"} fill={huella ? STheme.color.success : STheme.color.text + "22"} />
                </SView>
                <SView width={12} />
                <SView flex>
                    <SText bold>Huella <SText bold color={STheme.color.warning}>derecha</SText></SText>
                    <SText color={STheme.color.gray}>{huella ? "Registrada" : "Sin registrar"}</SText>
                    {this.state.error ? <SText fontSize={11} color={STheme.color.danger}>{this.state.error}</SText> : null}
                </SView>
                {!huella ? null : <SView padding={8} onPress={() => this.eliminar(huella)}>
                    <SText color={STheme.color.danger} underLine>Eliminar</SText>
                </SView>}
                <SView card padding={8} style={{ backgroundColor: STheme.color.warning }} onPress={() => this.seleccionarSucursal()}>
                    <SText>{this.state.buscandoCaja ? "Cargando..." : huella ? "Cambiar huella" : "Registrar huella"}</SText>
                </SView>
            </SView>
        </SView>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(HuellasUsuario);
