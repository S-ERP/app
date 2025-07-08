import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
import DiaItem from './DiaItem';
import TurnoComponent from '.';
import MDL from '../../MDL';

type ListaDeDiasProps = { turnoComponent: TurnoComponent };
export default class ListaDeDias extends Component<ListaDeDiasProps, any> {
    dias: any[];
    constructor(props: ListaDeDiasProps) {
        super(props);
        const dias = Object.keys(SDate.getDaysOfWeek()).map((diaNumber, index) => {
            // @ts-ignore
            const dia = SDate.getDaysOfWeek()[diaNumber];
            dia.key = diaNumber;
            return dia;
        })
        this.dias = dias;
    }


    botonFooter() {
        return <>
            <SHr height={8} />
            <SView col={"xs-11.5"} row center>
                <SView flex />
                <SView width={240} row center border={"transparent" as any}>

                    {/* Botón Cancelar */}

                    <SView center row style={{
                        backgroundColor: "#fcfce9", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 42, width: 100,
                    }} onPress={() => {
                        SPopup.close("popup_config_horario");
                    }}>
                        <SText center color='black' bold>Cancelar</SText>
                    </SView>

                    <SView flex />

                    {/* Botón Guardar Horario */}
                    <SView center row style={{ backgroundColor: "#0f0e0e", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 42, width: 120 }} onPress={() => {

                        const data = this.props.turnoComponent.turno;

                        // Asegurar que "horarios" siempre sea un arreglo
                        if (!Array.isArray(data.horarios)) data.horarios = [];

                        // Normalizar estado en horarios sin definir
                        data.horarios.forEach((h) => {
                            if (h.estado === undefined || h.estado === null) h.estado = 1;
                        });

                        const isTurnoExistente = !!this.props.turnoComponent.props.key_turno;
                        // const tieneHorariosActivos = data.horarios.some(h => h.estado === 1);

                        // Si el turno ya existe → editar
                        if (isTurnoExistente) {
                            MDL.empresa.editarTurnosHorariosAtencion(data as any).then((res) => {
                                SPopup.close("popup_config_horario");
                            }).catch((err) => {
                                console.log("❌ Error al actualizar: " + err);
                            });
                        }

                        // Si el turno es nuevo → registrar
                        if (!isTurnoExistente) {
                            MDL.empresa.registroTurnosHorariosAtencion(data as any).then((res) => {
                                console.log("🟢 Nuevo turno registrado: " + res);
                                SPopup.close("popup_config_horario");
                            }).catch((err) => {
                                console.log("❌ Error al registrar: " + err);
                            });
                        }

                        const existeTurnoProyecto = this.props.turnoComponent.props.turno;
                        const existeProyecto_key = this.props?.turnoComponent?.props?.key_proyecto;

                        console.log("traendo todo " + existeTurnoProyecto, " - " + existeProyecto_key)
                        // Relación con proyecto (si aplica)
                        if (existeTurnoProyecto) {
                            MDL.crm.proyecto.editar({ key: this.props?.turnoComponent?.props?.key_proyecto, key_turno: data?.key }).then((e) => {
                            });
                        }

                        // Ejecutar callback de recarga si está definido
                        this.props.turnoComponent.props.onReload();
                        this.forceUpdate();

                    }}>
                        <SText center color='white'>Guardar Horario</SText>

                    </SView>
                </SView>
            </SView>
            <SHr height={8} />
        </>
    }


    render() {
        return <SView flex >
            <FlatList
                data={this.dias}
                ItemSeparatorComponent={a => <SHr h={8} />}
                renderItem={({ item }) => <DiaItem dia={item} {...this.props} />}
            />
            <SHr h={8} />


            {this.botonFooter()}


        </SView>
    }
}
