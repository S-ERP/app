import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SPopup, SText, STheme, SView } from 'servisofts-component';
import DiaItem from './DiaItem';
import TurnoComponent from '.';
import MDL from '../../MDL';

type ListaDeDiasProps = { turnoComponent: TurnoComponent };
export default class ListaDeDias extends Component<ListaDeDiasProps, any> {
    dias: any[];
    constructor(props: ListaDeDiasProps) {
        super(props);
        const dias = Object.keys(SDate.getDaysOfWeek()).map((diaNumber, index) => {
            // @ts-ignore
            const dia = SDate.getDaysOfWeek()[diaNumber];
            dia.key = diaNumber;
            return dia;
        })
        this.dias = dias;
    }


    botonFooter() {
        return <>
            <SHr height={8} />
            <SView col={"xs-11.5"} row center>
                <SView flex />
                <SView width={240} row center border={"transparent" as any}>
                    <SView center row style={{
                        backgroundColor: "#fcfce9", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 42, width: 100,
                    }} onPress={() => {
                        SPopup.close("popup_config_horario");
                    }}>
                        <SText center color='black' bold>Cancelar</SText>
                    </SView>
                    <SView flex />
                    <SView center row style={{ backgroundColor: "#0f0e0e", borderColor: STheme.color.card, borderWidth: 1, borderRadius: 4, height: 42, width: 120 }} onPress={() => {

                        if (this.props.turnoComponent.props.key_turno) {
                            console.log("actualizar");
                            SPopup.close("popup_config_horario");

                        } else {
                            const data = this.props.turnoComponent.turno;
                            const prom = data?.key ? MDL.crm.cliente.editar(data) : MDL.crm.cliente.registrar(data);
                            MDL.empresa.registroTurnosHorariosAtencion(data as any).then((res) => {
                                console.log("nuevo");
                                SPopup.close("popup_config_horario");
                            }).catch((err) => {
                                console.log("error " + err)
                            });
                        }




                    }}>
                        <SText center color='white'>Guardar Horario</SText>

                    </SView>
                </SView>
            </SView>
            <SHr height={8} />
        </>
    }


    render() {
        return <SView flex >
            <FlatList
                data={this.dias}
                ItemSeparatorComponent={a => <SHr h={8} />}
                renderItem={({ item }) => <DiaItem dia={item} {...this.props} />}
            />
            <SHr h={8} />


            {this.botonFooter()}


        </SView>
    }
}
