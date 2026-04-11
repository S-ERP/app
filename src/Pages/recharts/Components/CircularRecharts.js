import React, { Component } from "react";
import { PieChart, Pie, Sector, ResponsiveContainer, Cell, TooltipIndex, Tooltip } from "recharts";
import { SText } from "servisofts-component";


// #region Sample data
const data = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 },
];
// #endregion

const RADIAN = Math.PI / 180;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default class CircularRecharts extends Component {

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
        const { isAnimationActive = true } = this.props;
        const defaultIndex = TooltipIndex;

        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        labelLine={false}
                        label={this.renderCustomizedLabel}
                        isAnimationActive={isAnimationActive}
                    // shape={this.MyCustomPie}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip  defaultIndex={defaultIndex} />
                </PieChart>
            </ResponsiveContainer>
        );
    }
}