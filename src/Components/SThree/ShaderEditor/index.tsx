import React, { useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Board from "./Board";
import { SList, SLoad, SStorage, SText, SView } from "servisofts-component";

import JsonLoader from "../STNode/JsonLoader"
import { STNodeTypes } from "../STNode";


// const Nodes = test();

// const NodesExampleData: NodoData[] = [
//     { key: "nodecolor", type: "THREE.Color", x: 0, y: 0, data: {} },
//     { key: "nodematerial", type: "THREE.MeshBasicMaterial", x: 300, y: 0, data: {} },
// ]
const val = Platform.select({
    native: 2,
    web: 5,
    default: 1
})
export default class ShaderEditor extends React.Component {
    width = 1024 * val;
    height = 1024 * val;
    refView?: View;
    state: any = {
        ready: false,
        nodes: []
    }
    componentDidMount(): void {
        SStorage.getItem("nodo_in_edit", (resp: any) => {
            if (resp) {
                const nodesJSON = JSON.parse(resp);
                const nodes = new JsonLoader().load(nodesJSON);
                this.state.nodes = nodes;
            }
            this.setState({ ready: true })
        });
    }
    render() {
        if (!this.state.ready) return <SLoad />
        return <>
            <Board width={this.width} height={this.height} nodes={this.state.nodes} onEvent={({ node, type }) => {
                console.log("OnEvent", type)
                this.setState({ ...this.state })
            }} />
            <SView style={{
                position: "absolute",
                right: 0,
                width: 200,
            }}>
                <SList data={Object.keys(STNodeTypes)} render={(key: keyof typeof STNodeTypes) => {
                    return <SView col={"xs-12"} onPress={() => {
                        const CLASS = STNodeTypes[key];
                        const nodoNumero2 = new CLASS();
                        nodoNumero2.x = -400;
                        nodoNumero2.y = 200;
                        this.state.nodes.push(nodoNumero2)
                        this.setState({ ...this.state })
                    }} card padding={4}>
                        <SText>{key}</SText>
                    </SView>
                }} />
            </SView>
            <SText style={{
                width: 100,
                height: 30,
                position: "absolute",
            }} center card onPress={() => {
                this.setState({ ...this.state })
                const json = this.state.nodes.map((o: any) => o.toJson())
                SStorage.setItem("nodo_in_edit", JSON.stringify(json));
                console.log(json)
            }}>{"GUARDAR"}</SText>
        </>
    }
}

