import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SImage, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
export type EjemploPropsType = {
    data: any
}
class index extends Component<EjemploPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
        // var { key, nombre, proximo_horario } = this.props.data;
        return <SView col={"xs-12"} {...this.props}>
            <SText>ejemplo hora</SText>
        </SView>
    }
}
export default (index);