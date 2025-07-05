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

    /**  Devuelve los horarios correspondientes al día actual, validando nulos */
    getHorariosDelDia = () => {
        return this.props.turnoComponent?.turno?.horarios?.filter?.((horario: any) => horario?.dia == this.props.dia?.key && (horario?.estado === undefined || horario.estado === 1)) || [];
    };


    /**  Callback que alterna el horario entre activado y desactivado */
    handleChangeAlvaro(e: any) {

        const horariosDelDia = this.getHorariosDelDia();
        if (horariosDelDia.length > 0) {
            // 🔁 Elimina horarios del día si ya existían
            horariosDelDia.forEach(h => h.estado = 0);
            this.props.turnoComponent.turno.horarios = this.props.turnoComponent.turno.horarios.map((horario: any) => horario.dia == this.props.dia.key ? horariosDelDia.find(h => h.key === horario.key) || horario : horario);
            this.forceUpdate();
            return e;
        }
        // ➕ Agrega nuevo horario por defecto
        const nuevoHorario = {
            key: SUuid(),
            dia: Number(this.props.dia.key),
            hora_inicio: "00:00",
            hora_fin: "23:59",
            estado: 1
        }
        if (!Array.isArray(this.props.turnoComponent.turno.horarios)) {
            this.props.turnoComponent.turno.horarios = [];
            this.forceUpdate();
        }
        this.props.turnoComponent.turno.horarios.push(nuevoHorario);
        this.forceUpdate()
        return e;
    }

    /** Encabezado del día con switch para activar/desactivar */
    renderHeader() {
        const horariosDelDia = this.getHorariosDelDia();
        return <SView col={"xs-12"} height={50} card row center style={{ marginBottom: 18 }}>
            <SView flex style={{ paddingLeft: 18 }}>
                <SText fontSize={16} bold>{this.props.dia.text}</SText>
            </SView>
            <SView style={{ paddingRight: 18 }} >
                <Switch value={horariosDelDia.length > 0} onValueChange={this.handleChangeAlvaro.bind(this)} />
            </SView>
        </SView>
    }

    /**  Renderiza sección de atención 24 horas con checkbox editable */
    render24Horas() {
        const horariosDelDia = this.getHorariosDelDia();
        if (horariosDelDia.length === 0) return null;
        let active = false;
        if (horariosDelDia.length == 1 && horariosDelDia[0].hora_inicio == "00:00" && horariosDelDia[0].hora_fin == "23:59") {
            active = true;
        }
        return <SView col={"xs-12"} height={50} row center border={STheme.color.lightGray} style={{ marginBottom: 10, paddingHorizontal: 16 }}>
            <SView flex>
                <SText fontSize={14} bold>Atención 24 horas</SText>
                <SText fontSize={10} color={STheme.color.lightGray}>Servicio disponible las 24 horas</SText>
            </SView>
            <SView width={30} center>
                <SInput value={!active ? "" : active + ""} height={20} width={20} type='checkBox' onChangeText={e => {
                    if (!e) {
                        horariosDelDia[0].hora_inicio = "08:00";
                        horariosDelDia[0].hora_fin = "16:00";
                        horariosDelDia[0].estado = 1;
                        this.forceUpdate();
                    } else {
                        horariosDelDia[0].hora_inicio = "00:00";
                        horariosDelDia[0].hora_fin = "23:59";
                        horariosDelDia[0].estado = 1;
                        const guadado = { ...horariosDelDia[0] };
                        this.props.turnoComponent.turno.horarios = this.props.turnoComponent.turno.horarios.filter((horario: any) => horario.dia != this.props.dia.key);
                        this.props.turnoComponent.turno.horarios.push(guadado)
                        this.forceUpdate();
                    }
                    console.log(e);
                }} />
            </SView>
        </SView>
    }
    /** Renderiza todos los horarios del día (excepto si es 24 horas) */
    renderHorarios() {
        const horariosDelDia = this.getHorariosDelDia();
        if (horariosDelDia.length === 0) return null;
        let active = false;
        if (horariosDelDia.length == 1 && horariosDelDia[0].hora_inicio == "00:00" && horariosDelDia[0].hora_fin == "23:59") {
            active = true;
        }
        if (active) return null
        return horariosDelDia.map((horario: any, index: number) => {
            return <HoraItem
                key={horario.key}
                dia={this.props.dia}
                horario={horario}
                onDelete={() => {
                    horario.estado = 0;
                    this.forceUpdate();
                }}
            />
        })
    }
    renderAgregrarHorario() {
        const horariosDelDia = this.getHorariosDelDia();
        if (horariosDelDia.length == 0) return null;
        let active = false;
        if (horariosDelDia.length == 1 && horariosDelDia[0].hora_inicio == "00:00" && horariosDelDia[0].hora_fin == "23:59") {
            active = true;
        }
        if (active) return null
        return <>
            <SView col={"xs-12"} height={50} row center border="transparent" style={{ marginBottom: 4 }} >
                <SView flex  >
                    <SText fontSize={16} bold>Turnos de trabajo</SText>
                </SView>

                <SView center row style={{ backgroundColor: "#0f0e0e", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 38, width: 130 }} onPress={() => {
                    const horario = {
                        key: SUuid(),
                        dia: Number(this.props.dia.key),
                        hora_inicio: "08:00",
                        hora_fin: "16:00",
                        estado: 1
                    }
                    console.log("todo ", horario)
                    this.props.turnoComponent.turno.horarios.push(horario);
                    this.forceUpdate()
                }} >
                    <SIcon name='adicional' width={12} fill='white' />
                    <SText color='white' fontSize={14} >  Agregar Turno</SText>
                </SView>
            </SView>
        </>
    }
    render() {
        return <SView col={"xs-11.7"}>
            {this.renderHeader()}
            {this.render24Horas()}
            {this.renderAgregrarHorario()}
            {this.renderHorarios()}
        </SView>
    }
}
