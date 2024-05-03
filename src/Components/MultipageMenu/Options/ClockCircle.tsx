import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SDate, SText, STheme, SThread, SView } from "servisofts-component";
const ClockCircle = (props) => {
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
    const radius = 40; // Radio del círculo donde se ubicarán los números
    const diameter = radius * 2;
    return <SView style={{
        // flex: 1,
        width: diameter,
        height: diameter,
        borderRadius: 100,
        backgroundColor: STheme.color.text,
        justifyContent: "center",
        alignItems: "center",
    }}  >
        {new Array(12).fill(0).map((_, i) => {
            const angle = (((i) / 12) + 0.5) * Math.PI * 2; // Ángulo para cada número en radianes
            const x = (radius / 2) * Math.sin(angle) + (radius / 2); // Calcular la posición x
            const y = (radius / 2) * Math.cos(angle) + (radius / 2); // Calcular la posición y
            return (
                <SText
                    center
                    key={i}
                    style={{
                        position: 'absolute',
                        fontSize: 10,
                        color: STheme.color.background,
                        fontWeight: 'bold',
                        left: x,
                        top: y,
                        transform: [
                            { translateX: -3 }, // Centrar horizontalmente
                            { translateY: -3 }  // Centrar verticalmente
                        ]
                    }}
                >
                    {12 - i}
                </SText>
            );
        })}
    </SView>
}
export default ClockCircle;