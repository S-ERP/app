import React from "react";
import { SPage, SText, SUuid, SView } from "servisofts-component";
import Pizarra from "./Pizarra";
import Nodo from "./Nodo";
import Recargar from "../Recargar";
import Puerto from "./Puerto";

export default class index extends React.Component {
    state = {
        nodos: [
            { key: "1", x: 0, y: 0, label: "Nodo A", },
            { key: "2", x: 0, y: 100, label: "Nodo B", inputs: ["1"] },
        ]
    }
    render() {
        return <SPage title={"Pizarra 2"} disableScroll>
            <Pizarra >
                {this.state.nodos.map(nodo => <NodoTest nodo={nodo} parent={this} />)}
            </Pizarra>
            <SView style={{ position: "absolute" }}>
                <Recargar onFinish={() => {
                    this.state.nodos.push({
                        key: SUuid(),
                        x: 0,
                        y: 0,
                        label: "port"
                    })
                    this.forceUpdate();
                }} />
            </SView>
        </SPage>
    }
}

const NodoTest = ({ nodo, parent }) => {
    const [state, setState] = React.useState({
        cant: 0,
    });
    state.cant++;
    return <Nodo key={nodo.key} id={nodo.key} {...nodo} style={{
        width: 200,
        backgroundColor: "#fff",
        padding: 10
    }} memo={(prev, next) => prev.label == next.label} >
        <SText>{nodo.label} {state.cant}</SText>
        <SText onPress={() => {
            nodo.label = SUuid();
            parent.forceUpdate();
        }}>{"Change Name"}</SText>
        <Puerto
            id={"key"}
            type="input"
            value={nodo.inputs}
            style={{
                backgroundColor: "red",
                position: "absolute",
                width: 30,
                height: 30,
                borderRadius: 100,
                left: -10,
                top: -8,
            }} />
        <Puerto id={"key"}
            type="output"
            value={nodo.key}
            style={{
                backgroundColor: "blue",
                position: "absolute",
                width: 30,
                height: 30,
                borderRadius: 100,
                right: 0,
                top: 0,
            }} />
    </Nodo>
}