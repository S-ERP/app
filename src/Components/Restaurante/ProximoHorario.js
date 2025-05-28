import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SImage, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
export type ProximoHorarioPropsType = {
    data: any
}
class index extends Component<ProximoHorarioPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        console.log(this.props?.data)
        var { key, nombre, horario } = this.props?.data;
        return <SView
            row
            {...this.props}
            center
        >
            <SIcon name={"Reloj"} width={13} />
            <SView width={6} />
            <SText style={{ borderColor: "#FA790E", borderBottomWidth: 1.5,  }} fontSize={14} >{horario?.fecha_txt} {horario?.hora_inicio} - {horario?.hora_fin}</SText>
            <SView flex />
        </SView>
    }
}
export default (index);