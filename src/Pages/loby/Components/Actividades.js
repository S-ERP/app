import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SList, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import PButtom3 from '../../../Components/PButtom3';

export default class Actividades extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        let semana = new SDate().getFirstDayOfWeek();
        SSocket.sendPromise({
            component: "tarea",
            type: "cantidad",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            fecha_inicio: semana.toString("yyyy-MM-dd"),
            fecha_fin: semana.addDay(6).toString("yyyy-MM-dd")
        }).then(e => {
            console.log(e);
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }

    addOpcion = (icon, label, navigate) => {
        return <SView flex style={{ alignItems: "flex-end" }} onPress={() => SNavigation.navigate(navigate)} >
            <SView center row card width={105} height={35}>
                <SIcon name={icon} width={20} fill={STheme.color.text} />
                <SView width={8} />
                <SText fontSize={12} center >{label}</SText>
            </SView>
        </SView>
    }

    Item = (obj, i, day) => {

        let dia = day.clone();
        dia.addDay(i);

        let cantidad = 0;
        if (this.state.data) {
            let objcant = this.state?.data[dia.toString("yyyy-MM-dd")];
            if (objcant) {
                cantidad = objcant.cantidad;
            }
        }

        return <SView key={"Actividad" + i} padding={4} flex height={100} onPress={() => {
            SNavigation.navigate("/tarea/dia", { fecha: dia.toString("yyyy-MM-dd") })
        }}>
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
                {!cantidad ? null :
                    <SView style={{
                        position: "absolute",
                        width: 20,
                        height: 20,
                        backgroundColor: STheme.color.danger,
                        borderRadius: 100,
                        bottom: -4,
                        right: -4,
                    }} center>
                        <SText fontSize={10} center color={"#fff"}>{cantidad}</SText>
                    </SView>
                }
            </SView>
            {/* {!dia.isCurDate() ? null :
                <SView center width={15} height={15} style={{ position: "absolute", bottom: 0, right: 0, borderRadius: 45 }} backgroundColor={STheme.color.danger}>
                    <SText fontSize={8} color={STheme.color.white} >5</SText>
                </SView>
            } */}
        </SView>
    }
    render() {
        let semana = new SDate().getFirstDayOfWeek();
        return <SView col={"xs-12"} >
            <SView col={"xs-12"} row >
                <SText bold fontSize={15}> Actividades</SText>
                {/* <SView flex style={{ alignItems: "flex-end" }} onPress={() => SNavigation.navigate("/tarea")} >
                    <SView center row card width={120} height={40}>
                        <SIcon name={"addTarea"} width={25} fill={STheme.color.text} />
                        <SView width={8} />
                        <SText fontSize={12} center >Adicionar </SText>
                    </SView>
                </SView> */}
                {this.addOpcion("addTarea", "Ver más", "/tarea")}
            </SView>
            <SHr />
            <SView col={"xs-12"} row>
                {new Array(7).fill(0).map((a, i) => this.Item(a, i, semana))}
            </SView>
        </SView>
    }
}
