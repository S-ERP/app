import React, { useEffect, useRef, useState } from "react";
import { SIcon, SInput, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import { STInput } from "../../STNode";
import { useGetBoardValues } from "../Board";


const ITNumber = ({ stinput }: { stinput: STInput<number> }) => {
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
                    style={{ textAlign: "right", paddingEnd: 8 }}
                    type="default"
                    height={20}
                    defaultValue={parseFloat(val + "").toFixed(2)}
                    placeholder={"0"}
                    onChangeText={(e) => {
                        const numero = !e ? 0 : parseFloat(e);
                        stinput.setValue(numero);
                        if (getBoardValues) getBoardValues().onEvent({ type: "change", node: stinput.parent })
                    }} />
            </SView>
        }
    </SView>
}
export default ITNumber;