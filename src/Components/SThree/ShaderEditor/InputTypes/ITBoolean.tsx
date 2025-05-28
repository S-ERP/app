import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import { STInput } from "../../STNode";
import { useGetBoardValues } from "../Board";


const ITBoolean = ({ stinput }: { stinput: STInput<boolean> }) => {
    const getBoardValues = useGetBoardValues();
    const val = stinput.eval();
    return <SView col={"xs-12"} row style={{
        alignItems: "center",
    }} >
        <SText>{stinput.props.label}</SText>
        <SView width={4} />
        {stinput.isConnected() ? null :
            <SView flex style={{ alignItems: "flex-end" }} >
                <SView width={20} height={20}>
                    <SInput
                        flex
                        style={{ textAlign: "right", paddingEnd: 8, }}
                        height={20}
                        type="checkBox"
                        defaultValue={!!val}
                        onChangeText={(e) => {
                            stinput.setValue(!!e);
                            if (getBoardValues) getBoardValues().onEvent({ type: "change", node: stinput.parent })
                        }} />
                </SView>
            </SView>
        }
    </SView>
}
export default ITBoolean;