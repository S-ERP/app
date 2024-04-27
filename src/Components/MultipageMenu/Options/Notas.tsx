import React, { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { SDate, SText, STheme, SThread, SView } from "servisofts-component";
const Notas = (props) => {

    return <View style={{
        flex: 1,
        width: "100%",
        padding: 8,
    }}>
        <View style={{
            flex: 1,
            width: "100%",
            backgroundColor: "#E7E28D",
            borderRadius: 16,
            justifyContent: "center",
            // alignItems: "center",
        }}>
            <SView height={40} card center>
                <SText color={"#000"} bold>Notas</SText>
            </SView>
            <SView flex>
                <TextInput placeholder="Notas Pendiente de completar" multiline={true} style={{
                    flex:1,
                    height:"100%",
                }}>

                </TextInput>
            </SView>
        </View>
    </View>
}
export default Notas;