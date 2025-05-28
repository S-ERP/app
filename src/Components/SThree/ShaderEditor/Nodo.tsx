import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import DraggableBox from "./DraggableBox";

import { useGetBoardValues } from "./Board";
import { STInput, STNode, STOutput } from "../STNode";
import NodoOutput from "./NodoOutput";
import NodoInput from "./NodoInput";


export type NodoProps = {
    stnode: STNode,
    onMove: () => void
}



const Nodo = (props: NodoProps) => {
    const getBoardValues = useGetBoardValues();

    const { stnode } = props;
    const { x, y, key, type, _inputs, _outputs } = stnode;
    const [state, setState] = useState({ open: true })

    return <DraggableBox id={key} style={{
        width: stnode.width,
    }} x={x} y={y} onChange={(evt) => {

        stnode.x = evt.x;
        stnode.y = evt.y;
        if (props.onMove) props.onMove();

    }}>
        <SView card col={"xs-12"}>
            <SView col={"xs-12"} backgroundColor={stnode._color} borderRadius={4} padding={6} row center >
                <SView width={10} height={10} style={{
                    transform: [{ rotate: !state.open ? "180deg" : "-90deg" }]
                }} onPress={() => {
                    setState({ open: !state.open })
                }}>
                    <SIcon name="Arrow" fill={STheme.color.text} />
                </SView>
                <SView width={8} />
                <SView flex>
                    <SText bold>{type}</SText>
                </SView>
                <SView width={16} height={16} onPress={() => {
                    if (getBoardValues) getBoardValues().onEvent({ type: "delete", node: stnode })
                }}>
                    <SIcon name="Delete" fill={STheme.color.text} />
                </SView>
            </SView>

            {!state.open ? null : <>
                {_outputs.map(out => <NodoOutput stoutput={out} />)}
                {_inputs.map(inp => <NodoInput stinput={inp} />)}
            </>}
        </SView>
    </DraggableBox>
}

export default Nodo;