import React, { Component } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { SText, STheme, SView } from "servisofts-component";

const defaultData = [
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

export default class BarraRechartsBd extends Component {

  getIntroOfPage(label) {
    switch (label) {
      case "Page A": return "Page A is about men's clothing";
      case "Page B": return "Page B is about women's dress";
      case "Page C": return "Page C is about women's bag";
      case "Page D": return "Page D is about household goods";
      case "Page E": return "Page E is about food";
      case "Page F": return "Page F is about baby food";
      default: return "";
    }
  }

  CustomTooltip = ({ active, payload, label }) => {
    const isVisible = active && payload && payload.length;
    console.log("payload en CustomTooltip:", payload);
    return (
      <SView style={{
        visibility: isVisible ? "visible" : "hidden",
        backgroundColor: STheme.color.background,
        padding: 10,
        borderRadius: 4,
      }}>
        {isVisible && (
          <>
            <SText>{`${label} : ${payload[0].value}`}</SText>
            <SText>{this.getIntroOfPage(label)}</SText>
            <SText>{`Total: ${payload[0] ? payload[0]?.payload?.total : 0}`}</SText>
          </>
        )}
      </SView>
    );
  };

  render() {
    const {
      data = defaultData,
      nameKey = "name",
      valueKey = "pv",
      valueKey2 = "uv",
      height = 300,
    } = this.props;

    if (!Array.isArray(data) || data.length === 0) {
      return <SText>No hay datos disponibles para mostrar el gráfico.</SText>;
    }
    console.log("Data recibida en BarraRechartsBd:", data);
    return (
      <SView style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={300}
            height={300}
            data={data}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} fontSize={10} tick={{ fill: STheme.color.text }} />
            <YAxis tick={{ fill: STheme.color.text }} />
            <Tooltip content={this.CustomTooltip} />
            <Legend />
            <Bar dataKey={valueKey} fill={STheme.color.warning} barSize={30}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    [
                      "#FF6B6B95",
                      "#4ECDC495",
                      "#45B7D195",
                      "#FFA07A95",
                      "#98D8C895",
                      "#F7DC6F95",
                      "#BB8FCE95"
                    ][index % 7]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SView>
    );
  }
}