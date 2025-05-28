import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SIcon, SImage, SText, STheme, SView } from 'servisofts-component';

export default class CrearNuevo extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    renderItem(props) {
        const { key, icon, label } = props;
        return <SView col={"xs-11"} flex center onPress={() => {
            if (this.props.onSelect) this.props.onSelect(props)
        }}>
            <SView col={"xs-12"} row style={{
                alignItems: "center",
            }}>
                <SView height={18} width={18} style={{
                    borderRadius: 100,
                    // backgroundColor: color
                }}>
                    <SImage src={icon} />
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
                    // padding: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    backgroundColor: STheme.color.card,
                    borderColor: STheme.color.card,
                    // borderWidth: 1,
                    // borderRadius: 8

                }, this.props.style]}>
                {this.renderItem({ key: "producto", icon: require("../../../../Assets/img/PRODUCTO.png"), label: "Producto" })}
                {this.renderItem({ key: "categoria", icon: require("../../../../Assets/img/CATEGORIA.png"), label: "Categoría" })}
            </SView >
        );
    }
}
