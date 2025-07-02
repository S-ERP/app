
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
        key: "llamada_fallida",
        title: "Llamadas Fallidas",
        icon: "crmllamadafallida",
        color: "#ff9800",
    },
    {
        key: "nuevo",
        title: "Llamadas Nuevas",
        icon: "crmllamadacompletada",
        color: "#2196f3",
    },
    {
        key: "confirmado",
        title: "Confirmadas",
        icon: "crmllamadaconfirmada",
        color: "#4caf50",
    },
    {
        key: "rellamada",
        title: "Rellamadas",
        icon: "crmllamadatasaconversion",
        color: "#f44336",
    },
];

export default class TarjetaVendedor extends Component {
    renderCard = (metric) => (
        <SView
            key={metric.key}
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
                </SView>
                <SView col={"xs-4"} center>
                    <SIconApp name={metric.icon} width={30} stroke={metric.color} />
                </SView>
            </SView>
        </SView>
    );

    render() {
        const data = this.props.data || {};
        const key_usuario = Object.keys(data)[0]; // ej: "b2aa9d81-..."
        const estados = data[key_usuario] || {};

        const dynamicMetrics = metrics.map(metric => ({
            ...metric,
            value: estados[metric.key] || 0
        }));

        const confirmadas = estados["confirmado"] || 0;
        const meta = 20;
        const porcentaje = (confirmadas / meta) * 100;

        return (
            <SView col={"xs-12"} row>
                <SView col={"xs-12"} row>
                    {dynamicMetrics.map(this.renderCard)}
                </SView>

                <SHr height={30} />

                <SView col={"xs-12"} card center padding={16}>
                    <SText fontSize={18} bold>Progreso del Día</SText>
                    <SText fontSize={14} color='#555'>Meta diaria: {meta} llamadas</SText>

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
                    <SText fontSize={14}>Confirmadas: {confirmadas}</SText>
                </SView>
            </SView>
        );
    }
}
