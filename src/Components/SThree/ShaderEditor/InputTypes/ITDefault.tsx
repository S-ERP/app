import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import { STInput } from "../../STNode";


const ITDefault = ({ stinput }: { stinput: STInput<string> }) => {
    // const getBoardValues = useGetBoardValues();
    // const val = stinput.eval();
    return <SView col={"xs-12"} row style={{
        alignItems: "center",
    }} >
        <SText>{stinput.props.label}</SText>
    </SView>
}
export default ITDefault;