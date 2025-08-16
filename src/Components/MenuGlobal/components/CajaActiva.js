import React, { Component } from 'react';
import { SDate, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';

export default class CajaActiva extends Component {
    constructor(props) {
        super(props);
        this.state = {
            caja: MDL.caja.activa
        };
    }

    run = false;
    componentDidMount() {
        MDL.caja.addEventListener("onChangeActiva", this.onChangeActiva);
        this.run = true;
        this.hilo();
    }

    onChangeActiva = (evt) => {
        this.setState({ caja: MDL.caja.activa });
    }

    hilo() {
        if (!this.run) return;
        setInterval(() => {
            if (!this.run) return;
            this.setState({ caja: MDL.caja.activa });
            this.hilo();
        }, 1000);
    }
    componentWillUnmount() {
        this.run = false;
        MDL.caja.removeEventListener(this.onChangeActiva);
    }

    tiempoRelativo(millis) {
        let segundos = Math.floor(millis / 1000);
        let dias = Math.floor(segundos / 86400); // 24*60*60
        segundos %= 86400;
        let horas = Math.floor(segundos / 3600);
        segundos %= 3600;
        let minutos = Math.floor(segundos / 60);
        segundos %= 60;

        let partes = [];
        if (dias > 0) partes.push(dias + "d");
        if (horas > 0) partes.push(horas + "h");
        if (minutos > 0) partes.push(minutos + "m");
        if (segundos > 0) partes.push(segundos + "s");

        return partes.join(" ");
    }


    render() {

        let diff = 0;
        if (this.state.caja) {
            const date = new SDate(this.state.caja.fecha_on, "yyyy-MM-ddThh:mm:ss");
            const now = new SDate();
            diff = date.diffTime(now)
        }

        // const difMin = new SDate("00:00:00", "hh:mm:ss");

        // difMin.addMillisecond(diff);
        // hh:mm:


        return <SView style={{
            padding: 2,
            backgroundColor: this.state.caja ? STheme.color.success : STheme.color.gray,
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center"
        }}>
            {/* <SText fontSize={8} bold>{this.state.caja ? "En Curso" : "Cerrada"}</SText> */}
            <SText fontSize={8} bold>{this.state.caja ? this.tiempoRelativo(diff) : "Cerrada"}</SText>
        </SView>
    }
}
