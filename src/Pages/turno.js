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
        };
    }
    bolin() {
        const dias = ["lunes", "martes", "domingo"];
        this.setState({
            config: dias.reduce((acc, dia) => {
                acc[dia] = {
                    activo: true, // todos los días activos por defecto
                    es24Horas: false,
                    esFeriado: false,
                    sinAtencion: false,
                };
                return acc;
            }, {})
        });

        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} height={700} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 500 }} padding={16} withoutFeedback>


                    <SText fontSize={18} bold>🗓 Configurar Horarios Semanales</SText>
                    <SHr height={16} />

                    <SScrollView2   >


                        {dias.map((dia, i) => {
                            const configDia = this.state?.config?.[dia] ?? {};
                            const isActivo = configDia.activo;
                            const { es24Horas, esFeriado, sinAtencion } = configDia;
                            const mostrarInputsTurno = isActivo && !es24Horas && !esFeriado && !sinAtencion;

                            return (
                                <SView key={dia} col={"xs-12"} style={{ marginBottom: 24 }}>
                                    <SText fontSize={16} bold>{dia.charAt(0).toUpperCase() + dia.slice(1)}</SText>
                                    <SInput
                                        type="checkBox"
                                        label={`¿Activar ${dia}?`}
                                        value={isActivo}
                                        onChange={(val) => {
                                            this.setState({
                                                config: {
                                                    ...this.state.config,
                                                    [dia]: {
                                                        ...this.state.config[dia],
                                                        activo: val
                                                    }
                                                }
                                            });
                                        }}
                                    />
                                    {isActivo && (
                                        <>
                                            <SInput
                                                label={"¿Atención 24 horas?"}
                                                type="checkBox"
                                                value={es24Horas}
                                                onChange={(val) => {
                                                    this.setState({
                                                        config: {
                                                            ...this.state.config,
                                                            [dia]: {
                                                                ...this.state.config[dia],
                                                                es24Horas: val,
                                                                esFeriado: false,
                                                                sinAtencion: false,
                                                            }
                                                        }
                                                    });
                                                    this.forceUpdate();
                                                }}
                                            />
                                            <SInput
                                                label={"¿Día feriado?"}
                                                type="checkBox"
                                                value={esFeriado}
                                                onChange={(val) => {
                                                    this.setState({
                                                        config: {
                                                            ...this.state.config,
                                                            [dia]: {
                                                                ...this.state.config[dia],
                                                                esFeriado: val,
                                                                es24Horas: false,
                                                                sinAtencion: false,
                                                            }
                                                        }
                                                    });
                                                    this.forceUpdate();

                                                }}
                                            />
                                            <SInput
                                                label={"¿Sin atención?"}
                                                type="checkBox"
                                                value={sinAtencion}
                                                onChange={(val) => {
                                                    this.setState({
                                                        config: {
                                                            ...this.state.config,
                                                            [dia]: {
                                                                ...this.state.config[dia],
                                                                sinAtencion: val,
                                                                es24Horas: false,
                                                                esFeriado: false,
                                                            }
                                                        }
                                                    });

                                                    this.forceUpdate();

                                                }}
                                            />

                                        </>
                                    )}
                                    <SHr />
                                </SView>
                            );
                        })}
                    </SScrollView2>

                    <SHr height={40} />
                    <SView center>
                        <SButtom type='outline' onPress={() => {
                            console.log("CONFIG FINAL", this.state.config);
                            SPopup.close("popup_config_horario");
                        }}>Guardar horarios</SButtom>
                    </SView>

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
