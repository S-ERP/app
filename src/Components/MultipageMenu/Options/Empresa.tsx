import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SDate, SText, STheme, SThread, SView } from "servisofts-component";
const Empresa = (props) => {

    return <View style={{
        flex: 1,
        width: "100%",
        padding: 8,
    }}>
        <View style={{
            flex: 1,
            width: "100%",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#666",
            justifyContent: "center",
            // alignItems: "center",
        }}>
            <SView height={40} card center>
                <SText color={"#000"} bold>Mi empresa</SText>
            </SView>
        </View>
    </View>
}
export default Empresa;