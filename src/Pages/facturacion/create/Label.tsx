import React from "react";
import { TextStyle } from "react-native";
import { SText, STextProps } from "servisofts-component";

const customStyle: any = "factura";
const Label = (props: { style?: TextStyle, children?: any, } & STextProps) => {
    return <SText
        fontSize={12}
        {...props}
        style={{
            fontFamily: "Roboto",
            // @ts-ignore
            ...props.style
        }} >
        {props.children}
    </SText>
}
export default Label;