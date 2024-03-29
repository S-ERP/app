import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SHr, SIcon, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';

class PopupUsarUbicacion extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    getDireccion(direccion) {
        if (!direccion) return "Elegir mi ubicación...";
        var dir = direccion.direccion;

        var chars = 40;
        if (dir.length > chars) {
            dir = dir.substring(0, chars) + "...";

        }
        if (direccion.descripcion) {
            //   return direccion.descripcion + "\n" + dir;
        }
        return dir;
    }
    render() {
        var miDireccion = Model.filtros.Action.getByKey("direccion").select
        var miDistancia = Model.filtros.Action.getByKey("distancia").select
        return <SView col={"xs-11 sm-9 md-7 xl-5 xxl-4"} center row withoutFeedback backgroundColor={STheme.color.background}
            style={{
                borderRadius: 38,
                overflow: "hidden",
                borderWidth: 1,
                borderBottomWidth: 2,
                borderColor: "#66666622",
                marginBottom: 50,

            }}
        >
            <SView col={"xs-12"} backgroundColor={STheme.color.primary} height={50} center>
                <SText color={STheme.color.secondary}   center style={{ fontSize: 20 }}>Usar otra ubicación</SText>

            </SView>
            <SView col={"xs-11 md-8"} center>
                <SView height={8} />
                {/* {this.getForm()} */}
                <SView
                    col={"xs-11"}
                    height={50}
                    center
                    row
                    style={{
                        fontSize: 15,
                        backgroundColor: STheme.color.card,
                        borderRadius: 15
                    }}
                    onPress={() => {
                        SPopup.close("ubicacion");
                        SNavigation.navigate("/direccion")
                    }}>
                    <SView flex center>
                        <SText center   color={STheme.color.gray}>{this.getDireccion(miDireccion)}</SText>
                    </SView>

                </SView>
                <SView height={8} />
                <SText color={STheme.color.black} style={{ fontSize: 18 }}>Seleccione un Modo</SText>
                <SHr height={8} />
                <SView col={"xs-12"} row center>
                    <SView col={"xs-6"} center onPress={() => {
                        Model.filtros.Action.select('distancia', "1")
                        // this.props.dispatch({ component: "direccion_usuario", type: "editarMiDistancia", data: 1 });
                        SPopup.close("ubicacion");
                    }}>
                        <SIcon name={miDistancia == 1 ? "ModoPieOn" : "ModoPieOff"} width={90} height={90} fill={STheme.color.primary} />
                        <SHr height={10} />
                        <SText  color={STheme.color.text} style={{ fontSize: 14, }}>A pie</SText>
                        <SText  color={STheme.color.text} style={{ fontSize: 14, }}>menos de 1 km</SText>
                    </SView>
                    <SView col={"xs-6"} center onPress={() => {
                        Model.filtros.Action.select('distancia', "30")
                        // this.props.dispatch({ component: "direccion_usuario", type: "editarMiDistancia", data: 30 });
                        SPopup.close("ubicacion");
                    }}>
                        <SIcon name={miDistancia == 30 ? "ModoCocheOn" : "ModoCocheOff"} width={90} height={90} fill={STheme.color.primary} />
                        <SHr height={10} />
                        <SText  color={STheme.color.text} style={{ fontSize: 14, }}>En coche</SText>
                        <SText  color={STheme.color.text} style={{ fontSize: 14, }}>menos de 30 km</SText>
                    </SView>
                </SView>
                <SView height={20}></SView>
            </SView>
        </SView>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(PopupUsarUbicacion);