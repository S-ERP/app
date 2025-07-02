import React, { Component } from 'react';
import { SHr, SIcon, SInput, SText, STheme, SView } from 'servisofts-component';
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

            <SHr height={18} />

            <SView col={"xs-12"} row>
                <SView flex >
                    <SText fontSize={18} bold>🕒 Configurar Nuevo Horario</SText>
                </SView>
                <SView col={"xs-1"} center >
                    <SView col={"xs-12"} center onPress={() => {
                        // cerrar popu
                    }}>
                        <SIcon name="Cerrar" fill="white" width={14} />
                    </SView>
                </SView>
            </SView>


            <SHr height={14} />



            <SView col={"xs-11.7"} style={{ paddingHorizontal: 16, }} height={90} row center border={STheme.color.card}  >
                <SView flex >
                    <SInput
                        label={"Descripcion/Nombre del turno"}
                        placeholder={"Ingrese la descripcion del turno"}
                        value={this.turno.descripcion}
                        onChangeText={e => {
                            this.turno.descripcion = e;
                            this.forceUpdate();
                        }} />
                </SView>
                <SView width={20} />
                <SView col={"xs-2.7"}>
                    <SInput
                        label={"Día feriado ?"}
                        type='checkBox' height={24}
                        value={!this.turno.atiende_feriado ? "" : "true"}
                        onChangeText={e => {
                            this.turno.atiende_feriado = !!e;
                            this.forceUpdate();
                        }} />
                    <SText fontSize={9} color={STheme.color.lightGray}>Marcar como día feriado</SText>
                </SView>
                <SHr height={24} />

            </SView>
            <SHr height={18} />




            <ListaDeDias turnoComponent={this} />
        </SView>
    }
}
