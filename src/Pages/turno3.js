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


export default class Turno3 extends Component {
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
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 550 }} padding={16} withoutFeedback>
                    <SText fontSize={18} bold>🗓 Configurar Horarios Semanales</SText>
                    <SHr height={16} />
                    <SView col={"xs-12"} height={400} center  >
                        <SScrollView2   >

                            <SView col={"xs-11.7"} style={{ paddingHorizontal: 16,  }} height={80} row center border={STheme.color.lightGray}  >
                                <SView col={"xs-5"}  >
                                    <SInput label={"Nombre del turno/descripcion"} ref={ref => this.input_turno_nombre = ref} />
                                </SView>
                                <SView width={20} />
                                <SView col={"xs-3"} height={50} center border="transparent" >
                                    <SInput type="checkBox" border="green"
                                        height={20}
                                        // defaultValue={this.state?.[dia]?.feriado}
                                        label={"Día feriado ?"}
                                        onChangeText={() => {
                                            // this.setState({ [dia]: { ...this.state?.[dia], feriado: !this.state?.[dia]?.feriado } });
                                            // this.forceUpdate()
                                        }}
                                    />
                                    <SText fontSize={9} color={STheme.color.lightGray}>Marcar como día feriado</SText>

                                </SView>
                                <SView flex />

                            </SView>
                            <SHr height={16} />


                            {dias.map((dia) => (
                                <SView key={dia} col={"xs-11.7"} style={{ marginBottom: 24 }} border="transparent" center row>



                                    <SView col={"xs-12"} height={40} backgroundColor={STheme.color.card} style={{ marginBottom: 18 }} row center>
                                        <SView flex backgroundColor="transparent" style={{ paddingLeft: 20 }}  >
                                            <SText fontSize={16} bold>{dia.charAt(0).toUpperCase() + dia.slice(1)}</SText>
                                        </SView>
                                        <SView col={"xs-1"} border="transparent" center >
                                            <SInput type="checkBox" center
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
                                        </SView>
                                    </SView>

                                    {/* <SView col={"xs-12"} > */}


                                    {this.state?.[dia]?.activo ? <>
                                        <SView col={"xs-12"} border="transparent" row center >
                                            {/* <SView col={"xs-12"} border="blue" style={{ paddingLeft: 32 }}> */}

                                            <SView col={"xs-12"} height={60} row center border={STheme.color.lightGray} style={{ marginBottom: 24, paddingHorizontal: 16 }}>
                                                <SView flex>
                                                    <SText fontSize={16} bold>Atención 24 horas</SText>
                                                    <SText fontSize={12} color={STheme.color.lightGray}>Servicio disponible las 24 horas</SText>
                                                </SView>
                                                <SView width={30} center>
                                                    <SInput type="checkBox" center defaultValue={this.state?.[dia]?.es24Horas}
                                                        onChangeText={() => {
                                                            this.setState({ [dia]: { ...this.state?.[dia], es24Horas: !this.state?.[dia]?.es24Horas } });
                                                            this.forceUpdate()
                                                        }} />
                                                </SView>
                                            </SView>

                                            {/* <SView col={"xs-12"} height={60} row center border={STheme.color.lightGray} style={{ marginBottom: 24, paddingHorizontal: 16 }}>
                                                <SView flex>
                                                    <SText fontSize={16} bold>Sin atención</SText>
                                                    <SText fontSize={12} color={STheme.color.lightGray}>No hay horario de atención este día</SText>
                                                </SView>
                                                <SView width={30} center>
                                                    <SInput type="checkBox" center defaultValue={this.state?.[dia]?.sinAtencion}
                                                        onChangeText={() => {
                                                            this.setState({ [dia]: { ...this.state?.[dia], sinAtencion: !this.state?.[dia]?.sinAtencion } });
                                                            this.forceUpdate()
                                                        }} />
                                                </SView>
                                            </SView>
                                            <SView col={"xs-12"} height={60} row center border={STheme.color.lightGray} style={{ marginBottom: 24, paddingHorizontal: 16 }}>
                                                <SView flex>
                                                    <SText fontSize={16} bold>Día feriado</SText>
                                                    <SText fontSize={12} color={STheme.color.lightGray}>Marcar como día feriado</SText>
                                                </SView>
                                                <SView width={30} center>
                                                    <SInput type="checkBox" center defaultValue={this.state?.[dia]?.feriado}
                                                        onChangeText={() => {
                                                            this.setState({ [dia]: { ...this.state?.[dia], feriado: !this.state?.[dia]?.feriado } });
                                                            this.forceUpdate()
                                                        }} />
                                                </SView>
                                            </SView> */}


                                            <SView col={"xs-12"} height={60} row center  >
                                                <SView flex>
                                                    <SText fontSize={18} bold>Turnos de trabajo</SText>
                                                </SView>

                                                <SView width={30} center>
                                                    <SInput type="checkBox" center defaultValue={this.state?.[dia]?.feriado}
                                                        onChangeText={() => {
                                                            this.setState({ [dia]: { ...this.state?.[dia], feriado: !this.state?.[dia]?.feriado } });
                                                            this.forceUpdate()
                                                        }} />
                                                </SView>



                                                <SView center row style={{
                                                    backgroundColor: "#0f0e0e",
                                                    borderColor: STheme.color.card,
                                                    borderWidth: 1,
                                                    borderRadius: 25,
                                                    height: 28,
                                                    width: 120,
                                                }} onPress={() => {
                                                    this.setState({
                                                        [dia]: { ...this.state?.[dia], horario: !this.state?.[dia]?.horario }
                                                    });
                                                    this.forceUpdate()
                                                    // SPopup.close("popup_config_horario");
                                                }}>



                                                    <SIcon name='adicional' width={8} />
                                                    <SText center color='white'> gregar turno</SText>

                                                </SView>
                                            </SView>

                                            {!this.state?.[dia]?.horario ?
                                                <SView col={"xs-12"} height={80} center border={STheme.color.lightGray} >
                                                    <SText fontSize={16} bold color={STheme.color.lightGray} >No hay turnos configurados</SText>
                                                    <SText fontSize={12} color={STheme.color.lightGray}>Haz clic en "Agregar Turno" para comenzar</SText>
                                                </SView>
                                                :
                                                <SView col={"xs-12"} height={80} center border={STheme.color.card}   >
                                                    <SView col={"xs-11.5"} center row >

                                                        <SView col={"xs-3"} center backgroundColor='transparent'>
                                                            <SInput label={"Nombre del turno"} ref={ref => this.input_turno_nombre = ref} />
                                                        </SView>
                                                        <SView flex />
                                                        <SView col={"xs-3"} center>
                                                            <SInput label={"Hora inicio"} type="hour" ref={ref => this.input_hora_inicio = ref} />
                                                        </SView>
                                                        <SView flex />
                                                        <SView col={"xs-3"} center border={"transparent"} >
                                                            <SInput label={"Hora fin"} type="hour" ref={ref => this.input_hora_fin = ref} />
                                                        </SView>
                                                        <SView flex />
                                                        <SView col={"xs-1"} center border={"transparent"} style={{ paddingTop: 28 }}  >
                                                            <SView width={40} height={40} center border={STheme.color.card} onPress={() => alert("Cerrar turno")}>
                                                                <SIcon name="crmeliminar" stroke='red' width={20} />
                                                            </SView>
                                                        </SView>

                                                        {/* <SText fontSize={16} bold color={STheme.color.lightGray} >formulario</SText> */}
                                                    </SView>
                                                    <SHr height={20} />

                                                </SView>
                                            }


                                            {/* <SHr height={18} />
                                            <SView col={"xs-12"} row center>
                                                <SView flex />
                                                <SView col={"xs-6"} row center border="transparent">


                                                    <SView center row style={{
                                                        backgroundColor: "#fcfce9",
                                                        borderColor: STheme.color.card,
                                                        borderWidth: 1,
                                                        borderRadius: 4,
                                                        height: 42,
                                                        width: 100,
                                                    }} onPress={() => {
                                                        this.setState({
                                                            [dia]: { ...this.state?.[dia], horario: !this.state?.[dia]?.horario }
                                                        });
                                                        this.forceUpdate()
                                                        // SPopup.close("popup_config_horario");
                                                    }}>



                                                        <SText center color='black' bold>Cancelar</SText>

                                                    </SView>

                                                    <SView flex />

                                                    <SView center row style={{
                                                        backgroundColor: "#0f0e0e",
                                                        borderColor: STheme.color.card,
                                                        borderWidth: 1,
                                                        borderRadius: 4,
                                                        height: 42,
                                                        width: 120,
                                                    }} onPress={() => {

                                                        SPopup.close("popup_config_horario");
                                                    }}>



                                                        <SText center color='white'>Guardar Horario</SText>

                                                    </SView>
                                                </SView>
                                            </SView>
                                            <SHr height={18} /> */}

                                        </SView>
                                    </> : null}





                                </SView>
                            ))}
                        </SScrollView2>
                    </SView>

                    <SHr height={18} />
                    <SView col={"xs-12"} row center>
                        <SView flex />
                        <SView col={"xs-6"} row center border="transparent">


                            <SView center row style={{
                                backgroundColor: "#fcfce9",
                                borderColor: STheme.color.card,
                                borderWidth: 1,
                                borderRadius: 4,
                                height: 42,
                                width: 100,
                            }} onPress={() => {
                                this.setState({
                                    [dia]: { ...this.state?.[dia], horario: !this.state?.[dia]?.horario }
                                });
                                this.forceUpdate()
                                // SPopup.close("popup_config_horario");
                            }}>



                                <SText center color='black' bold>Cancelar</SText>

                            </SView>

                            <SView flex />

                            <SView center row style={{
                                backgroundColor: "#0f0e0e",
                                borderColor: STheme.color.card,
                                borderWidth: 1,
                                borderRadius: 4,
                                height: 42,
                                width: 120,
                            }} onPress={() => {

                                SPopup.close("popup_config_horario");
                            }}>



                                <SText center color='white'>Guardar Horario</SText>

                            </SView>
                        </SView>
                    </SView>
                    <SHr height={18} />

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
