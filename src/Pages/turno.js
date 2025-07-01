import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom, SScrollView2, SScrollView3 } from 'servisofts-component';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import { version } from 'process';
import MDL from '../MDL';
import Config from '../Config';
import Model from '../Model';
import FloatButtom from '../Components/FloatButtom';


export default class Turno extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // lunes: { activo: false, es24Horas: false, esFeriado: false, sinAtencion: false },
            // martes: { activo: false, es24Horas: false, esFeriado: false, sinAtencion: false },
        };
    }
    bolin() {
        const dias = ["lunes", "martes", "miércoles", "jueves", "viernes"];

        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} height={700} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 500 }} padding={16} withoutFeedback>
                    <SText fontSize={18} bold>🗓 Configurar Horarios Semanales</SText>
                    <SHr height={16} />

                    <SScrollView2 height={50}>
                        {dias.map((dia) => (
                            <SView key={dia} col={"xs-12"} style={{ marginBottom: 24 }}>
                                <SText fontSize={16} bold>{dia.charAt(0).toUpperCase() + dia.slice(1)}</SText>

                                <SInput type="checkBox" label={`¿Dia Activar ${dia}?`}
                                    defaultValue={this.state?.[dia]?.activo}
                                    onChangeText={() => {
                                        this.setState({
                                            [dia]: {
                                                ...this.state?.[dia],
                                                activo: !this.state?.[dia]?.activo
                                            }
                                        });
                                        this.forceUpdate()
                                    }}
                                />


                                {this.state?.[dia]?.activo ? <>
                                    <SView col={"xs-12"}>

                                        <SInput type="checkBox" label={`¿ feriado Activar ${dia}?`}
                                            defaultValue={this.state?.[dia]?.feriado}
                                            onChangeText={() => {
                                                this.setState({
                                                    [dia]: {
                                                        ...this.state?.[dia],
                                                        feriado: !this.state?.[dia]?.feriado
                                                    }
                                                });
                                                this.forceUpdate()
                                            }}
                                        />

                                        <SInput type="checkBox" label={`Registrar horario ${dia}?`}
                                            defaultValue={this.state?.[dia]?.horario}
                                            onChangeText={() => {
                                                this.setState({
                                                    [dia]: {
                                                        ...this.state?.[dia],
                                                        horario: !this.state?.[dia]?.horario
                                                    }
                                                });
                                                this.forceUpdate()
                                            }}
                                        />
                                    </SView>
                                </> : null}


                                {this.state?.[dia]?.horario ? <>

                                    <SView col={"xs-12"} row center>
                                        <SView flex>
                                            <SText fontSize={14} bold>Turnos de trabajo</SText>
                                        </SView>


                                        <SView
                                            center
                                            row
                                            style={{
                                                backgroundColor: "#0f0e0e",
                                                borderColor: STheme.color.card,
                                                borderWidth: 1,
                                                borderRadius: 25,
                                                height: 28,
                                                width: 120,
                                            }} onPress={() => {
                                                const descripcion = this.input_descripcion?.getValue()?.trim();
                                                const dia = this.input_dia?.getValue();
                                                const config = this?.state?.config;
                                                const isTurnoVisible = !config?.es24Horas && !config?.sinAtencion && !config?.esFeriado;
                                                const checkCount = [config?.es24Horas, config?.esFeriado, config?.sinAtencion].filter(Boolean).length;

                                                if (!descripcion) {
                                                    SNotification.send({ title: "La descripción es obligatoria", type: "danger" });
                                                    return;
                                                }

                                                if (!dia || dia === "---") {
                                                    SNotification.send({ title: "Selecciona un día válido", type: "danger" });
                                                    return;
                                                }

                                                if (checkCount > 1) {
                                                    SNotification.send({ title: "Solo una opción entre 24h, feriado o sin atención debe estar activa", type: "danger" });
                                                    return;
                                                }

                                                if (isTurnoVisible) {
                                                    const nombreTurno = this.input_turno_nombre?.getValue()?.trim();
                                                    const horaInicio = this.input_hora_inicio?.getValue();
                                                    const horaFin = this.input_hora_fin?.getValue();

                                                    if (!nombreTurno || !horaInicio || !horaFin) {
                                                        SNotification.send({ title: "Completa los campos del turno", type: "danger" });
                                                        return;
                                                    }
                                                }

                                                // const horario = {
                                                //     dia,
                                                //     descripcion,
                                                //     es24Horas: config?.es24Horas,
                                                //     esFeriado: config?.esFeriado,
                                                //     sinAtencion: config?.sinAtencion,
                                                //     turnos: isTurnoVisible ? [{
                                                //         nombre: this.input_turno_nombre?.getValue(),
                                                //         horaInicio: this.input_hora_inicio?.getValue(),
                                                //         horaFin: this.input_hora_fin?.getValue()
                                                //     }] : []
                                                // };

                                                console.log("HORARIO GUARDADO", horario);
                                                SPopup.close("popup_config_horario");
                                            }}>



                                            <SIcon name='adicional' width={8} />
                                            <SText center color='white'> gregar turno</SText>

                                        </SView>
                                    </SView>




                                    <SHr height={8} />
                                    <SView col={"xs-11.5"} row center>
                                        <SView col={"xs-3"}>
                                            <SInput label={"Nombre del turno"} ref={ref => this.input_turno_nombre = ref} />
                                        </SView>
                                        <SView flex />
                                        <SView col={"xs-3"}>
                                            <SInput label={"Hora inicio"} type="hour" ref={ref => this.input_hora_inicio = ref} />
                                        </SView>
                                        <SView flex />
                                        <SView col={"xs-3"}>
                                            <SInput label={"Hora fin"} type="hour" ref={ref => this.input_hora_fin = ref} />
                                        </SView>
                                        <SView flex />
                                        <SView col={"xs-1"} center border={"transparent"} onPress={() => alert("Cerrar turno")}>
                                            <SIcon name="Close" fill="white" width={20} />
                                        </SView>
                                    </SView>

                                </> : null}


                                <SHr />
                            </SView>
                        ))}
                    </SScrollView2>

                    <SView center>
                        <SButtom type='outline' onPress={() => {
                            const resultado = {};
                            dias.forEach(dia => {
                                resultado[dia] = this.state?.[dia] ?? {};
                            });

                            console.log("📝 CONFIG HORARIOS:\n" + JSON.stringify(resultado, null, 2));

                            SPopup.close("popup_config_horario");

                        }}>
                            Guardar horarios
                        </SButtom>
                    </SView>
                </SView>
            )
        });
    }



    render() {


        return (
            <SPage title="Turnos y Horarios" disableScroll>
                <SHr height={20} />

                <FloatButtom onPress={() => {
                    this.bolin()
                }} />
            </SPage>
        );
    }


}
