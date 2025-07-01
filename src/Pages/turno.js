import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate, SButtom } from 'servisofts-component';
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

const options = ["---", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export default class Turno extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    bolin() {
        this.setState({
            config: {
                descripcion: this?.params?.input_descripcion ?? "",
                dia: this?.params?.input_dia ?? options[0],
                es24Horas: false,
                esFeriado: false,
                sinAtencion: false,
            }
        });

        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView
                    col={"xs-11 sm-10 md-8"}
                    backgroundColor={STheme.color.background}
                    style={{ borderRadius: 8, maxWidth: 500 }}
                    padding={16}
                    withoutFeedback
                >

                    <SView col={"xs-12"} row>
                        <SView flex >
                            <SText fontSize={18} bold>🕒 Configurar Nuevo Horario</SText>
                        </SView>
                        <SView col={"xs-1"} center >
                            <SView col={"xs-12"} center onPress={() => {
                                SPopup.close("popup_config_horario")

                                this.forceUpdate();
                            }}>
                                <SIcon name="Cerrar" fill="white" width={14} />
                            </SView>
                        </SView>
                    </SView>
                    <SHr height={16} />

                    <SInput
                        label={"Descripción"}
                        ref={ref => this.input_descripcion = ref}
                        defaultValue={this?.state?.config?.descripcion}
                    />

                    <SHr />

                    <SInput
                        label={"Seleccionar día de la semana"}
                        ref={ref => this.input_dia = ref}
                        type="select2"
                        options={options}
                        defaultValue={this?.state?.config?.dia}
                    />

                    <SHr />

                    <SInput
                        label={"¿Atención 24 horas?"}
                        type="checkBox"
                        placeholder={"Servicio disponible las 24 horas"}
                        value={this?.state?.config?.es24Horas}
                        onChange={(val) => {
                            this.setState({
                                config: {
                                    ...this?.state?.config,
                                    es24Horas: val,
                                    esFeriado: false,
                                    sinAtencion: false,
                                }
                            });
                        }}
                    />

                    <SInput
                        label={"¿Día feriado?"}
                        placeholder={"Marcar como día feriado"}

                        type="checkBox"
                        value={this?.state?.config?.esFeriado}
                        onChange={(val) => {
                            this.setState({
                                config: {
                                    ...this?.state?.config,
                                    esFeriado: val,
                                    es24Horas: false,
                                    sinAtencion: false,
                                }
                            });
                        }}
                    />

                    <SInput
                        label={"¿Sin atención?"}
                        placeholder={"No hay horario de atención este día"}

                        type="checkBox"
                        value={this?.state?.config?.sinAtencion}
                        onChange={(val) => {
                            this.setState({
                                config: {
                                    ...this?.state?.config,
                                    sinAtencion: val,
                                    es24Horas: false,
                                    esFeriado: false,
                                }
                            });
                        }}
                    />

                    <SHr />

                    {!this?.state?.config?.es24Horas && !this?.state?.config?.sinAtencion && !this?.state?.config?.esFeriado && (
                        <>

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

                                        const horario = {
                                            dia,
                                            descripcion,
                                            es24Horas: config?.es24Horas,
                                            esFeriado: config?.esFeriado,
                                            sinAtencion: config?.sinAtencion,
                                            turnos: isTurnoVisible ? [{
                                                nombre: this.input_turno_nombre?.getValue(),
                                                horaInicio: this.input_hora_inicio?.getValue(),
                                                horaFin: this.input_hora_fin?.getValue()
                                            }] : []
                                        };

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
                        </>
                    )}

                    <SHr height={80} />


                </SView>
            )
        });
    }


    render() {


        return (
            <SPage title="Turnos y Horarios" disableScroll>
                <SHr height={20} />
                <DinamicTable
                    key="tabla"
                    center
                    language="es"
                    selectType="single"
                    colors={{
                        text: "red",
                        background: STheme.color.background,
                        header: STheme.color.card,
                    }}
                    cellStyle={{
                        borderWidth: 0,
                    }}
                    textStyle={{
                        fontSize: 12,
                        color: "white",

                    }}

                    ref={ref => this.DinamicTable = ref}
                    keyExtractor={e => e.usuario}
                    loadData={async () => {
                        const all = await MDL.empresa.getTurnosHorariosAtencion();

                        // 🔁 OPCIONAL: si querés usar clientes en lugar de usuarios
                        // const usuarios = await MDL.crm.cliente.getAll();
                        const usuarios = await MDL.usuario.getByKeys(Object.keys(all));

                        const data = Object.entries(all).flatMap(([key_usuario, turnos]) => {
                            const usuario = usuarios.find(u => u.key === key_usuario);
                            return turnos.map((item, index) => ({
                                ...item,
                                key_usuario,
                                usuario, // ✅ Aquí sí incluimos el objeto completo
                                index
                            }));
                        });

                        console.log("fregado", data);
                        return data;
                    }}

                >
                    <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
                    <DinamicTable.Col key={"foto"} label='User'
                        data={(e) => e.row?.key_usuario}
                        width={35}
                        customComponent={e => <SView style={{
                            width: 24,
                            height: 24,
                            borderRadius: 100,
                            overflow: "hidden",
                            backgroundColor: STheme.color.card + "66",
                        }}>
                            <SImage src={SSocket.api.root + "usuario/" + e.data} style={{
                                resizeMode: "cover",
                            }} />
                        </SView>} />
                    <DinamicTable.Col key="nombre_dia" label="Día" width={100} data={(e) => e.row?.nombre_dia} />
                    <DinamicTable.Col key="horario" label="Horario" width={150} data={(e) => e.row?.horario} />
                    <DinamicTable.Col key="nombre_turno" label="Turno" width={150} data={(e) => e.row?.nombre_turno} />
                    <DinamicTable.Col key="atiende_feriado" label="¿Feriado?" width={100} data={(e) => e.row?.atiende_feriado} />
                    <DinamicTable.Col key="dia_semana" label="Día #" width={80} data={(e) => e.row?.dia_semana} />
                    <DinamicTable.Col key="registrado_el" label="Fecha Registro" width={120} data={(e) => e.row?.registrado_el} />
                    <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.key_usuario} />
                    <DinamicTable.Col key="asdsad" label="Usuario" width={250} data={(e) => e.row?.usuario.Nombres} />


                </DinamicTable>

                <FloatButtom onPress={() => {
                    // alert("dd")
                    this.bolin()
                    // FormRegistroTipoMovimientoLead.open(({ onRegister: (e) => { this.DinamicTable.loadData(); } }))
                }} />
            </SPage>
        );
    }


}
