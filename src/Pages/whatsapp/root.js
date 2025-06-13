import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SView, SText, STheme, SIcon, SPopup, SInput, SButtom, SHr, SNotification, SNavigation } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import FloatButtom from '../../Components/FloatButtom';
import MDL from '../../MDL';
import Config from '../../Config';




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
                mensaje = "Desconocido";
                backgroundColor = STheme.color.gray;
                break;
        }

        return (
            <SView
                padding={4}
                style={{
                    backgroundColor: backgroundColor,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <SText fontSize={12} color={STheme.color.white} bold center>
                    {mensaje}
                </SText>
            </SView>
        );
    }



    formulario = (data = null) => {
        const isEdit = !!data;
        let descripcionRef;

        const handleSubmit = async () => {
            const descripcion = descripcionRef.getValue();
            if (!descripcion) {
                SNotification.send({
                    title: "Error",
                    body: "Debe ingresar una descripción.",
                    color: STheme.color.danger,
                });
                return;
            }

            if (isEdit) {
                await MDL.whatsapp.device.edit(data.key, { descripcion });
            } else {
                await MDL.whatsapp.device.registrar({ descripcion });
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
        <SPage title="Dispositivos WhatsApp">
            <DinamicTable
                ref={ref => this.DinamicTable = ref}
                loadData={async () => await MDL.whatsapp.device.getAll()}
                key="id"
                language="es"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='single'
            >
                <DinamicTable.Col key="index" label="N°" width={40} data={e => e.index + 1} />
                <DinamicTable.Col key="key" label="Key" width={200} data={e => e.row.key} />
                <DinamicTable.Col key="descripcion" label="descripcion" width={100} data={e => e.row.descripcion} />
                <DinamicTable.Col key="estatus" label="Conexion" width={150} data={() => ""} customComponent={e => (this.estado(e.row?.session?.status))} />
                <DinamicTable.Col key={"editar"} label='Editar' width={100} data={() => ""}
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
                />

                <DinamicTable.Col key={"chats"} label='Accion' width={110} data={() => ""}
                    customComponent={e => (
                        <SView row card padding={2} center

                            onPress={() => {
                                SNavigation.navigate("/whatsapp/chats", { pk: e?.row?.key })
                            }}
                            onLongPress={() => {
                                SPopup.confirm({
                                    title: "Ver chats",
                                    message: "Abre el historial de conversaciones de este dispositivo.",
                                    // type: "1",
                                });
                            }}
                        >
                            <SView width={4} />
                            <SIcon name='MessageSend' fill='green' width={14} />
                            <SView width={4} />
                            <SText center color={STheme.color.green}>  {"Ver chats"}</SText>
                        </SView>
                    )}
                />
            </DinamicTable>

            <FloatButtom onPress={() => this.formulario()} />
        </SPage>
    );
}
}

export default WhatsappDevices
