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

                                <SInput
                                    type="checkBox"
                                    role="switch"
                                    label={`¿Activar ${dia}?`}
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


                                {this.state?.[dia]?.activo ?
                                    <SText >dia {dia} esta {this.state?.[dia]?.activo}  </SText>
                                    : null}


                                <SHr />
                            </SView>
                        ))}
                    </SScrollView2>

                    <SView center>
                        <SButtom type='outline' onPress={() => {
                            dias.forEach(dia => {
                                console.log(`CONFIG ${dia}:`, this.state?.[dia]?.activo);
                            });
                            this.forceUpdate(); // esto vuelve a renderizar

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
