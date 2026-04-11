import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SPage } from 'servisofts-component';

// #region Sample data
const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];
// #endregion

export default function Example() {
    return (
        <SPage disableScroll>
            <div style={{ width: '100%', height: "100%" }}>
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
                        <XAxis dataKey="name" stroke="#ffffff" />
                        <YAxis width={100} stroke="#ffffff" />
                        <Tooltip
                            cursor={{
                                stroke: '#ff0000',
                            }}
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                borderColor: '#ff0000',
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
                        />
                        <Line
                            type="monotone"
                            dataKey="uv"
                            stroke="#ff0000"
                            dot={{
                                fill: '#ff0000',
                            }}
                            activeDot={{ stroke: '#ff0000' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </SPage>
    );
}