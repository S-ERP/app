import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SView, SText, STheme, SIcon, SPopup, SInput, SButtom, SHr, SNotification, SNavigation, SImage } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import FloatButtom from '../../Components/FloatButtom';
import MDL from '../../MDL';
import Config from '../../Config';
import Model from '../../Model';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';




const mockDevices = [
    {
        key: "WA001",
        dispositivo_name: "Ventas Principal",
        dispositivo_phone: "+5491123456789",
        key_empresa: "ACME001",
        status: "connected",
        lastSync: "2023-06-12T15:30:00"
    },
    {
        key: "WA002",
        dispositivo_name: "Soporte Técnico",
        dispositivo_phone: "+5491187654321",
        key_empresa: "ACME001",
        status: "disconnected",
        lastSync: "2023-06-10T09:15:00"
    },
];

class WhatsappDevices extends Component {


    componentDidMount() {
        this.setState({ loading: true })

    }

    estado(status) {
        let mensaje = "";
        let backgroundColor = STheme.color.info;

        switch (status) {
            case "initializing":
                mensaje = "Inicializando";
                backgroundColor = STheme.color.warning;
                break;
            case "qr":
                mensaje = "Esperando escaneo QR";
                backgroundColor = STheme.color.warning;
                break;
            case "ss":
                mensaje = "Sesión iniciada";
                backgroundColor = STheme.color.success;
                break;
            case "ready":
                mensaje = "Listo";
                backgroundColor = STheme.color.success;
                break;
            case "authenticated":
                mensaje = "Autenticado";
                backgroundColor = STheme.color.success;
                break;
            case "auth_failure":
                mensaje = "Fallo de autenticación";
                backgroundColor = STheme.color.danger;
                break;
            case "disconnected":
                mensaje = "Desconectado";
                backgroundColor = STheme.color.danger;
                break;
            default:
                mensaje = status;
                if(!mensaje) mensaje = "Desconectado";
                backgroundColor = STheme.color.gray;
                break;
        }

        return (
            <SView center>
                <SView
                    padding={4}
                    style={{
                        backgroundColor: backgroundColor,
                        borderRadius: 4,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <SText fontSize={12} color={STheme.color.white} bold center>
                        {mensaje}
                    </SText>
                </SView>
            </SView>
        )
    }



    formulario = (data = null) => {
        const isEdit = !!data;
        let descripcionRef;

        const handleSubmit = async () => {
            const descripcion = descripcionRef.getValue();
            const webhook = webhookRef.getValue();
            if (!descripcion) {
                SNotification.send({
                    title: "Error",
                    body: "Debe ingresar una descripción.",
                    color: STheme.color.danger,
                });
                return;
            }

            if (isEdit) {
                await MDL.whatsapp.device.edit(data.key, { descripcion, webhook });
            } else {
                await MDL.whatsapp.device.registrar({ descripcion, webhook });
            }

            SNotification.send({
                title: isEdit ? "Dispositivo actualizado" : "Dispositivo registrado",
                body: "",
                color: STheme.color.success,
                time: 4000,
            });

            if (this.DinamicTable?.loadData) this.DinamicTable.loadData();

            SPopup.close("formulario_dispositivo");
        };

        return SPopup.open({
            key: "formulario_dispositivo",
            content: (
                <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}    >
                    <SText fontSize={16} bold>{isEdit ? "Actualizar dispositivo WhatsApp" : "Registrar nuevo dispositivo WhatsApp"} </SText>
                    <SHr height={8} />
                    <SText fontSize={12}>Complete la información y escanee el código QR para sincronizar un nuevo dispositivo de WhatsApp Business.</SText>
                    <SHr height={16} />
                    <SInput
                        autoFocus

                        label="Descripción"
                        placeholder={"Nombre del dispositivo"}
                        defaultValue={data?.descripcion || ""}
                        ref={ref => descripcionRef = ref}
                        required={true}
                        style={{
                            height: 40,
                            borderRadius: 4,
                            backgroundColor: STheme.color.lightGray + "30",
                            color: STheme.color.text,
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {

                                webhookRef.focus();
                                e.preventDefault();


                            }

                            if (e.key === "Escape") {
                                e.preventDefault();
                                SPopup.close("formulario_dispositivo");
                            }
                        }}
                    />

                    <SInput
                        // autoFocus
                        type='textArea'
                        label="webhook"
                        placeholder={"Nombre del dispositivo"}
                        defaultValue={data?.webhook || ""}
                        ref={ref => webhookRef = ref}
                        // required={true}
                        style={{
                            height: 60,
                            borderRadius: 4,
                            backgroundColor: STheme.color.lightGray + "30",
                            color: STheme.color.text,
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSubmit();
                            }

                            if (e.key === "Escape") {
                                e.preventDefault();
                                SPopup.close("formulario_dispositivo");
                            }
                        }}
                    />

                    {/* <SInput
                        label="Número"
                        placeholder={"+591 XXXXXXXX"}
                        defaultValue={""}
                        ref={ref => telefonoRef = ref}
                        style={{
                            height: 40,
                            borderRadius: 4,
                            backgroundColor: STheme.color.lightGray + "30",
                            color: STheme.color.text,
                        }}
                    /> */}

                    {/* <SInput
                        label="Empresa"
                        placeholder={"Seleccione empresa"}
                        defaultValue={data?.key_empresa || ""}
                        ref={ref => telefonoRef = ref}
                        style={{
                            height: 40,
                            borderRadius: 4,
                            backgroundColor: STheme.color.lightGray + "30",
                            color: STheme.color.text,
                        }}
                    /> */}
                    <SHr height={32} />
                    <SView row center>
                        <SButtom
                            type={"danger"}
                            onPress={() => {
                                SPopup.close("formulario_dispositivo");
                            }}
                        >
                            {"Cancelar"}
                        </SButtom>
                        <SView width={16} />
                        <SButtom type={isEdit ? "outline" : "outline"} onPress={handleSubmit}>

                            {isEdit ? "Actualizar" : "Registrar"}
                        </SButtom>
                    </SView>
                    <SView col={"xs-12"} />
                </SView>
            )
        });
    }

