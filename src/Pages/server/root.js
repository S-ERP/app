import React from "react";
import { SInput, SLoad, SPage, SText, STheme, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import Pizarra from "../../Components/Pizarra/Pizarra";
import ServerNodo from "./Components/ServerNodo";
import Recargar from "../../Components/Recargar";
import Puerto from "../../Components/Pizarra/Puerto";
import PizarraNodo from "../../Components/Pizarra/PizarraNodo";
import ServerPopup from "./Components/ServerPopup";

export default class root extends React.Component {
    services;

    state = {

    }
    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const resp_services = await SSocket.sendPromise({
            service: "servicio",
            component: "servicio",
            type: "getAll"
        })
        this.services = Object.values(resp_services.data);

        const reportes_ = await SSocket.sendPromise({
            service: "servicio",
            component: "reporte",
            type: "execute_function",
            func: "get_servicio_habilitado"
        })

        this.services.map(s => {
            s.habilitados = reportes_.data.filter(a => a.key_servicio == s.key)
            s.habilitados.map(a => {
                const sss = this.services.find(b => b.key == a.key_habilitado);

                a.servicio = {
                    ...sss,
                    habilitados: null
                }
                return a;
            })
        })
        this.ready = true;
        this.forceUpdate();
    }
    render() {
        if (!this.ready) return <SLoad />
        return <SPage title={"Server"} disableScroll>
            <Pizarra id="server_services"
                // size={7000}
                scale={0.3}
                exponentDeRedondeoDeMovimiento={50}>
                {this.services.map(service => serviceNodo(service, this.state))}
            </Pizarra>
            <SView style={{
                position: "absolute",
                left: 10,
                bottom: 10,
            }} >
                <Recargar onFinish={() => {
                    this.loadData();
                }} />
            </SView>
            <SView style={{ position: "absolute", top: 10, left: 10, flexDirection: "row" }} >
                <SView width={50} >
                    <SInput type="select2" options={["1", "2"]} label={"version"} placeholder={"1"} customStyle={"erp"}
                        onChangeText={e => {
                            this.setState({
                                version: e
                            })
                        }} />
                </SView>
                <SView width={8} />
                <SView width={100}>
                    <SInput style={{ width: 100 }} type="select2" options={this.services.map(a => a.nombre)} label={"Nombre"} customStyle={"erp"}
                        onChangeText={e => {
                            this.setState({
                                nombre: e
                            })
                        }} />
                </SView>
            </SView>
        </SPage>
    }
}

const serviceNodo = (service, state) => {
    let opacity = 1;
    if (state.version) {
        opacity = 0.4;
        if (service.version == state.version) {
            opacity = 1;
        }
    }
    if (state.nombre) {
        opacity = 0.4;
        if ((service.nombre.toLowerCase().includes(state.nombre.toLowerCase()))) {
            opacity = 1;
        }
    }

    //  (!this.state.version ? true : (a.version == this.state.version))
    return <PizarraNodo key={service.key} id={service.key}
        onDoublePress={() => {
            console.log(service)
            ServerPopup.open({
                server: service
            })
            // this.lastCommit()
        }}
        style={{
            opacity: opacity
        }}>
        <ServerNodo servicio={service} >
            <Puerto type="output" key={service.key + "out"} id="key_servicio" value={service.key} style={{
                // left: -5,
                bottom: -20,
                width: 30,
                height: 10,
                // borderTopRightRadius: 100,
                // borderBottomRightRadius: 100,

            }}
                lineType="line"

                selectLineProps={{
                    strokeWidth: 4,
                    stroke: STheme.color.link
                }}
            />
            <Puerto type="input"
                key={service.key + "inp"}
                id="key_servicio"
                value={service?.habilitados.map(a => a.key_habilitado)}

                selectLineProps={{
                    strokeWidth: 4,
                    zIndex: 999,
                    stroke: STheme.color.warning,
                }}
                style={{
                    right: -40,
                    borderRadius: 100,
                }} />
        </ServerNodo>
    </PizarraNodo>
}