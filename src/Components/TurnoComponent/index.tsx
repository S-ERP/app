import React, { Component } from 'react';
import { SInput, SText, SView } from 'servisofts-component';
import ListaDeDias from './ListaDeDias';


export type HorarioItem = {
    key: string,
    dia: string;
    hora_inicio: string;
    hora_fin: string;
    
}
export type TurnoItem = {
    descripcion: string;
    atiende_feriado: boolean;
    horarios: HorarioItem[];
}

// hola

export default class TurnoComponent extends Component {

    turno: TurnoItem = {
        descripcion: "",
        atiende_feriado: false,
        horarios: []
    }

    render() {
        return <SView col={"xs-12"} flex>
            <SInput
                label={"Descripcion"}
                placeholder={"Ingrese la descripcion del turno"}
                value={this.turno.descripcion}
                onChangeText={e => {
                    this.turno.descripcion = e;
                    this.forceUpdate();
                }} />
            <SInput
                label={"atiende_feriado"}
                type='checkBox'
                value={!this.turno.atiende_feriado? "" : "true"}
                onChangeText={e => {
                    this.turno.atiende_feriado = !!e;
                    this.forceUpdate();
                }} />
            <ListaDeDias turnoComponent={this} />
        </SView>
    }
}
