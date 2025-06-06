import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SCharts from 'servisofts-charts';
import { Container } from '../../../Components';
import Model from '../../../Model';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        const query = `SELECT jsonb_object_agg(sq1.key, sq1.value) as json
        FROM (
            select cliente_proyecto.state  as key,
            count(cliente_proyecto.state) as value 
            from cliente_proyecto JOIN proyecto
            on cliente_proyecto.key_proyecto = proyecto.key
            where proyecto.key_empresa = '${Model.empresa.Action.getKey()}'
            and proyecto.estado > 0 
            AND cliente_proyecto.estado > 0
            group by cliente_proyecto.state
        ) sq1
        `;
        MDL.crm.db.ejecutarConsultaObject(query).then(e => {
            console.log("Consulta ejecutada:", e);
            this.setState({ result: e })
            SNotification.send({
                title: "Succes",
                body: "Resultados: " + Object.keys(e).length,
                color: STheme.color.success,
                time: 5000,
            })
        }).catch(e => {
            SNotification.send({
                title: "Error",
                body: e.error,
                color: STheme.color.danger,
                time: 5000,
            })
            console.error("Error ejecutando consulta:", e);
        })
    }
    render() {
        const colors = Object.keys(this?.state?.result ?? {}).map((key, index) => MDL.crm.clienteProyecto?.STATES[key]?.color);
        const IntervalProps = Object.keys(this?.state?.result ?? {}).map((key, index) => {
            return {
                fill: MDL.crm.clienteProyecto?.STATES[key]?.color,
                stroke: "#000000",

            }
        });
        if (!this.state.result) return <SPage><SView center><SText>Loading...</SText></SView></SPage>;
        return <SPage>
            {/* <SText>{JSON.stringify(this.state?.result, "\n", "\t")}</SText> */}
            <SView style={{
                width: 300, height: 300,
            }}>
                <SCharts
                    type='Donut_gauge'
                    data={this.state.result}
                    colors={colors}
                    textColor={STheme.color.text}
                    showLabel
                    showValue
                // showGuide

                />
            </SView>
            <SView style={{
                width: "100%", height: 300,
            }}  >
                <SCharts
                    type='Column'
                    interval_prop={IntervalProps}
                    strokeWidth={1}
                    // borderColors={colors}
                    space={0}
                    padding={0.4}
                    data={this.state.result}
                    colors={colors}
                    textColor={STheme.color.text}
                    showLabel
                    showValue
                // showGuide

                />
            </SView>
        </SPage>
    }
}
