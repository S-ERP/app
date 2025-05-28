import React, { useEffect, useRef, useState } from "react";
import { SHr, SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import { STOutput } from "../../STNode";





const OTPreviewValue = ({ stoutput }: { stoutput: STOutput<any> }) => {


    let val = stoutput.eval()
    if (typeof val == "object") {
        val = JSON.stringify(val, null, "\t")
    }
    if (typeof val == "number") {
        val = val.toFixed(3)
    }
    // if (val != value) setValue(val)

    return <SView col={"xs-12"} style={{
        alignItems: "center",
    }}>
        <SText>{stoutput.props.label}</SText>
        <SView col={"xs-12"} card height={200} padding={4} center>
            <SText>{val}</SText>
        </SView>
    </SView>
}

export default OTPreviewValue;