
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import TextArea from '../../../Components/QueryTool/TextArea';
import SIconApp from '../../../Assets/SIconApp';
import TextAreaPopup from '../../../Components/QueryTool/TextAreaPopup';
import TextAreaPopupOpenIcon from '../../../Components/QueryTool/TextAreaPopupOpenIcon';
import { color } from 'three/examples/jsm/nodes/Nodes';




const metrics = [
    {
        title: "Llamadas Fallidas",
        value: 24,
        change: "+12% vs ayer",
        icon: "crmllamadafallida",
        color: "#ff9800",
    },
    {
        title: "Llamadas Completadas",
        value: 8,
        change: "+5% hoy",
        icon: "crmllamadacompletada",
        color: "#2196f3",
    },
    {
        title: "Confirmadas",
        value: 5,
        change: "+2% hoy",
        icon: "crmllamadaconfirmada",
        color: "#4caf50",
    },
    {
        title: "Rechazadas",
        value: 3,
        change: "-1% hoy",
        icon: "crmllamadatasaconversion",
        color: "#f44336",
    },
]

export default class TarjetaVendedor extends Component {







    renderCard(metric) {
        return (
            <SView
                key={metric.title}
                col={"xs-3"}
                card
                center
                padding={8}
                margin={4}
            >
                <SView col={"xs-12"} row>
                    <SView col={"xs-8"}>
                        <SText fontSize={14} color='#666'>{metric.title}</SText>
                        <SText fontSize={32} bold>{metric.value}</SText>
                        <SText fontSize={10} color={metric.color}>{metric.change}</SText>
                    </SView>
                    <SView col={"xs-4"} center>
                        <SIconApp name={metric.icon} width={30} stroke={metric.color} />
                    </SView>
                </SView>
            </SView>
        )
    }

    render() {

        const porcentaje = (80 / 100) * 100;

        const precccioiosido = JSON.stringify(this.props.data);

        console.log("mirada ",precccioiosido)

        return (
            <SView col={"xs-12"} row>
                {/* <SView col={"xs-12"} row flexWrap justifyContent='space-between'> */}
                <SView col={"xs-12"} row>
                    {metrics.map(this.renderCard)}
                </SView>
                <SHr height={30} />
                <SView col={"xs-12"} card center padding={16}>


                    <SText fontSize={18} bold>Progreso del Día</SText>
                    <SText fontSize={14} color='#555'>Meta diaria: 20 llamadas</SText>


                    <SHr height={8} />

                    <SView col={"xs-12"} height={10} style={{
                        backgroundColor: "#f3f4f6",
                        borderRadius: 100,
                        overflow: 'hidden',
                    }}>
                        <SView
                            height
                            width={`${porcentaje}%`}
                            style={{
                                backgroundColor: "#3b82f6",
                                borderRadius: 100,
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </SView>

                    <SHr height={8} />

                    <SText fontSize={14}>Completadas: 8</SText>
                </SView>
            </SView>
        )
    }
}