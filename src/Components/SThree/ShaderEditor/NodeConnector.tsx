import React, { Ref, useEffect, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useGetBoardValues } from "./Board";
import { useSharedValue } from "react-native-reanimated";
import { STheme, SUuid } from "servisofts-component";
import { STInput, STOutput } from "../STNode";
import { buildLinePath } from "./SvgView";

type NodeConnectorProps = {
    style?: ViewStyle,
    size: number,
    stconnector: STInput<any> | STOutput<any>
    onConnect?: (nodeA: any, nodeB: any) => void
}
const NodeConnector = ({ size = 10, style, onConnect, stconnector }: NodeConnectorProps) => {
    const getBoardValues = useGetBoardValues();
    const viewRef = React.useRef<View>(null);
    const value = useSharedValue({ x: 0, y: 0, nx: 0, ny: 0, px: 0, py: 0 })
    const [state, setState] = useState({ line_key: "line" })


    useEffect(() => {
        stconnector.temp.nodeConnectorViewRef = viewRef;

    }, [])

    return <PanGestureHandler
        onGestureEvent={(event) => {
            if (!getBoardValues) return;
            const boardValue = getBoardValues();
            const { translationX, translationY, x, y } = event.nativeEvent
            const fx = (value.value.x) + (x / boardValue.scale.value)
            const fy = (value.value.y) + (y / boardValue.scale.value)
            value.value.px = x;
            value.value.py = y;
            // value.value.nx = fx;
            // value.value.ny = fy;

            if (boardValue.svgViewRef.current) {
                boardValue.svgViewRef.current.createPath({
                    d: buildLinePath({ size, x: value.value.x, y: value.value.y, nx: fx + value.value.nx, ny: fy + value.value.ny }),
                    stroke: STheme.color.text,
                    strokeWidth: 2,
                    fill: "none"
                }, state.line_key);
            }

        }}


        onHandlerStateChange={(e) => {
            if (!getBoardValues) return;
            const boardValue = getBoardValues();
            if (e.nativeEvent.state === State.ACTIVE) {
                if (stconnector instanceof STInput) {
                    if (stconnector.isConnected()) {
                        state.line_key = "line";
                        // state.line_key = stconnector.key + "_" + stconnector.connectOutput?.key;
                        // stconnector.connectOutput?.disconnect()
                        stconnector.disconnect();
                        boardValue.onEvent({ type: "disconnect", node: stconnector.parent })

                        if (boardValue.svgViewRef.current) boardValue.svgViewRef.current.clear();
                        boardValue.paintLinesConnect()
                        // @ts-ignore
                        // stconnector.connectOutput.temp.nodeConnectorViewRef.current?.measureLayout(boardValue.VentanaPadre.current, (x, y) => {
                        //     const fx = ((x) * ((1 / boardValue.scale.value)))
                        //     const fy = ((y) * (1 / boardValue.scale.value))
                        //     value.value.x = fx
                        //     value.value.y = fy;
                        //     // @ts-ignore
                        //     stconnector.connectOutput.temp.nodeConnectorViewRef.current?.measureLayout(viewRef.current, (_x, _y) => {
                        //         const nx = ((_x) * ((1 / boardValue.scale.value)))
                        //         const ny = ((_y) * (1 / boardValue.scale.value))

                        //         value.value.nx = nx;
                        //         value.value.ny = ;


                        //     })
                        // })
                        console.log("Toco un input conectado")
                        // return;
                    } else {
                        state.line_key = "line";
                        console.log("Toco un input desconectado")
                    }
                } else if (stconnector instanceof STOutput) {
                    state.line_key = "line";
                    console.log("Toco un output")
                }
                // @ts-ignore
                viewRef.current?.measureLayout(boardValue.VentanaPadre.current, (x, y, w, h, px, py) => {
                    const fx = ((x) * ((1 / boardValue.scale.value)))
                    const fy = ((y) * (1 / boardValue.scale.value))
                    value.value.x = fx
                    value.value.y = fy;

                })

            } else if (e.nativeEvent.state == State.END) {
                if (boardValue.svgViewRef.current) boardValue.svgViewRef.current.clear();


                let conecto = false;
                boardValue.nodes.filter(a => a.key != stconnector.parent.key).map(nodo => {
                    let conectors;
                    if (stconnector instanceof STInput) {
                        conectors = nodo._outputs;
                    } else if (stconnector instanceof STOutput) {
                        conectors = nodo._inputs;
                    }
                    if (!conectors) return;
                    if (conecto) return;
                    conectors.filter(e => !!e?.temp?.nodeConnectorViewRef).forEach(connector_to => {
                        if (conecto) return;
                        // @ts-ignore
                        connector_to.temp.nodeConnectorViewRef.current.measureLayout(viewRef.current, (x, y, w, h, px, py) => {
                            if (conecto) return;
                            const correction = 8;
                            if (
                                (value.value.px >= x - correction && value.value.px <= x + w + correction)
                                && (value.value.py >= y - correction && value.value.py <= y + h + correction)
                            ) {
                                if (stconnector instanceof STInput) {
                                    stconnector.connect(connector_to as any);
                                    boardValue.onEvent({ type: "connect", node: stconnector.parent })
                                    boardValue.paintLinesConnect()
                                    conecto = true;
                                    // connector_to.connect(stconnector)
                                    // conectors = nodo._outputs;
                                } else if (stconnector instanceof STOutput) {
                                    connector_to.connect(stconnector as any);
                                    boardValue.onEvent({ type: "connect", node: stconnector.parent })
                                    boardValue.paintLinesConnect()
                                    conecto = true;
                                    // stconnector.connect(connector_to as STInput<any>);
                                    // conectors = nodo._inputs;
                                }
                                // console.log(stconnector, "se conecto a este conector", connector_to)
                            }

                        })
                    })

                })
                boardValue.paintLinesConnect()
                // const connectors = boardValue.getConnectors();
                // const keys_nodes = Object.keys(connectors).filter(key_node => key_node != stconnector.parent.key)
                // keys_nodes.map((_key_node) => {
                //     // const keys_connectors = Object.keys(connectors[_key_node]).filter(a => !(a == stconnector.key))
                //     const keys_connectors = Object.keys(connectors[_key_node])
                //     keys_connectors.map(key_connector => {
                //         const connector = connectors[_key_node][key_connector];
                //         const connector_ref = connector.viewRef;

                //         // @ts-ignore
                //         connector_ref.current.measureLayout(viewRef.current, (x, y, w, h, px, py) => {
                //             const correction = 8;
                //             if (
                //                 (value.value.px >= x - correction && value.value.px <= x + w + correction)
                //                 && (value.value.py >= y - correction && value.value.py <= y + h + correction)
                //             ) {
                //                 console.log(stconnector, "se conecto a este conector", connector.stconnector)
                //                 // if (onConnect) onConnect(id, k);
                //                 // const boardValue = getBoardValues();
                //                 // state.connectors_connected.push(connector);
                //             }

                //         })
                //     })
                // })

            } else if (e.nativeEvent.state == State.CANCELLED || e.nativeEvent.state == State.FAILED) {
                boardValue.paintLinesConnect()
            }
            if (boardValue.svgViewRef.current) {
                boardValue.svgViewRef.current.removePath(state.line_key)


            }

        }
        }
    >
        <View ref={viewRef} style={[styles.ball, {
            width: size, height: size,
        }, style]} onLayout={(e) => {
            // console.log(e);

        }} >
        </View>
    </PanGestureHandler >
}

export default NodeConnector;


const styles = StyleSheet.create({
    ball: {
        width: 12, height: 12,
        backgroundColor: "#ff0",
        borderRadius: 100,
        position: "absolute",
        borderWidth: 1,
        borderColor: "#000"
    },

});