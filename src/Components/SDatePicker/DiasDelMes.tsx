import React from "react";
import { SDate, SHr, SText, SView } from "servisofts-component";


const SemanasDelMes = ["Primera", "Segunda", "Tercera", "Cuarta", "Quinta", "Secta"]
const DiasDeLaSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
const config = {
    fontScale: 18,
}
const Colors = {
    border: "#66666666",
    text: "#fff",
    textGray: "#666",
}
const Dia = ({ y, x, date, state }: { y: any, x: any, date: SDate, state: any }) => {
    const isCurMonth = date.getMonth() == state.mes;
    const isToday = date.isCurDate()
    return <SView flex style={{
        borderColor: Colors.border,
        borderWidth: 1,
        alignItems: "end",
        // justifyContent: "center",
    }} >
        <SView style={{
            width: config.fontScale * 2,
            height: config.fontScale * 2,
            backgroundColor: isToday ? "#f00" : "",
            borderRadius: config.fontScale * 2
        }} center>
            <SText fontSize={config.fontScale} color={isCurMonth ? Colors.text : Colors.textGray} >{`${date.getDay()}`}</SText>
        </SView>

        {/* <SText fontSize={config.fontScale} color={isCurMonth ? Colors.text : Colors.textGray} >{` ${date.toString("yyyy-MM-dd")} `}</SText> */}
    </SView>
}
const Semana = ({ y, firstDayOfWeek, state }) => {
    const date = firstDayOfWeek.clone();
    date.addDay(-1)
    return <SView col={"xs-12"} row flex >
        {DiasDeLaSemana.map((a, i) => {
            date.addDay(1);
            return <Dia y={y} x={i} date={date.clone()} state={state} />
        })}
    </SView>
}
const Header = ({ }) => {
    return <SView col={"xs-12"} row  >
        {DiasDeLaSemana.map((a, i) => <SView flex style={{
            alignItems: "end",
            padding: 4
        }}>
            <SText fontSize={config.fontScale}>{a}</SText>
        </SView>)}
    </SView>
}

export default class DiasDelMes extends React.Component {
    state = {
        ano: 2024,
        mes: 2
    }
    render() {
        let date = new SDate(this.state.ano + "-01-01", "yyyy-MM-dd");
        date.addMonth(this.state.mes - 1);
        let curdate = date.clone();
        date = date.getFirstDayOfWeek()
        date.addDay(-7)

        return < SView flex >
            <SView height={"100%"}>
                <SView row>
                    <SText fontSize={config.fontScale * 1.8} bold>{curdate.toString("MONTH yyyy")}</SText>
                    <SView flex />
                    <SView row>
                        <SText card center fontSize={config.fontScale * 1.8} onPress={() => {
                            curdate.addMonth(-1);
                            this.setState({ mes: curdate.getMonth(), ano: curdate.getYear() })
                        }} >{" < "}</SText>
                        <SView width={4} />
                        <SText center card fontSize={config.fontScale * 1.4} onPress={() => {
                            curdate = new SDate();
                            this.setState({ mes: curdate.getMonth(), ano: curdate.getYear() })
                        }} >{" Hoy "}</SText>
                        <SView width={4} />
                        <SText card center fontSize={config.fontScale * 1.8} onPress={() => {
                            curdate.addMonth(1);
                            this.setState({ mes: curdate.getMonth(), ano: curdate.getYear() })
                        }} >{" > "}</SText>
                    </SView>
                </SView>

                <Header />
                {SemanasDelMes.map((a, i) => {
                    date.addDay(7)
                    return <Semana y={i} firstDayOfWeek={date.getFirstDayOfWeek().clone()} state={this.state} />
                })}
            </SView>
        </SView >
    }
}