import React, { Component } from "react";
import { SHr, SInput, SPage, SPopup, SText, STheme, SView } from "servisofts-component";

import { ScrollView } from "react-native";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';



// #region Sample data
const defaultData = [
    {
        name: 'Page A',
        egreso: 4000,
        pv: 2400,
        ov: 3500,
        amt: 2400,
    },
    {
        name: 'Page B',
        egreso: 3000,
        pv: 1398,
        ov: 2800,
        amt: 2210,
    },
    {
        name: 'Page C',
        egreso: 2000,
        pv: 9800,
        ov: 7500,
        amt: 2290,
    },
    {
        name: 'Page D',
        egreso: 2780,
        pv: 3908,
        ov: 500,
        amt: 2000,
    },
    {
        name: 'Page E',
        egreso: 1890,
        pv: 4800,
        ov: 8500,
        amt: 2181,
    },
    {
        name: 'Page F',
        egreso: 2390,
        pv: 3800,
        ov: 1100,
        amt: 2500,
    },
    {
        name: 'Page G',
        egreso: 3490,
        pv: 4300,
        ov: 9200,
        amt: 2100,
    },
];
// #endregion



export default class LineaRechartsBd extends Component {


    constructor(props) {
        super(props);
        // isAnimationActive = true;
    }

    render() {
        const {
            data = defaultData,
            nameKey = "name",
            valueKey = "pv",
            height = 300,
        } = this.props;

        if (!Array.isArray(data) || data.length === 0) {
            return <SText>No hay datos disponibles para mostrar el gráfico.</SText>;
        }

        return (
            <SView style={{ width: "100%", height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 20,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={STheme.color.white} />
                        <XAxis dataKey={nameKey} fontSize={10} stroke={STheme.color.white} tick={{ fill: STheme.color.text }} />
                        <YAxis width={100} stroke={STheme.color.white} />
                        <Tooltip
                            cursor={{
                                stroke: '#ff0000',
                            }}
                            contentStyle={{
                                backgroundColor: STheme.color.background,
                                color: STheme.color.text,
                                borderRadius: 4
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey={valueKey}
                            stroke={STheme.color.warning}
                            strokeWidth={2}
                            dot={{
                                fill: STheme.color.warning,
                            }}
                            activeDot={{ r: 8, stroke: STheme.color.warning }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </SView>
        );
    }
}