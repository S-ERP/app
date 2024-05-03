import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SDate, SText, STheme, SThread } from "servisofts-component";
const Clock = (props) => {
    const [state, setState] = useState({
        date: new SDate(),
        run: false,
    })
    const hilo = () => {
        new SThread(1000, "actualizando_el_reloj", false).start(() => {
            if (!state.run) return;
            state.date = new SDate();
            setState({ ...state })
            hilo();
        })
    }
    useEffect(() => {
        state.run = true;
        hilo();
        return () => {
            state.run = false;
            // Aquí puedes limpiar cualquier suscripción, intervalo, o similar
        };
    }, [])
    return <View style={{
        flex: 1,
        width: "100%",
        padding: 4,
        // backgroundColor: STheme.color.card,
        justifyContent: "center",
        alignItems: "center",
    }}>
        <SText  bold fontSize={30}>{state.date.toString("HH")}</SText>
        {/* <SText fontSize={12}>{state.date.toString("ss")}</SText> */}
        <SText fontSize={12}>{state.date.toString("DAY, dd MON")}</SText>
    </View>
}
export default Clock;