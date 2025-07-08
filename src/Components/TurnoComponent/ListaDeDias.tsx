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
                    <SView center row style={{
                        backgroundColor: "#fcfce9", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 42, width: 100,
                    }} onPress={() => {
                        SPopup.close("popup_config_horario");
                    }}>
                        <SText center color='black' bold>Cancelar</SText>
                    </SView>
                    <SView flex />
                    <SView center row style={{ backgroundColor: "#0f0e0e", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 42, width: 120 }} onPress={() => {

                        const data = this.props.turnoComponent.turno;

                        if (!Array.isArray(data.horarios)) data.horarios = [];
                        // Asignar estado=1 a cualquier horario que no lo tenga definido
                        data.horarios.forEach((h) => {
                            if (h.estado === undefined || h.estado === null) {
                                h.estado = 1;
                            }
                        });


                        const isTurnoExistente = !!this.props.turnoComponent.props.key_turno;
                        const tieneHorariosActivos = data.horarios.some(h => h.estado === 1);

                        console.log("vemos " + isTurnoExistente)

                        if (isTurnoExistente) {
                            data.horarios.forEach((h) => {
                                if (h.estado === undefined || h.estado === null) h.estado = 1;
                            });

                            MDL.empresa.editarTurnosHorariosAtencion(data as any).then((res) => {
                                SPopup.close("popup_config_horario");
                            }).catch((err) => {
                                console.log("❌ Error al actualizar: " + err);
                            });
                        }

                        if (!isTurnoExistente) {
                            MDL.empresa.registroTurnosHorariosAtencion(data as any).then((res) => {
                                console.log("🟢 Nuevo turno registrado: " + res);
                                SPopup.close("popup_config_horario");
                            }).catch((err) => {
                                console.log("❌ Error al registrar: " + err);
                            });
                        }




                        if (this.props?.turnoComponent?.props?.key_proyecto) {
                            // console.log("con proiyecto ")

                            MDL.crm.proyecto.editar({ key: this.props?.turnoComponent?.props?.key_proyecto, key_turno: data?.key }).then((e) => {
                                // this.props.turnoComponent.props.onReload();
                                console.log("se guardo exitoso")
                            });
                        } else {
                            console.log("sin proyecto ")
                        }


                        // console.log("key_proyecto " + this.props.turnoComponent.props.key_proyecto)
                        // this.
                        // tengo que verificar el turno

                        // MDL.crm.proyecto.editar({ key: ex.row.key, key_whatsapp_device: e.selectedOption.key, }) .then((e) => {
                        //     this.props.turnoComponent.props.onReload();
                        // });
                        // },

                        // this.props.turnoComponent.turno.

                        this.props.turnoComponent.props.key_turno;
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
