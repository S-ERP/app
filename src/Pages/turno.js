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


export default class Turno extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // data: null
        };
    }



    bolin() {
        SPopup.open({
            key: "ppupregistro",
            content: (
                <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                    <SText fontSize={16} bold>Configurar Nuevo Horario</SText>

                    <SInput label={"Descripción"} ref={ref => this.input_descripcion = ref}
                        defaultValue={this.params?.input_descripcion ?? ""} />

                    <SInput name={"tiempo_completo"} type='check' label={"Atención 24 horas"}
                        ref={ref => this.input_tiempo_completo = ref}
                        defaultValue={this.params?.input_tiempo_completo ?? ""} />

                    <SInput name={"feriado"} type='check' label={"¿Día feriado?"}
                        ref={ref => this.input_feriado = ref}
                        defaultValue={this.params?.input_feriado ?? ""} />

                    <SInput name={"sin_atencion"} type='check' label={"Sin atención"}
                        ref={ref => this.input_sin_atencion = ref}
                        defaultValue={this.params?.input_sin_atencion ?? ""} />

                    <SInput label={"Hora de inicio"} ref={ref => this.input_hora_inicio = ref} type='hour'
                        defaultValue={this.params?.input_hora_inicio ?? ""} />

                    <SInput label={"Hora de fin"} ref={ref => this.input_hora_fin = ref} type='hour'
                        defaultValue={this.params?.input_hora_fin ?? ""} />

                    <SButtom onPress={() => {
                        // Acción para eliminar o confirmar
                    }}>Eliminar</SButtom>
                </SView>
            )
        });


        // SPopup.open({
        //     key: "ppupregistro",
        //     content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
        //         <SText>Configurar Nuevo Horario</SText>

        //         <SInput name={descripcion} > </SInput>

        //         <SInput name={"timepocompleto"} type='check' > </SInput>



        //         <SInput label={"atencion 24 horas"} ref={ref => this.input_tiempo_completo = ref} type='checkBox'
        //             defaultValue={this.params.input_tiempo_completo ?? ""}
        //         />

        //         <SInput label={"dia feriado"} placeholder={"marcar como dia feriado"} ref={ref => this.input_feriado = ref} type='checkBox'
        //             defaultValue={this.params.input_feriado ?? ""}
        //         />

        //         <SInput label={"sin atencion"} placeholder={"marcar como dia feriado"} ref={ref => this.input_sin_atencion = ref} type='checkBox'
        //             defaultValue={this.params.input_sin_atencion ?? ""}
        //         />

        //         <SInput label={"hora inicio"} ref={ref => this.input_hora_inicvio = ref} type='hour'
        //             defaultValue={this.params.input_hora_inicvio ?? ""}
        //         />

        //         <SInput label={"hora fin"} ref={ref => this.input_hora_fin = ref} type='hour'
        //             defaultValue={this.params.input_hora_fin ?? ""}
        //         />

        //         <SButton  >Eliminar</SButton>


        //     </SView>
        // })
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
                        color: "blue",

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
