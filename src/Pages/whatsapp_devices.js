import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SPage, SView, SText, STheme, SIcon, SPopup, SInput, SButtom, SHr, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import FloatButtom from '../Components/FloatButtom';
import MDL from '../MDL';
import Config from '../Config';




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

    formulario = (data = null) => {
        const isEdit = !!data;
        let descripcionRef;
        return SPopup.open({
            key: "formulario_dispositivo",
            content: (
                <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}    >
                    {/* <SView center>
                    </SView> */}


                    {/* Registrar nuevo dispositivo WhatsApp
                        Complete la información y escanee el código QR para sincronizar un nuevo dispositivo de WhatsApp Business. */}

                    <SText fontSize={16} bold>{isEdit ? "Actualizar dispositivo WhatsApp" : "Registrar nuevo dispositivo WhatsApp"} </SText>

                    <SHr height={8} />
                    <SText fontSize={12}>Complete la información y escanee el código QR para sincronizar un nuevo dispositivo de WhatsApp Business.</SText>
                    <SHr height={16} />
                    <SInput
                        label="Descripción"
                        placeholder={"Nombre del dispositivo"}
                        defaultValue={data?.descripcion || ""}
                        ref={ref => descripcionRef = ref}
                        style={{
                            height: 40,
                            borderRadius: 4,
                            backgroundColor: STheme.color.lightGray + "30",
                            // textAlign: "center",
                            color: STheme.color.text,
                        }}
                    />

                    <SInput
                        label="Número"
                        placeholder={"+591 XXXXXXXX"}
                        defaultValue={data?.descripcion || ""}
                        ref={ref => telefonoRef = ref}
                        style={{
                            height: 40,
                            borderRadius: 4,
                            backgroundColor: STheme.color.lightGray + "30",
                            // textAlign: "center",
                            color: STheme.color.text,
                        }}
                    />

                    <SInput
                        label="Empresa"
                        placeholder={"Seleccione empresa"}

                        defaultValue={data?.key_empresa || ""}
                        ref={ref => telefonoRef = ref}
                        style={{
                            height: 40,
                            borderRadius: 4,
                            backgroundColor: STheme.color.lightGray + "30",
                            // textAlign: "center",
                            color: STheme.color.text,
                        }}
                    />
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
                        <SButtom
                            type={isEdit ? "outline" : "outline"}
                            onPress={async () => {
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
                                this.DinamicTable.loadData();

                                SPopup.close("formulario_dispositivo");

                            }}
                        >
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


                    //  key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                    colors={Config.table.colors()}
                    cellStyle={Config.table.cellStyle()}
                    textStyle={Config.table.textStyle()}
                    selectType='single'
                // ref={ref => this.DinamicTable = ref} loadData={async () => { return await MDL.whatsapp.device.getAll(); }} onSelect={(e) => { console.log("Selected project:", e.row); }}

                >
                    <DinamicTable.Col key="index" label="N°" width={40} data={e => e.index + 1} />
                    <DinamicTable.Col key="key" label="Key" width={200} data={e => e.row.key} />
                    <DinamicTable.Col key="descripcion" label="descripcion" width={100} data={e => e.row.descripcion} />
                    <DinamicTable.Col key="key_empresa" label="Empresa" width={200} data={e => e.row.key_empresa} />

                    <DinamicTable.Col key="estatus" label="Conexion" width={200} data={e => e.row?.session?.status} />

                    <DinamicTable.Col key={"editar"} label='Editar' width={100} data={() => ""}
                        customComponent={e => (
                            <SView row card padding={2} onPress={() => this.formulario(e?.row)}>
                                <SIcon name='Edit' fill='blue' width={18} />
                                <SView width={4} />
                                <SText center color={STheme.color.green}>
                                    {"Actualizar"}
                                </SText>
                            </SView>
                        )}
                    />

                    <DinamicTable.Col key={"eliminar"} label='Eliminar' width={100} data={() => ""}
                        customComponent={e => (
                            <SView row card padding={2} onPress={() => {
                                SPopup.confirm({
                                    title: "Esta seguro que quiere eliminar?",
                                    message: "Se le enviara a la lista de compras.",
                                    onPress: () => {
                                        MDL.whatsapp.device.edit(e?.row?.key, { estado: 0 })
                                        this.DinamicTable.loadData();
                                    }
                                })
                            }}>
                                <SIcon name='Delete' width={18} />
                                <SView width={4} />
                                <SText center color={STheme.color.green}>
                                    {"Eliminar"}
                                </SText>
                            </SView>
                        )}
                    />
                </DinamicTable>

                <FloatButtom onPress={() => this.formulario()} />
            </SPage>
        );
    }
}

const initStates = state => ({ state });
export default connect(initStates)(WhatsappDevices);
