import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SList, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class Actividades extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "tarea",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey()
        }).then(e => {
            this.setState({ data: e.data })
        })
    }

    Item = (obj, i, day) => {

        let dia = day.clone();
        dia.addDay(i);
        return <SView padding={4} flex height={100}>
            <SView flex style={{
                backgroundColor: STheme.color.card,
                borderRadius: 16,
                ...(!dia.isCurDate() ? {} : {
                    borderWidth: 1,
                    borderColor: STheme.color.text
                })
            }} padding={4} center>
                <SText color={STheme.color.text} fontSize={14}>{dia.getDayOfWeekJson().textSmall}</SText>
                <SHr />
                <SText color={STheme.color.text} fontSize={18} bold>{dia.toString("dd")}</SText>
            </SView>

        </SView>
    }
    render() {
        let semana = new SDate().getFirstDayOfWeek();
        return <SView col={"xs-12"} >
            <SView row>
                <SText> Actividades</SText>
                <SView width={8} />
                <SText onPress={() => SNavigation.navigate("/tarea")}> + </SText>
            </SView>
            <SHr />
            <SView col={"xs-12"} row>
                {new Array(7).fill(0).map((a, i) => this.Item(a, i, semana))}
            </SView>
        </SView>
    }
}
