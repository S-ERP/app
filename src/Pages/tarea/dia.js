import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SDate, SHr, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SList from 'servisofts-component/Component/SList2';
import SSocket from 'servisofts-socket';
import Model from '../../Model';

const horas = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"]
const HEI = 40;
export default class dia extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.fecha = SNavigation.getParam("fecha", new SDate().toString("yyyy-MM-dd"));
        this.date = new SDate(this.fecha, "yyyy-MM-dd")
    }
    componentDidMount() {
        let semana = new SDate().getFirstDayOfWeek();
        SSocket.sendPromise({
            component: "tarea",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            fecha_inicio: this.date.toString("yyyy-MM-dd"),
            fecha_fin: this.date.toString("yyyy-MM-dd")
        }).then(e => {
            console.log(e);
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }


    item(hora) {
        let color = STheme.color.gray
        return <SView col={"xs-12"} height={HEI}>
            <SView row col={"xs-12"} >
                <SText color={color} width={50}>{hora}</SText>
                <SView flex>
                    <SHr h={1} color={color + "66"} />
                </SView>
            </SView>
        </SView>
    }
    renderTareas() {
        if (!this.state.data) return null;
        return Object.values(this.state.data).map((a) => {
            let fi = new SDate(a.fecha_inicio, "yyyy-MM-ddThh:mm:ss");
            let ff = new SDate(a.fecha_fin, "yyyy-MM-ddThh:mm:ss");

            let iy = (fi.toJson().hour * HEI) + (fi.toJson().minutes * (HEI / 60));
            let fy = (ff.toJson().hour * HEI) + (ff.toJson().minutes * (HEI / 60));

            return <SView col={"xs-12"} height={fy - iy} style={{
                position: "absolute",
                top: iy,

            }} row>
                <SView width={50} />
                <SView flex height backgroundColor={a.color ?? "#FF00FF"} style={{
                    borderRadius: 4,
                    padding: 2,
                    opacity: 0.8,
                }} onPress={() => {
                    SNavigation.navigate("/tarea/edit", { pk: a.key })
                }}>
                    <SText fontSize={12}>{a.descripcion}</SText>
                </SView>
            </SView>
        })

    }
    render() {

        return <SPage title={"Tareas del dia"}  onRefresh={(e)=>{
            this.componentDidMount();
        }}>
            <SHr />
            <SText bold fontSize={20}>{this.date.toString("dd de MONTH de yyyy")}</SText>
            <SHr />
            <SView col={"xs-12"} flex>
                    <SList
                        
                        data={horas}
                        space={0}
                        render={this.item.bind(this)}
                    />
                    {this.renderTareas()}
            </SView>
        </SPage>
    }
}
