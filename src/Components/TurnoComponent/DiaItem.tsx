import React, { Component } from 'react';
import { View, Text, Switch } from 'react-native';
import { SHr, SIcon, SInput, SText, STheme, SUuid, SView } from 'servisofts-component';
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
        return <SView col={"xs-12"} height={50} card row center style={{ marginBottom: 18 }}>
            <SView flex style={{ paddingLeft: 18 }}>
                <SText fontSize={16} bold>{this.props.dia.text}</SText>
            </SView>
            <SView style={{ paddingRight: 18 }} >
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
        return <SView col={"xs-12"} height={60} row center border={STheme.color.lightGray} style={{ marginBottom: 24, paddingHorizontal: 16 }}>
            <SView flex>
                <SText fontSize={16} bold>Atención 24 horas</SText>
                <SText fontSize={12} color={STheme.color.lightGray}>Servicio disponible las 24 horas</SText>
            </SView>
            <SView width={30} center>
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
            <SView col={"xs-12"} height={60} row center border="transparent" style={{ marginBottom: 18 }} >
                <SView flex>
                    <SText fontSize={20} bold>Turnos de trabajo</SText>
                </SView>

                <SView center row style={{ backgroundColor: "#0f0e0e", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 42, width: 130 }} onPress={() => {
                    const horario = {
                        key: SUuid(),
                        dia: this.props.dia.key,
                        // hora_inicio: "00:00",
                        hora_inicio: "08:00",
                        // hora_fin: "00:00",
                        hora_fin: "16:00",
                    }
                    this.props.turnoComponent.turno.horarios.push(horario);
                    this.forceUpdate()
                }} >

                    <SIcon name='adicional' width={12} fill='white' />
                    <SText color='white'>  Agregar Turno</SText>

                </SView>
            </SView>



            {horariosDelDia.length === 1 && horariosDelDia[0].hora_inicio === "00:00" ? <>
                <SHr height={16} />
                <SView col={"xs-12"} height={80} center border={STheme.color.lightGray} >
                    <SText fontSize={16} bold color={STheme.color.lightGray} >No hay turnos configurados</SText>
                    <SText fontSize={12} color={STheme.color.lightGray}>Haz clic en "Agregar Turno" para comenzar</SText>
                </SView>
            </>
                : this.renderHorarios()
            }

        </>
    }
    render() {
        return <SView col={"xs-11.7"}>
            {this.renderHeader()}
            {this.render24Horas()}
            {this.renderAgregrarHorario()}
            {/* {this.renderHorarios()} */}

        </SView>
    }
}
