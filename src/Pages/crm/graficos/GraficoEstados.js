import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SCharts from 'servisofts-charts';
import { SHr, SText, STheme, SView } from 'servisofts-component';

const c_primary = "transparent";
const c_secondary = "transparent";
const c_tertiary = "transparent";
const c_quaternary = "yellow";

const c_stile = {
    backgroundColor: STheme.color.card,
    borderColor: STheme.color.lightGray + "44",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
}

const c_stile_texto_tabla = {
    fontSize: 12,
    color: STheme.color.text,
    // textAlign: "center",
}


export default class GraficoEstados extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { data } = this.state;
        const atiempo = 10
        const fueraDeTiempo = 20
        const pendientesDeEntrega = 30

        const total = atiempo + fueraDeTiempo + pendientesDeEntrega;
        return <SView col={"xs-12"} row center style={{ width: 200}}>
            <SView col={"xs-12"} height={40} center>
                <SText style={{ ...c_stile_texto_tabla, fontSize: 16 }} center>Estado Entregas</SText>
            </SView>
            <SHr height={8} />

            <SView col={"xs-12"} center >
                {/* <SImage src={require('../Assets/img/img1.png')} width={"100%"} /> */}
                <SView width={120} height={120} >
                    <SCharts
                        type="Pie"
                        padding={0.6}
                        space={0}
                        colors={["#949494", "#FF0000", "#00B050"]}
                        showValue
                        textColor={STheme.color.text}
                        startAngle={25}
                        data={{
                            "pendientes": pendientesDeEntrega || 0,
                            "fuera_tiempo": fueraDeTiempo || 0,
                            "a_tiempo": atiempo || 0,
                        }}

                        interval_prop={[
                            {
                                fill: "#949494",
                                // strokeWidth: 0,
                            },
                            {
                                fill: "#FF0000",
                                // strokeWidth: 0,
                            },
                            {
                                fill: "#00B050",
                                // strokeWidth: 0
                            }
                        ]}
                    />
                </SView>
                <SView col={"xs-12"} style={{ position: "absolute" }} center  >
                    <SText fontSize={20} >{total.toFixed(0)}</SText>
                </SView>
            </SView>



            <SHr height={8} />
            <SView col={"xs-12"} height style={{
                // paddingStart: 24
                paddingLeft: 10
            }}  >
                <SView col={"xs-12"} row center>
                    <SView width={10} height={10} style={{ borderRadius: 1 }} backgroundColor='#00B050' />
                    <SView width={4} />
                    <SView flex>
                        <SText style={c_stile_texto_tabla}>A tiempo</SText>
                    </SView>
                </SView>
                <SView col={"xs-12"} row center>
                    <SView width={10} height={10} style={{ borderRadius: 1 }} backgroundColor='#FF0000' />
                    <SView width={4} />
                    <SView flex>
                        <SText style={c_stile_texto_tabla}>Fuera Tiempo</SText>
                    </SView>
                </SView>
                <SView col={"xs-12"} row center>
                    <SView width={10} height={10} style={{ borderRadius: 1 }} backgroundColor='#949494' />
                    <SView width={4} />
                    <SView flex>
                        <SText style={c_stile_texto_tabla}>Pendientes Entrega</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }

}
