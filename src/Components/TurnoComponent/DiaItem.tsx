import React, { Component } from 'react';
import { View, Text, Switch } from 'react-native';
import { SHr, SInput, SText, SUuid, SView } from 'servisofts-component';
import TurnoComponent from '.';
import HoraItem from './HoraItem';

type DiaItemProps = {
    turnoComponent: TurnoComponent,
    dia: any
}
export default class DiaItem extends Component<DiaItemProps> {

    active: boolean = false;
    handleChangeAlvaro(e: any) {
        const horariosDelDia = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia === this.props.dia.key);
        if (horariosDelDia.length > 0) {
            // Si ya existe un horario para este dia, lo eliminamos
            this.props.turnoComponent.turno.horarios = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia !== this.props.dia.key);
            this.forceUpdate();
            return e;
        }
        const horario = {
            key: SUuid(),
            dia: this.props.dia.key,
            hora_inicio: "00:00",
            hora_fin: "23:59",
        }
        this.props.turnoComponent.turno.horarios.push(horario);
        this.forceUpdate()
        return e;
    }
    renderHeader() {
        const horariosDelDia = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia === this.props.dia.key);
        return <SView col={"xs-12"} height={40} card row center>
            <SView flex>
                <SText>{this.props.dia.text}</SText>
            </SView>
            <SView width={50}  >
                <Switch value={horariosDelDia.length > 0} onValueChange={this.handleChangeAlvaro.bind(this)} />
            </SView>
        </SView>
    }

    render24Horas() {
        const horariosDelDia = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia === this.props.dia.key);
        if (horariosDelDia.length === 0) return null;
        let active = false;

        if (horariosDelDia.length === 1 && horariosDelDia[0].hora_inicio === "00:00" && horariosDelDia[0].hora_fin === "23:59") {
            active = true;
        }
        return <SView row>
            <SView height={20} width={20}>
                <SInput value={!active ? "" : active + ""} height={20} width={20} type='checkBox' onChangeText={e => {
                    if (!e) {
                        horariosDelDia[0].hora_inicio = "08:00";
                        horariosDelDia[0].hora_fin = "16:00";
                        this.forceUpdate();
                    } else {
                        horariosDelDia[0].hora_inicio = "00:00";
                        horariosDelDia[0].hora_fin = "23:59";
                        const guadado = { ...horariosDelDia[0] };
                        this.props.turnoComponent.turno.horarios = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia !== this.props.dia.key);
                        this.props.turnoComponent.turno.horarios.push(guadado)
                        this.forceUpdate();
                    }
                    console.log(e);
                }} />
            </SView>
            <SView width={8} />
            <SText>{"Atiende 24 Horas"}</SText>

        </SView>
    }
    renderHorarios() {
        const horariosDelDia = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia === this.props.dia.key);
        if (horariosDelDia.length === 0) return null;
        let active = false;
        if (horariosDelDia.length === 1 && horariosDelDia[0].hora_inicio === "00:00" && horariosDelDia[0].hora_fin === "23:59") {
            active = true;
        }
        if (active) return null
        return horariosDelDia.map((horario: any, index: number) => {
            return <HoraItem
                key={horario.key}
                dia={this.props.dia}
                horario={horario}
                onDelete={() => {
                    this.props.turnoComponent.turno.horarios = this.props.turnoComponent.turno.horarios.filter((h: any) => h.key !== horario.key);
                    this.forceUpdate();
                }}
            />
        })
    }
    renderAgregrarHorario() {
        const horariosDelDia = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia === this.props.dia.key);
        if (horariosDelDia.length === 0) return null;
        let active = false;
        if (horariosDelDia.length === 1 && horariosDelDia[0].hora_inicio === "00:00" && horariosDelDia[0].hora_fin === "23:59") {
            active = true;
        }
        if (active) return null
        return <>
            <SHr />
            <SView col={"xs-12"} center>
                <SText card padding={4}
                    onPress={() => {
                        const horario = {
                            key: SUuid(),
                            dia: this.props.dia.key,
                            hora_inicio: "08:00",
                            hora_fin: "16:00",
                        }
                        this.props.turnoComponent.turno.horarios.push(horario);
                        this.forceUpdate()
                    }}
                >{"Agregar horario"}</SText>
            </SView>
        </>
    }
    render() {
        return <SView col={"xs-12"} >
            {this.renderHeader()}
            {this.render24Horas()}
            {this.renderHorarios()}
            {this.renderAgregrarHorario()}

        </SView>
    }
}
