import React, { Component } from 'react';
import { SHr, SIcon, SInput, SPopup, SText, STheme, SUuid, SView } from 'servisofts-component';
import ListaDeDias from './ListaDeDias';
import MDL from '../../MDL';


export type HorarioItem = {
    key: string,
    dia: number;
    hora_inicio: string;
    hora_fin: string;
    estado: number;

}
export type TurnoItem = {
    key: string,
    nombre: string;
    atiende_feriado: number;
    horarios: HorarioItem[];
    key_usuario: string;
    estado: number;


}

// hola

export default class TurnoComponent extends Component {

    turno: TurnoItem = {
        key: SUuid(),
        nombre: "",
        atiende_feriado: 0,
        horarios: []
    }

    componentDidMount(): void {
        if (!this.props.key_turno) return;
        MDL.empresa.getByyKeyTurnosHorariosAtencion(this.props.key_turno).then((res: TurnoItem) => {
            this.turno = res;
            console.log("pinta ",res)
            this.forceUpdate();
            // this.setState({ turno: res });
        }).catch((err) => {
            console.log("Error al cargar turno:", err);
        });
    }

    render() {
        return <SView col={"xs-12"} flex>

            <SHr height={18} />

            <SView col={"xs-11.5"} row>
                <SView flex >
                    <SText fontSize={18} bold>🕒 Configurar Nuevo Horario{this.props.key_turno} </SText>
                </SView>
                <SView col={"xs-1"} center >
                    <SView col={"xs-12"} center onPress={() => {
                        SPopup.close("popup_config_horario");
                    }}>
                        <SIcon name="Cerrar" fill="white" width={14} />
                    </SView>
                </SView>
            </SView>


            <SHr height={14} />



            <SView col={"xs-11.5"} style={{ paddingHorizontal: 16, }} height={80} row center border={STheme.color.card}  >
                <SView flex >
                    <SInput
                        label={"Descripcion/Nombre del turno"}
                        style={{ height: 34, fontSize: 13, }}
                        placeholder={"Ingrese la descripcion del turno"}
                        value={this.turno.nombre}
                        onChangeText={e => {
                            this.turno.nombre = e;
                            this.forceUpdate();
                        }} />
                </SView>
                <SView width={20} />
                <SView width={100}>
                    <SInput
                        label={"Día feriado ?"}
                        type='checkBox' height={24}
                        value={this.turno.atiende_feriado === 1 ? "true" : ""}
                        onChangeText={e => {
                            this.turno.atiende_feriado = e ? 1 : 0;
                            // this.turno.atiende_feriado = !!e;
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
