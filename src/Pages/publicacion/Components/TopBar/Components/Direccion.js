import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SHr, SIcon, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import PopupUsarUbicacion from './PopupUsarUbicacion';

class Direccion extends Component {
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
        // alert(miDistancia);
        // if (!this.props.state?.direccion_usuarioReducer?.miDireccion) {
        // return null;
        // }
        return (<SView row col={"xs-12"} center border={'transparent'} onPress={() => {
            SPopup.open({ key: "ubicacion", content: <PopupUsarUbicacion /> });
        }}>
            <SView width={16} />
            <SView height={50} width={15}>
                <SView style={{ top: 6 }} center><SIcon name={"Location"} height={18} fill={STheme.color.secondary} />
                </SView>
            </SView>
            <SView height={50} style={{ flex: 1, justifyContent: 'center', paddingLeft: 4, paddingRight: 4, maxWidth: 280, }}>
                <SText fontSize={11} center color={STheme.color.secondary}>{this.getDireccion(miDireccion)}</SText>
                <SHr height={4} />
                <SText fontSize={12} center color={STheme.color.secondary}> A menos de {miDistancia == 1 ? "1" : "30"} km</SText>
            </SView>
            <SView height={50} width={25}>
                <SView style={{ top: 6 }} center><SIcon name={"Back"} height={18} fill={STheme.color.secondary} style={{ transform: [{ rotate: "-90deg" }] }} />
                </SView>
            </SView>
            <SView width={16} />
        </SView>);
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Direccion);