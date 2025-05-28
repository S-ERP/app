import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import { STInput } from "../../STNode";
import { useGetBoardValues } from "../Board";


const ITSelect = ({ stinput }: { stinput: STInput<string> }) => {
    const getBoardValues = useGetBoardValues();
    const val = stinput.eval();
    return <SView col={"xs-12"} row style={{
        alignItems: "center",
    }} >
        <SText>{stinput.props.label}</SText>
        <SView width={4} />
        {stinput.isConnected() ? null :
            <SView flex>
                <SInput
                    style={{ textAlign: "center" }}
                    height={20}
                    type="select"
                    options={stinput.props.options ?? ["NO OPTIONS"]}
                    defaultValue={val + ""}
                    onChangeText={(e) => {
                        stinput.setValue(e);
                        if (getBoardValues) getBoardValues().onEvent({ type: "change", node: stinput.parent })
                    }} />
            </SView>
        }
    </SView>
}
export default ITSelect;