import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SList, SLoad, SNavigation, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { connect } from 'react-redux';

class Notas extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        this.hilo();
    }

    loadData() {

        SSocket.sendPromise({
            component: "nota",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey()
        }).then(e => {
            Model.nota.Action._dispatch(e);
            // this.setState({ data: e.data })
            // this.hilo();
        })
    }
    hilo() {

        // console.log("Entro al hi.lo")
        new SThread(5000, "hilo_nota_loby", false).start(() => {
            if (this.isClose) return;
            this.hilo();
            this.loadData();

        })
    }

    componentWillUnmount() {
        this.isClose = true;
    }
    Item = ({ observacion, fecha_on, cantidad_participantes, key, color }) => {
        return <SView padding={4} >
            <SHr height={5} />

            <SView style={{
                width: 120,
                height: 110,
                backgroundColor: color ?? "#EDE485",
                borderBottomRightRadius: 10
            }} padding={4} onPress={() => { SNavigation.navigate("/nota", { pk: key }) }}>
                <SView flex style={{ alignItems: "flex-end", position: "absolute", top: -8, right: 0, overflow: "hidden" }}>
                    <SIcon name={"pinchito"} width={14} height={25} />
                </SView>

                <SView col={"xs-12"} flex style={{
                    overflow: "hidden"
                }}>
                    <SHr height={10} />
                    <SText fontSize={12} color={"#000"}>{observacion}</SText>
                </SView>
                <SView row>
                    <SText color={"#666"} fontSize={10}>{new SDate(fecha_on, "yyyy-MM-ddThh:mm:ss").toString("MON dd, yyyy")}</SText>
                    <SView flex />
                    <SText color={"#666"} fontSize={10}>+ {cantidad_participantes}</SText>
                    <SView  style={{  position: "absolute", top: -8, right: 0, overflow: "hidden" }}>
                        {/* <SIcon name={"notaEsquina"} width={20} height={35} /> */}
                    </SView>
                </SView>
            </SView>
        </SView>
    }
    render() {
        let notas = Model.nota.Action.getAll();
        if (!notas) return <SLoad />
        return <SView col={"xs-12"} >
            <SView row>
                <SText> Notas</SText>
                <SView width={8} />
                <SText onPress={() => SNavigation.navigate("/nota", {
                    onChange: (e) => {
                        this.state.data[e.key] = e;
                        this.setState({ ...this.state.data })
                    }
                })}> + </SText>
            </SView>
            <SHr />
            <SList
                horizontal
                data={notas}
                order={[{ key: "fecha_on", order: "desc" }]}
                render={(a) => this.Item(a)}

            />
        </SView>
    }
}


const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Notas);