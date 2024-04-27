import React from "react";
import { View } from "react-native";
import { SText, STheme } from "servisofts-component";
const Default = (props) => {
    return <View style={{
        flex: 1,
        width: "100%",
        backgroundColor: STheme.color.card,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ff0"
    }}>
        <SText>{props.data.type}</SText>
    </View>
}
export default Default;