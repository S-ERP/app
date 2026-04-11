import React, { Component } from "react";
import { SHr, SInput, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../MDL";

import { ScrollView } from "react-native";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';



// #region Sample data
const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        ov: 3500,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        ov: 2800,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        ov: 7500,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        ov: 500,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        ov: 8500,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        ov: 1100,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        ov: 9200,
        amt: 2100,
    },
];
// #endregion



export default class LineaRecharts extends Component {


    constructor(props) {
        super(props);
        isAnimationActive = true;
    }

    render() {
        return (
            <SView col={"xs-12"} row >
                <SView col={"xs-6"} flex >
                    <SView style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%" style={{
                            // paddingRight: 40,
                        }}>
                            <LineChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
                                <XAxis dataKey="name" stroke="#ffffff" tick={{ fill: STheme.color.text }} />
                                <YAxis width={100} stroke="#ffffff" />
                                <Tooltip
                                    cursor={{
                                        stroke: '#ff0000',
                                    }}
                                    contentStyle={{
                                        backgroundColor: STheme.color.background,
                                        //borderColor: '#ff0000',
                                        color: STheme.color.text,
                                        borderRadius: 4
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="pv"
                                    stroke="#ffff00"
                                    dot={{
                                        fill: '#ffff00',
                                    }}
                                    activeDot={{ r: 8, stroke: '#ffff00' }}
                                // isAnimationActive={this.props.isAnimationActive}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="uv"
                                    strokeDasharray="5 5"
                                    stroke="#ff0000"
                                    dot={{
                                        fill: '#ff0000',
                                    }}
                                    activeDot={{ stroke: '#ff0000' }}
                                />
                                <Line
                                    type="linear"
                                    dataKey="ov"
                                   strokeWidth={4}
                                    stroke={STheme.color.success}
                                    dot={{
                                        fill: STheme.color.success,
                                    }}
                                    activeDot={{ stroke: STheme.color.success }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </SView>
                </SView>
            </SView>
        );
    }
}