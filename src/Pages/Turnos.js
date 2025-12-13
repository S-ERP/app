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
import TurnoComponent from '../Components/TurnoComponent';
import Container from '../Components/Container';
import FloatMenu from '../Components/FloatMenu';
import item from './contabilidad/gestion/item';


export default class Turnos extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    mostrarPopup(aux_key: any) {
        SPopup.open({
            key: "popup_config_horario",
            content: (
                <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 450 }} padding={16} withoutFeedback >
                    <SView col={"xs-12"} height={600} center >
                        <TurnoComponent key_turno={aux_key} onReload={() => {
                            this.DinamicTable.loadData();
                            console.log("✅ Se guardó el turno y se ejecutó el callback");
                            // Aquí puedes refrescar listas, volver a cargar datos, etc.
                        }}

                        ></TurnoComponent>
                    </SView>
                </SView>
            )
        });
    }


    mostrarTabla() {
        let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        return <DinamicTable
            key="tabla"
            ref={ref => this.DinamicTable = ref}
            center
            language="es"
            selectType="single"
            colors={{
                // text: "red",
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
            onSelect={(e) => {

                const { row, evt } = e;
                const nombreTurno = `TURNO: ${row?.nombre ?? 'Sin nombre'}`;
                const options = [];

                // Opción de editar turno
                // if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
                options.push({
                    label: 'Editar',
                    icon: <SIcon name="Edit" fill={STheme.color.text} />,
                    onPress: () => {
                        // const cliente = { ...row, key_usuario: MDL.usuario.session?.key };
                        // PopupCrearCliente.open({
                        //     editObject: cliente,
                        //     key_empresa: cliente.key_empresa,
                        //     onSuccess: () => this.DinamicTable.loadData(),
                        // });
                        this.mostrarPopup(e.row.key)

                    },
                });
                // }

                // Opción de eliminar turno
                // if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
                options.push({
                    label: 'Eliminar',
                    icon: <SIcon name="Delete" fill={STheme.color.text} />,
                    onPress: () => {
                        SPopup.confirm({
                            title: 'Eliminar Cliente',
                            message: `¿Estás seguro de eliminar a ${nombreTurno}?`,
                            onPress: () => {
                                SSocket.sendPromise({
                                    service: 'empresa',
                                    component: 'horario_atencion',
                                    type: '_editarTurnosHorariosAtencion',
                                    data: { ...row, estado: 0 },
                                })
                                    .then(() => {
                                        SNotification.send({
                                            key: 'eliminar_ok',
                                            title: 'Éxito',
                                            body: `${nombreTurno} fue eliminado correctamente.`,
                                            time: 1500,
                                            color: STheme.color.success,
                                        });
                                        this.DinamicTable.loadData();
                                    })
                                    .catch(err => {
                                        console.error('Error al eliminar turno:', err);
                                        SNotification.send({
                                            key: 'eliminar_error',
                                            title: 'Error',
                                            body: 'Ocurrió un error al eliminar. Intenta nuevamente.',
                                            time: 3000,
                                            color: STheme.color.danger,
                                        });
                                    });
                            },
                        });
                    },
                });
                // }

                FloatMenu.open({
                    e: evt,
                    label: nombreTurno,
                    options,
                });

                // this.mostrarPopup(e.row.key)
            }}


            // loadData={async () => {
            //     const all = await MDL.empresa.getTurnosHorariosAtencion();

            //     // 🔁 OPCIONAL: si querés usar clientes en lugar de usuarios
            //     // const usuarios = await MDL.crm.cliente.getAll();
            //     const usuarios = await MDL.usuario.getByKeys(Object.keys(all));

            //     const data = Object.entries(all).flatMap(([key_usuario, turnos]) => {
            //         const usuario = usuarios.find(u => u.key === key_usuario);
            //         return turnos.map((item, index) => ({
            //             ...item,
            //             key_usuario,
            //             usuario, // ✅ Aquí sí incluimos el objeto completo
            //             index
            //         }));
            //     });



            //     console.log("fregadooo", data);
            //     return data;
            // }}

            // loadData={async () => {
            //     const all = await MDL.empresa.getTurnosHorariosAtencion();

            //     // Obtener usuarios por key
            //     const usuarios = await MDL.usuario.getByKeys(
            //         Object.values(all).map(t => t.key_usuario)
            //     );

            //     const data = Object.values(all).flatMap((turno) => {
            //         const usuario = usuarios.find(u => u.key === turno.key_usuario);

            //         return turno.horario_atencion.map((horario, index) => ({
            //             ...horario,               // dia, hora_inicio, hora_fin, etc
            //             turno_nombre: turno.nombre,
            //             atiende_feriado: turno.atiende_feriado,
            //             key_turno: turno.key,
            //             key_empresa: turno.key_empresa,
            //             usuario,                  // objeto usuario completo
            //             index
            //         }));
            //     });

            //     console.log("DATA FINAL", data);
            //     return data;
            // }}

            loadData={async () => {
                const all = await MDL.empresa.getTurnosHorariosAtencion();

                // Obtener usuarios por key_usuario de los turnos
                const usuarios = await MDL.usuario.getByKeys(
                    Object.values(all).map(t => t.key_usuario)
                );

                const data = Object.values(all).map((turno, index) => {
                    const usuario = usuarios.find(u => u.key === turno.key_usuario);

                    return {
                        ...turno,              // mantiene horario_atencion
                        usuario,               // objeto usuario completo
                        index
                    };
                });

                console.log("DATA FINAL", data);
                return data;
            }}



        >
            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />
            {/* <DinamicTable.Col key="key_turno" label="key_turno" width={180}  /> */}
            <DinamicTable.Col key="key_turno" label="key_turno" width={50} data={(e) => e.row?.key} />
            <DinamicTable.Col key="nombre" label="Turno" width={150} data={(e) => e.row?.nombre} />
            <DinamicTable.Col key="dia" label="# Días" width={80} data={(e) => new Set(e.row.horario_atencion.map(h => h.dia)).size} />
            <DinamicTable.Col key="horario" label="Horario" width={450}
                // data={(e) => {
                //     let dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                //     // e.row?.horario_atencion.map(item => `${item.dia} ${item.hora_inicio} - ${item.hora_fin}`).join(', ')
                //     e.row?.horario_atencion
                //         ?.map(item => {
                //             const dia = dias[item.dia];
                //             const inicio = item.hora_inicio.slice(0, 5);
                //             const fin = item.hora_fin.slice(0, 5);

                //             return `${dia} (${inicio} - ${fin})`;
                //         })
                //         .join(', ');
                // }}
                data={(e) => e.row?.horario_atencion.map(item => `${dias[item.dia]} (${item.hora_inicio.slice(0, 5)} - ${item.hora_fin.slice(0, 5)})`).join(', ')}
            // format={"hh:mm"}

            />
            <DinamicTable.Col key="atiende_feriado" label="¿Feriado?" width={100} data={(e) => (e.row?.atiende_feriado === 0) ? "No" : "Sí"} />

            <DinamicTable.Col
                key="fecha_on"
                label="F. Creación"
                width={120}
                dataType="date"
                data={e => new SDate(e.row?.fecha_on, 'yyyy-MM-ddThh:mm:ss').date}
                textStyle={{ fontSize: 12, color: STheme.color.lightGray }}
                dateFormat="yyyy-MM-dd hh:mm"
            />
            {/* <DinamicTable.Col key="key_usuario" label="Usuario" width={250} data={(e) => e.row?.key_usuario} /> */}
            <DinamicTable.Col key={"foto"} label='Admin'
                data={(e) => e.row?.key_usuario}
                width={120}
                customComponent={e => <SView row center><SView style={{
                    width: 24,
                    height: 24,
                    borderRadius: 100,
                    overflow: "hidden",
                    backgroundColor: STheme.color.card + "66",
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + e.data} style={{
                        resizeMode: "cover",
                    }} />

                </SView>
                    <SView width={8} />
                    <SText numberOfLines={1}>{e.row?.usuario.Nombres}</SText>
                </SView>} />
            {/* <DinamicTable.Col key="asdsad" label="Usuario" width={250} data={(e) => e.row?.usuario.Nombres} /> */}


        </DinamicTable>

    }

    render() {


        return (
            <SPage title="Turnos y Horarios" disableScroll>

                {this.mostrarTabla()}

                <SHr height={20} />
                <FloatButtom onPress={() => { this.mostrarPopup() }} />
            </SPage>
        );
    }


}
