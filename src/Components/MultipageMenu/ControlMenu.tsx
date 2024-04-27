import React from "react"
import { View } from "react-native";
import { SText, STheme } from "servisofts-component";




const ControlMenu = (props) => {
    const h = 40;
    return <View style={{
        position: "absolute",
        top: -h - 4,
        width: 100,
        height: h,
        backgroundColor: STheme.color.card,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    }}>
        <SText>Eliminar</SText>
    </View>
}

export default ControlMenu;