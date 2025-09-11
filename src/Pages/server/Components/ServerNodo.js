import React from "react";
import { SPage, SText, STheme } from "servisofts-component";
import PizarraNodo from "../../../Components/Pizarra/PizarraNodo";
import { StyleSheet, View } from "react-native";
import Puerto from "../../../Components/Pizarra/Puerto";

export default class ServerNodo extends React.Component {
    render() {
        const { servicio } = this.props;
        return <PizarraNodo id={servicio.key} >
            <View style={style.nodo}>
                <SText clean style={{
                    maxWidth: "100%"
                }}>{servicio.nombre}</SText>
                <Puerto type="output" id="key_servicio" value={servicio.key} style={{
                    right: -10,
                    borderRadius: 100,

                }} />
                <Puerto type="input" id="key_servicio"  style={{
                    left: -10,

                }} />
            </View>
        </PizarraNodo>
    }
}

const style = StyleSheet.create({
    nodo: {
        width: 100,
        height: 50,
        backgroundColor: STheme.color.background,
        borderWidth: 1,
        borderColor: "#fff",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center"
    }
})