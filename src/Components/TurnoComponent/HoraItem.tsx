import React, { Component } from 'react';
import { View, Text, Switch } from 'react-native';
import { SInput, SText, SView } from 'servisofts-component';
import TurnoComponent, { HorarioItem } from '.';
import SIconApp from '../../Assets/SIconApp';

type HoraItemProps = {
    // turnoComponent: TurnoComponent,
    horario: HorarioItem,
    dia: any,
    onDelete?: () => void
}
export default class HoraItem extends Component<HoraItemProps> {

    render() {
        return <SView col={"xs-12"} row>
            <SView flex>
                <SInput
                    value={this.props.horario.hora_inicio}
                    label={"Inicio"}
                    onChangeText={e => {
                        this.props.horario.hora_inicio = e;
                        this.forceUpdate();
                    }}
                />
            </SView>
            <SView width={8} />
            <SView flex>
                <SInput
                    value={this.props.horario.hora_fin}
                    label={"fin"}
                    onChangeText={e => {
                        this.props.horario.hora_fin = e;
                        this.forceUpdate();
                    }}
                />
            </SView>
            <SView width={8} />
            <SView width={50} center onPress={()=>{
                if (this.props.onDelete) {
                    this.props.onDelete();
                }
            }}>
                <SIconApp name='Delete' />
            </SView>
        </SView>
    }
}
