import React from "react";
import { TouchableOpacityProps } from "react-native";
import { SIcon, SPage, SText, SView, SViewProps } from "servisofts-component";

export default class FloatButtom extends React.Component<SViewProps> {
    render() {
        return <SView style={{
            position: "absolute",
            bottom: 20,
            right: 8,
            borderRadius: 4,
            overflow: "hidden",
        }} width={50} height={50} {...this.props}>
            <SIcon name='Add' />
        </SView>
    }
}