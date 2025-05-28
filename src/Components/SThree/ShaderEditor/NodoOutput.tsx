import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import NodeConnector from "./NodeConnector";

import { STInput, STNode, STOutput } from "../STNode";
import { STConectorTypeColor } from "../STNode/STNode";
import OutputTypes from "./OutputTypes";





const NodoOutput = ({ stoutput }: { stoutput: STOutput<any> }) => {
    // const val = stoutput.eval();
    const type = (stoutput.props.outputType ?? "OTDefault") as keyof typeof OutputTypes;
    const CLASS = OutputTypes[type];

    return <SView col={"xs-12"} style={{
        minHeight: 30,
        paddingLeft: 8,
        paddingRight: 8,
        justifyContent:"center"
    }}>
        <CLASS stoutput={stoutput} />
        {!stoutput.props.connectorType ? null : <NodeConnector stconnector={stoutput} size={10} style={{
            right: -5,
            top: 10,
            backgroundColor: STConectorTypeColor[stoutput.props.connectorType],
        }} />}
    </SView>
}

export default NodoOutput;