    render() {
        return (
            <SPage title="Dispositivos WhatsApp" disableScroll>
                <DinamicTable
                    ref={ref => this.DinamicTable = ref}
                    loadData={async () => await MDL.whatsapp.device.getAll()}
                    key="id"
                    language="es"
                    colors={Config.table.colors()}
                    cellStyle={Config.table.cellStyle()}
                    textStyle={Config.table.textStyle()}
                    selectType='single'

                    onSelect={(e) => {
                        console.log("Selected project:", e.row);
                        FloatMenu.open({
                            e: e.evt,
                            label: e.row.nombre,

                            options: [
                                {
                                    label: "Editar whatsapp",
                                    onPress: () => {
                                        this.formulario(e.row);
                                        // FormRegistroProyecto.open({
                                        //     defaultData: e.row,
                                        //     onActualizar: (nuevoDato) => {
                                        //         this.DinamicTable.loadData();
                                        //         console.log("Proyecto actualizado:", nuevoDato);
                                        //     },
                                        // });
                                    },
                                    icon: <SIcon name="Edit" fill={STheme.color.text} />,
                                },
                                {
                                    label: "Eliminar whatsapp",
                                    icon: <SIcon name="Delete" fill={STheme.color.text} />,
                                    onPress: () => {
                                        SPopup.confirm({
                                            title: "Eliminar whatsapp",
                                            message: "¿Estas seguro de eliminar el whatsapp?",
                                            onPress: () => {
                                                MDL.whatsapp.device.edit(e?.row?.key, { estado: 0 }).then(e => {
                                                    SNotification.send({
                                                        title: "Dispositivo eliminado",
                                                        body: "Dispositivo eliminado.",
                                                        color: STheme.color.danger,
                                                        time: 4000,
                                                    });
                                                    this.DinamicTable.loadData();
                                                })


                                            },
                                        });
                                    },
                                },
                            ],
                        });
                    }}

                >
                    <DinamicTable.Col key="index" label="N°" width={40} textStyle={{
                        fontSize: 10, color: STheme.color.lightGray
                    }} data={e => e.index + 1} />

                    <DinamicTable.Col key="key" label="Key" width={100} textStyle={{
                        fontSize: 10, color: STheme.color.lightGray
                    }} data={e => e.row.key} />

                    <DinamicTable.Col key={"chats"} label='Accion' width={110} data={() => ""}
                        customComponent={e => (
                            <SView row card padding={2} height={40} center

                                onPress={() => {
                                    SNavigation.navigate("/whatsapp/chats", { pk: e?.row?.key })
                                }}
                                // onLongPress={() => {
                                //     SPopup.confirm({
                                //         title: "Ingresar",
                                //         message: "Abre el historial de conversaciones de este dispositivo.",
                                //         // type: "1",
                                //     });
                                // }}
                            >
                                <SView width={4} />
                                <SIconApp name='whatsapp' fill='green' width={18} />
                                <SView width={4} />
                                <SText center color={STheme.color.green}>{""}</SText>
                            </SView>
                        )}
                    />
                    <DinamicTable.Col key="descripcion" textStyle={{
                        fontWeight: "bold",
                        fontSize: 14
                    }} label="descripcion" width={150} data={e => e.row.descripcion} />
                    <DinamicTable.Col key="estatus" label="Conexion" width={120} data={() => ""} customComponent={e => (this.estado(e.row?.session?.status))} />
                    <DinamicTable.Col key="webhook" label="webhook" width={180} wrap data={e => e.row.webhook} textStyle={{
                        color: STheme.color.link,
                    }} />
                    {/* <DinamicTable.Col key="qr" label="qr" width={100} center data={e => e.row?.session?.qr}
                        customComponent={e =>
                            e.row?.session?.qr ?
                                (<SView row center>
                                    <SView width={50} height={50} card  >
                                        <Qr content={e.row.session.qr} />
                                    </SView>
                                </SView>
                                ) : null
                        }
                    /> */}

                    {/* <DinamicTable.Col key="webhub" label="webhub" width={300} center data={e => e.row?.session?.qr}
                        customComponent={e =>
                            <SView row center>
                                <SView width={250}   center  >
                                    <SInput name={"text"} label={"WebHub"} ></SInput>
                                </SView>
                            </SView>
                        }
                    /> */}

                    {/* <DinamicTable.Col key={"editar"} label='Editar' width={100} data={() => ""}
                        customComponent={e => (
                            <SView row center card padding={2} onPress={() => this.formulario(e?.row)}>
                                <SView width={4} />
                                <SIcon name='Pencil' fill={STheme.color.lightGray} width={14} />
                                <SView width={4} />
                                <SText center  >{"Actualizar"}</SText>
                            </SView>
                        )}
                    />

                    <DinamicTable.Col key={"eliminar"} label='Eliminar' width={100} data={() => ""}
                        customComponent={e => (
                            <SView row center card padding={4} onPress={() => {
                                SPopup.confirm({
                                    title: "Esta seguro que quiere eliminar?",
                                    message: "Se le enviara a la lista de compras.",
                                    onPress: () => {
                                        MDL.whatsapp.device.edit(e?.row?.key, { estado: 0 })

                                        SNotification.send({
                                            title: "Dispositivo eliminado",
                                            body: "Dispositivo eliminado.",
                                            color: STheme.color.danger,
                                            time: 4000,
                                        });
                                        this.DinamicTable.loadData();
                                    }
                                })
                            }}


                            >
                                <SView width={4} />
                                <SIcon name='Cerrar' fill={STheme.color.lightGray} width={14} />
                                <SView width={8} />
                                <SText center color={STheme.color.green}>
                                    {"Eliminar"}
                                </SText>
                            </SView>
                        )}
                    /> */}


                </DinamicTable>

                <FloatButtom onPress={() => this.formulario()} />
            </SPage>
        );
    }
}

export default WhatsappDevices
