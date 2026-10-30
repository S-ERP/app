import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Animated } from 'react-native';
import SSocket from 'servisofts-socket';
import { SHr, SIcon, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import ZKTeco, { isZkMessage } from './zkteco';
import Simulador, { ESCENARIOS } from './simulador';
import PopupSucursalHuella from './PopupSucursalHuella';

// Equivalente a lector_huella/Components/EsperandoHuella de Calistenia.
// Params: pk (key de la persona: usuario o cliente), key_sucursal, codigo, nombre (opcional), key_huella (opcional, para editar)
// simular=<escenario> (opcional): reproduce un registro grabado sin lector ni servidor, ver simulador.js
class registro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paso: "solicitando", // solicitando | esperando | sincronizando | exito | error
            lecturas: 0, // lecturas correctas de las 3 que pide el lector
            lecturaError: false,
            error: null,
            logs: [],
            showLogs: true,
        };
        this.solicitud = {
            key_usuario: SNavigation.getParam("pk"),
            key_sucursal: SNavigation.getParam("key_sucursal"),
            codigo: parseInt(SNavigation.getParam("codigo", "2")),
        };
        const key_huella = SNavigation.getParam("key_huella");
        if (key_huella) this.solicitud.key = key_huella;
        this.animColor = new Animated.Value(0);
        this.nombre = SNavigation.getParam("nombre");
        this.simular = SNavigation.getParam("simular");
        this.api = this.simular ? new Simulador(this.simular) : ZKTeco;
    }

    componentDidMount() {
        this.onMessage = (obj) => this.handleMessage(obj);
        SSocket.addEventListener("onMessage", this.onMessage);
        this.solicitar();
    }

    componentWillUnmount() {
        this.unmounted = true;
        SSocket.removeEventListener("onMessage", this.onMessage);
        clearTimeout(this.timerVolver);
        if (this.simular) this.api.detener();
    }

    setStateSafe(s) {
        if (this.unmounted) return;
        this.setState(s);
    }

    log(dir, obj) {
        console.log("[zkteco]", dir, obj?.component, obj?.type, obj?.estado, obj);
        const item = { dir, fecha: new Date().toLocaleTimeString(), obj };
        this.setStateSafe((st) => ({ logs: [item, ...st.logs].slice(0, 40) }));
    }

    simularEscenario(nombre) {
        this.api.detener();
        this.simular = nombre;
        this.api = new Simulador(nombre);
        this.solicitar();
    }

    cambiarSucursal() {
        PopupSucursalHuella.open({
            simular: !!this.simular,
            onSelect: (sucursal) => {
                this.solicitud.key_sucursal = sucursal.key;
                this.setState({ sucursalNombre: sucursal.descripcion });
                this.solicitar();
            }
        });
    }

    solicitar() {
        if (this.simular) this.api.detener();
        this.setState({ paso: "solicitando", error: null, lecturas: 0, lecturaError: false });
        this.log("OUT", { component: "lector_huella", type: "solicitud_registro_huella", data: this.solicitud });
        this.api.solicitudRegistroHuella(this.solicitud).then(e => {
            this.log("RESP", e);
            // Si el registro llego antes que la respuesta, no retrocedemos el paso.
            if (this.state.paso == "solicitando") this.setStateSafe({ paso: "esperando" });
        }).catch(e => {
            this.log("RESP", e);
            this.setStateSafe({ paso: "error", error: e?.error == "timeOut" ? "El servidor no respondio la solicitud (timeOut)" : (e?.error ?? "No se logro solicitar el registro de huella") });
        })
    }

    handleMessage(obj) {
        if (!isZkMessage(obj)) return;
        if (obj.key_sucursal && obj.key_sucursal != this.solicitud.key_sucursal) return;
        this.log("IN", obj);

        // Lectura del sensor
        if (obj.component == "lector_huella" && obj.type == "onEvent") {
            // data.i = lecturas correctas previas (el lector reinicia en 0 tras 3 errores)
            if (obj.estado == "exito") {
                this.flash(1);
                this.setState((st) => ({ lecturas: (obj.data?.i ?? st.lecturas) + 1, lecturaError: false }));
            } else if (obj.estado == "error") {
                this.flash(-1);
                this.setState({ lecturaError: true });
            }
            return;
        }

        // Registro finalizado. El microservicio responde component "dispositivo",
        // el server de Calistenia lo renombra a "usuario_huella". Aceptamos ambos hasta confirmar.
        if ((obj.component == "usuario_huella" || obj.component == "dispositivo") && obj.type == "registro" && obj.estado == "exito") {
            const data = obj.data ?? {};
            if (data.key_usuario && data.key_usuario != this.solicitud.key_usuario) return;
            if (data.key_sucursal && data.key_sucursal != this.solicitud.key_sucursal) return;
            if (this.state.paso == "sincronizando" || this.state.paso == "exito") return;
            this.sincronizar();
        }
    }

    // Registro terminado. La sincronizacion de molinetes NO se hace desde aqui:
    // punto_venta/getMolinetesByKeySucursal de zkteco ignora la sucursal y devuelve molinetes de Calistenia,
    // y sincronizarMolinete reemplaza todos los usuarios del molinete (delete_all).
    // La sincronizacion se hara en el server serp con los molinetes de sus propios puntos de venta.
    sincronizar() {
        this.setState({ paso: "exito", lecturas: 3, lecturaError: false });
        this.flash(1);
        SNotification.send({
            key: "huella_registrada",
            title: "Huella registrada",
            body: "La huella se registro correctamente.",
            color: STheme.color.success,
            time: 5000,
        });
        this.volver();
    }

    // Vuelve solo a la pantalla anterior tras mostrar el exito un momento.
    // La sincronizacion de molinetes sigue en segundo plano.
    volver() {
        clearTimeout(this.timerVolver);
        this.timerVolver = setTimeout(() => {
            if (!this.unmounted) SNavigation.goBack();
        }, 1500);
    }

    flash(val) {
        Animated.timing(this.animColor, { toValue: val, duration: 150, useNativeDriver: true }).start(() => {
            Animated.timing(this.animColor, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        });
    }

    renderEstado() {
        switch (this.state.paso) {
            case "solicitando":
                return <><SLoad /><SHr /><SText>Solicitando lector de la sucursal...</SText></>
            case "esperando":
                return <>
                    <SText fontSize={22} bold center>Pon el dedo en el huellero</SText>
                    <SHr />
                    {this.state.lecturaError
                        ? <SText center color={STheme.color.danger}>La lectura no coincide, vuelve a poner el mismo dedo</SText>
                        : <SText center color={STheme.color.gray}>{this.state.lecturas == 0 ? "Se tomaran 3 lecturas del mismo dedo" : "Levanta el dedo y vuelve a ponerlo"}</SText>}
                    <SHr height={12} />
                    {this.renderProgreso()}
                </>
            case "sincronizando":
                return <><SLoad /><SHr /><SText>Huella registrada, sincronizando...</SText></>
            case "exito":
                return <>
                    <SText fontSize={22} bold color={STheme.color.success}>Huella registrada</SText>
                    <SHr />
                    {this.renderProgreso()}
                    <SHr />
                    <SText color={STheme.color.gray}>Volviendo al perfil...</SText>
                </>
            case "error":
                return <>
                    <SText fontSize={16} bold color={STheme.color.danger}>No se logro registrar la huella</SText>
                    <SHr />
                    <SText color={STheme.color.gray}>{this.state.error}</SText>
                    <SHr height={16} />
                    <SView card padding={8} onPress={() => this.solicitar()}><SText>Intentar nuevamente</SText></SView>
                </>
        }
    }

    renderProgreso() {
        return <SView row center>
            {[1, 2, 3].map(n => <SView key={n} style={{
                width: 14, height: 14, borderRadius: 7, margin: 4,
                backgroundColor: n <= this.state.lecturas ? STheme.color.success : STheme.color.text + "22",
            }} />)}
        </SView>
    }

    renderSimulador() {
        if (!this.simular) return null;
        return <SView col={"xs-12"} card padding={8} style={{ borderWidth: 1, borderColor: STheme.color.warning }}>
            <SText bold color={STheme.color.warning}>MODO SIMULACION</SText>
            <SText fontSize={11} color={STheme.color.gray}>No usa el lector ni guarda nada en el servidor.</SText>
            <SHr />
            <SView col={"xs-12"} row>
                {Object.keys(ESCENARIOS).map(k => <SView key={k} card padding={6} style={{ margin: 2, backgroundColor: k == this.simular ? STheme.color.warning : undefined }} onPress={() => this.simularEscenario(k)}>
                    <SText fontSize={11}>{ESCENARIOS[k].label}</SText>
                </SView>)}
            </SView>
        </SView>
    }

    renderSensor() {
        return <>
            <SView style={{ width: 200, height: 200 }}>
                <SView animated col={"xs-12"} colSquare center style={{
                    borderRadius: 8, overflow: 'hidden',
                    backgroundColor: this.animColor.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [STheme.color.danger, STheme.color.card, STheme.color.success]
                    }),
                }}>
                    <SIcon name={"Fp"} width={"60%"} fill={"#666"} />
                </SView>
            </SView>
            <SHr />
            <SText color={STheme.color.warning}>{this.solicitud.codigo == 1 ? "HUELLA IZQUIERDA" : "HUELLA DERECHA"}</SText>
        </>
    }

    renderLogs() {
        return <SView col={"xs-12"}>
            <SText underLine color={STheme.color.gray} onPress={() => this.setState({ showLogs: !this.state.showLogs })}>
                {this.state.showLogs ? "Ocultar" : "Ver"} mensajes del socket (debug)
            </SText>
            <SHr />
            {!this.state.showLogs ? null : this.state.logs.map((l, i) => <SView key={i} col={"xs-12"} card padding={6} style={{ marginBottom: 4 }}>
                <SText fontSize={11} bold>{l.fecha} [{l.dir}] {l.obj?.service ?? ""} {l.obj?.component} / {l.obj?.type} / {l.obj?.estado}</SText>
                <SText fontSize={10} color={STheme.color.gray}>{JSON.stringify({ ...l.obj, data: typeof l.obj?.data == "string" && l.obj.data.length > 200 ? "[" + l.obj.data.length + " chars]" : l.obj?.data })}</SText>
            </SView>)}
        </SView>
    }

    render() {
        // Sin nombre por param se asume usuario (no se consulta para clientes: su key no existe en usuario).
        const usuario = this.nombre ? null : (Model.usuario.Action.getByKey(this.solicitud.key_usuario) ?? {});
        const nombre = this.nombre ?? [usuario?.Nombres, usuario?.Apellidos].filter(Boolean).join(" ");
        const sucursal = Model.sucursal.Action.getAll()?.[this.solicitud.key_sucursal];
        return <SPage title={"Registro de huella"}>
            <SView col={"xs-12"} center>
                <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} center>
                    <SHr height={16} />
                    {this.renderSimulador()}
                    <SHr height={16} />
                    <SText fontSize={16} bold>{nombre}</SText>
                    <SView row center>
                        <SText color={STheme.color.gray}>Sucursal: {this.state.sucursalNombre ?? sucursal?.descripcion ?? this.solicitud.key_sucursal}</SText>
                        {this.state.paso == "sincronizando" || this.state.paso == "exito" ? null : <>
                            <SView width={8} />
                            <SText color={STheme.color.link ?? STheme.color.warning} underLine onPress={() => this.cambiarSucursal()}>Cambiar</SText>
                        </>}
                    </SView>
                    <SHr height={24} />
                    {this.renderEstado()}
                    <SHr height={24} />
                    {this.renderSensor()}
                    <SHr height={40} />
                    {this.renderLogs()}
                    <SHr height={40} />
                </SView>
            </SView>
        </SPage>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(registro);
