import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SText, SView } from 'servisofts-component';

export default class ContadorTiempoRestante extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        // Aquí podrías iniciar un temporizador si necesitas actualizaciones en tiempo real
        setInterval(() => {
            this.forceUpdate(); // Forzar actualización para reflejar el tiempo restante
        }, 1000);
    }
    componentWillUnmount() {
        // Limpiar el temporizador si lo has iniciado
        clearInterval(this.timer);
    }

    render() {
        const { key_cliente_proyecto, fecha_start } = this.props;
        if (!fecha_start) return null;
        const timeEnd = new SDate(fecha_start, "yyyy-MM-ddThh:mm:ss").addMinute(7);

        const timeNow = new SDate();
        const timeDiff = timeNow.diffTime(timeEnd, "minute");
        if (timeDiff <= 0) {
            return <SView width={120} padding={8} card center>
                <SText center>{"Tiempo agotado"}</SText>
            </SView>
        }

        const diffMillis = timeEnd.getTime() - timeNow.getTime();
        const minutes = Math.floor(diffMillis / 60000);
        const seconds = Math.floor((diffMillis % 60000) / 1000);
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        return <SView width={120} padding={8} card center>
            <SText center>{formattedTime}</SText>
            {/* <SText>{timeEnd.toString("hh:mm:ss")}</SText> */}
        </SView>

    }
}
