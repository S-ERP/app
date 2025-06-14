import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SInput, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FormRegistroProyecto from './Components/FormRegistroProyecto';
import MDL from '../../MDL';
import { DinamicTable } from 'servisofts-table';
import SSocket from "servisofts-socket";
import FormRegistroCliente from './Components/FormRegistroCliente';
import PButtom from '../../Components/PButtom';
import FloatButtom from '../../Components/FloatButtom';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';

export default class MensajesMasivos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seleccionados: [], // Array para guardar los seleccionados
        };
    }

    async enviarMensajesSeleccionados() {
        const { seleccionados } = this.state;

        for (let i = 0; i < seleccionados.length; i++) {
            const cliente = seleccionados[i];

            // Mostrar notificación para este cliente
            SNotification.send({
                title: "📤 Enviando mensaje",
                body: `(${i + 1}/${seleccionados.length}) Enviando a: ${cliente.nombres} (${cliente.telefono})`,
                color: STheme.color.success
            });

            // Esperar 3 segundos antes de enviar el siguiente
            await new Promise(resolve => setTimeout(resolve, 1000)); // 3000 ms = 3 s
        }

        // Notificación final
        SNotification.send({
            title: "✅ Envío completado",
            body: `Se enviaron ${seleccionados.length} mensajes correctamente.`,
            color: STheme.color.primary
        });
    }


    render() {
        return <SPage
            title={<SView row>
                <SIcon name="whatsapp" fill='red' width={14} />
                <SText>  Mensajes masivos </SText>
            </SView>}
            center
        >

            <DinamicTable
                key='index'
                textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='multiple'
                selectKey='key'
                ref={ref => this.DinamicTable = ref}
                language='es'
                loadData={async () => {
                    let all = await MDL.crm.cliente.getAll();
                    all = all.filter(e => e.telefono && e.telefono.length >= 8);
                    all.sort((a, b) => (a.telefono?.length || 0) - (b.telefono?.length || 0));
                    return all;
                }}
                onSelect={(e) => {
                    let seleccionados = [...this.state.seleccionados];
                    const yaExiste = seleccionados.find(item => item.key === e.row.key);
                    if (!yaExiste) {
                        seleccionados.push(e.row);
                    }
                    else {
                        seleccionados = seleccionados.filter(item => item.key !== e.row.key);
                    }
                    this.setState({ seleccionados });

                    SNotification.send({
                        title: "Seleccionado",
                        body: `total ${seleccionados.length} clientes.`,
                        color: STheme.color.warning
                    });

                }}


            >

                <DinamicTable.Col key={" "} label='sELECCIONADO' width={100} data={() => ""}
                    customComponent={e => <SInput
                        type="checkBox"
                        value={this.state.seleccionados.find(sel => sel.key === e.row.key) ? true : false}
                        onChangeText={(val) => {
                            let seleccionados = [...this.state.seleccionados];
                            if (val) {
                                seleccionados.push(e.row);
                            } else {
                                seleccionados = seleccionados.filter(item => item.key !== e.row.key);
                            }
                            this.setState({ seleccionados });
                        }}
                    />}
                />

                <DinamicTable.Col key={"key"} label='ID' width={35} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"nombres"} label='Nombre completo' width={180} data={(e) => e.row.nombres} />
                <DinamicTable.Col key={"telefono"} label='Teléfono' width={120} data={(e) => e.row.telefono} />
                <DinamicTable.Col key={"estado"} label='Status' width={120} data={(e) => e.row.estado} />

            </DinamicTable>

            {/* Botón enviar */}
            <SView backgroundColor='white' style={{
                position: "absolute",
                top: 20,
                right: "30%",
                borderRadius: 4,
                overflow: "hidden",
            }} width={140} height={50} center

                onPress={() => {
                    console.log("📤 Enviar a:", this.state.seleccionados);
                    alert("Enviando mensajes a los seleccionados: " + this.state.seleccionados.map(item => item.telefono).join(", "));
                    this.enviarMensajesSeleccionados()
                }}
            >

                <SView row>
                    <SIcon name='Reload' width={15} />
                    <SView width={10} />
                    <SText color='black' fontSize={18}>Enviar</SText>
                </SView>
            </SView>

        </SPage>
    }
}
