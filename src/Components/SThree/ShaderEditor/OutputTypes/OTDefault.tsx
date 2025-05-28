import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import { STOutput } from "../../STNode";





const OTDefault = ({ stoutput }: { stoutput: STOutput<any> }) => {
    // const val = stoutput.eval();
    return <SView col={"xs-12"} row style={{
        alignItems: "center",
        justifyContent: "flex-end",
    }}>
        <SText>{stoutput.props.label}</SText>
    </SView>
}

export default OTDefault;