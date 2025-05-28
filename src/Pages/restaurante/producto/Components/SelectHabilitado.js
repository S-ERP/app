import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SText, STheme, SView } from 'servisofts-component';

export default class SelectHabilitado extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    renderItem(props) {
        const { key, color, label } = props;
        return <SView col={"xs-11"} flex center onPress={() => {
            if (this.props.onSelect) this.props.onSelect(props)
        }}>
            <SView col={"xs-12"} row style={{
                alignItems: "center",
            }}>
                <SView height={8} width={8} style={{
                    borderRadius: 100,
                    backgroundColor: color
                }}>

                </SView>
                <SView width={8} />
                <SText color={"#666"} fontSize={12}>{label}</SText>
            </SView>
        </SView>
    }
    minutesUntilEndOfDay() {
        // Obtén la hora actual
        const now = new Date();

        // Crea una nueva fecha para la medianoche de mañana
        const endOfDay = new Date(now);
        endOfDay.setHours(24, 0, 0, 0); // Establece la hora a medianoche

        // Calcula la diferencia en milisegundos entre la medianoche y la hora actual
        const diff = endOfDay - now;

        // Convierte la diferencia de milisegundos a minutos
        const minutes = Math.floor(diff / 1000 / 60);

        return minutes;
    }
    render() {
        return (
            <SView
                withoutFeedback
                style={[{
                    width: 220,
                    height: 176,
                    // padding: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    backgroundColor: "#fff",
                    borderColor: STheme.color.lightGray,
                    borderWidth: 1,
                    borderRadius: 8

                }, this.props.style]}>
                {this.renderItem({ key: "true", color: STheme.color.success, label: "Disponible" })}
                {this.renderItem({ key: (-1).toFixed(0), color: STheme.color.success, label: "Disponible por 1 minuto" })}
                {this.renderItem({ key: (-60).toFixed(0), color: STheme.color.success, label: "Disponible por 1 hora" })}
                {this.renderItem({ key: "false", color: STheme.color.danger, label: "No disponible" })}
                {this.renderItem({ key: (1).toFixed(0), color: STheme.color.danger, label: "No disponible por 1 minuto" })}
                {this.renderItem({ key: (60).toFixed(0), color: STheme.color.danger, label: "No disponible por 1 hora" })}
                {this.renderItem({ key: (60 * 12).toFixed(0), color: STheme.color.danger, label: "No disponible por 12 horas" })}
                {this.renderItem({ key: (this.minutesUntilEndOfDay()).toFixed(0), color: STheme.color.danger, label: "No disponible por este día" })}
            </SView>
        );
    }
}
