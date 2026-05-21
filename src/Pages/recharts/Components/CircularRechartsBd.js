import React, { Component } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { SText, SView } from "servisofts-component";

const defaultData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 },
];

const RADIAN = Math.PI / 180;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6B6B", "#4ECDC4"];

export default class CircularRechartsBd extends Component {

    renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
            return null;
        }

        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-(midAngle || 0) * RADIAN);
        const y = cy + radius * Math.sin(-(midAngle || 0) * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${((percent || 0) * 100).toFixed(0)}%`}
            </text>
        );
    };

    MyCustomPie = (props) => {
        return <Sector {...props} fill={COLORS[props.index % COLORS.length]} />;
    };

    render() {
        const {
            data = defaultData,
            nameKey = "name",
            valueKey = "value",
            height = 300,
            isAnimationActive = true,
        } = this.props;

        if (!Array.isArray(data) || data.length === 0) {
            return <SText>No hay datos disponibles para mostrar el gráfico.</SText>;
        }

        return (
            <SView style={{ width: "100%", height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey={valueKey}
                            nameKey={nameKey}
                            labelLine={false}
                            label={this.renderCustomizedLabel}
                            isAnimationActive={isAnimationActive}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </SView>
        );
    }
}