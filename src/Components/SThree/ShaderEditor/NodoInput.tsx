import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import NodeConnector from "./NodeConnector";

import { useGetBoardValues } from "./Board";
import { STInput, STNode, STOutput } from "../STNode";
import { STConectorTypeColor } from "../STNode/STNode";
import InputTypes from "./InputTypes";



const NodoInput = ({ stinput }: { stinput: STInput<any> }) => {
    const getBoardValues = useGetBoardValues();
    // const val = stinput.eval();
    const inputType = (stinput.props.inputType ?? "ITDefault") as keyof typeof InputTypes;
    const CLASSINPUT = InputTypes[inputType];
    return <SView row col={"xs-12"} style={{
        alignItems: "center",
        minHeight: 30,
        paddingLeft: 8,
        paddingRight: 8
    }}>
        {CLASSINPUT ? <CLASSINPUT stinput={stinput as any} /> : null}
        {!stinput.props.connectorType ? null : <NodeConnector stconnector={stinput} size={10} style={{
            left: -5,
            backgroundColor: STConectorTypeColor[stinput.props.connectorType],
        }} />}
        {/* <NodeConnector stconnector={stinput} size={10} style={{
            left: -5,
            backgroundColor: STConectorTypeColor[stinput.props.connectorType],
        }} /> */}
    </SView>
}
export default NodoInput;