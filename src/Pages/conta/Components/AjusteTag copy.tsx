import React from "react";
import { TextStyle, ViewStyle } from "react-native";
import { SPage, SPopup, SText, STheme, SView } from "servisofts-component";

export default class AjusteTag extends React.Component<{ ajuste: any, onPress?: () => void, style?: ViewStyle, textStyle?: TextStyle }> {
    render() {
        const { ajuste, onPress } = this.props;
        return <SView style={{
            padding: 1,
            paddingHorizontal: 4,
            borderRadius: 4,
            backgroundColor: STheme.colorFromText(ajuste?.key) + "66",
            borderColor: STheme.colorFromText(ajuste?.key),
            borderWidth: 1,
            margin: 1,
            ...this.props.style
        }} onPress={onPress}>
            <SText style={{ fontSize: 10, ...this.props.textStyle }}>{ajuste?.descripcion}</SText>
        </SView>
    }
}