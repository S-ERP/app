import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SText, SView } from 'servisofts-component';
import DiaItem from './DiaItem';
import TurnoComponent from '.';

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

    render() {
        return <SView flex >
            <FlatList
                data={this.dias}
                ItemSeparatorComponent={a => <SHr h={20} />}
                renderItem={({ item }) => <DiaItem dia={item} {...this.props} />}
            />
            <SHr h={20} />
            <SText padding={8} card onPress={() => {
                console.log(this.props.turnoComponent.turno);
            }}>{"SAVE"}</SText>
        </SView>
    }
}

