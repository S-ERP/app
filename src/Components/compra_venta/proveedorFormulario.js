import React, { Component } from 'react';
import { SHr, SIcon, SInput, SPopup, SText, STheme, SUuid, SView } from 'servisofts-component';
import ListaDeDias from './ListaDeDias';
import MDL from '../../MDL';




export default class proveedorFormulario extends Component {


    componentDidMount(): void {
        if (!this.props.key_turno) return;
        MDL.empresa.getByyKeyTurnosHorariosAtencion(this.props.key_turno).then((res: TurnoItem) => {
            this.turno = res;
            console.log("pinta ", res)
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
                <SView flex row ><SIcon name='clock' width={18} style={{ paddingRight: 8,  }} stroke='white' />
                    <SText fontSize={18} bold>Configurar Nuevo Horario</SText>
                    {/* <SText fontSize={18} bold><SIcon name='clock' width={18} style={{ paddingRight: 4, marginTop: 20, }} stroke='white' /> Configurar Nuevo Horario</SText> */}
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
                        label={"Nombre del turno"}
                        style={{ height: 34, fontSize: 13, backgroundColor: "#181717" }}
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
                        color={this.turno.atiende_feriado === 1 ? "white" : "#8c8c8c"}
                        type='checkBox' height={24}
                        value={this.turno.atiende_feriado === 1 ? "true" : ""}
                        onChangeText={e => {
                            this.turno.atiende_feriado = e ? 1 : 0;
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
