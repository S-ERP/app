import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import ListaCuotas from '../ListaCuotas';


const info = {
    key: "pp_financiero",
    label: "P.P. Financiero"
}

const PERIODICIDAD_DATA = {
    "day": {
        label: "Día", label_plural: "días", add: (date, i) => {
            date.addDay(i)
            return date;
        }
    },
    "month": {
        label: "Mes", label_plural: "meses", add: (date, i) => {
            date.addMonth(i)
            return date;
        }
    },
    "year": {
        label: "Año", label_plural: "años", add: (date, i) => {
            date.addMonth(i * 12)
            return date;
        }
    }
}
class ComponentOpciones extends Component {
    constructor(props) {
        super(props);
        var numero_cuotas = 2;
        var cuota_inicial = 0
        if (props.cuotas) {
            numero_cuotas = Object.values(props.cuotas).length - 1
            if (numero_cuotas <= 0) numero_cuotas = 2;
            var cuota_in = Object.values(props.cuotas).find(o => o.codigo == "0");
            if (!cuota_in) cuota_in = {}
            cuota_inicial = cuota_in?.monto ?? 0;
        }
        this.state = {
            tipo_pago: info.key,
            numero_cuotas: numero_cuotas,
            fecha_inicio: props.data?.fecha_inicio ?? new SDate().toString("yyyy-MM-dd"),
            periodicidad_medida: props.data?.periodicidad_medida ?? "month",
            periodicidad_valor: props.data?.periodicidad_valor ?? 1,
            porcentaje_interes: props.data?.porcentaje_interes ?? 3,
            cuota_inicial: cuota_inicial,
        };
    }

    getCuotas() {
        return {
            info: { ...this.state },
            arr: this.cuotas
        }
    }
    editor() {
        if (this.props.disabled) return null;
        return <SView col={"xs-12"} center>
            <SView col={"xs-12"} row center>
                <SView width={130}>
                    <SInput ref={ref => this.inp_cant_cuotas = ref} type={"number"}
                        icon={<SText color={STheme.color.lightGray}>#</SText>}
                        style={{ textAlign: "center", paddingRight: 8, }} label={"Cuantas cuotas?"}
                        defaultValue={this.state.numero_cuotas}
                        onChangeText={(val) => {
                            if (!val) {
                                this.setState({ numero_cuotas: 1 })
                            } else {
                                this.setState({ numero_cuotas: val })
                            }
                        }}
                    />
                </SView>
                <SView flex />

                <SView width={130}>
                    <SInput ref={ref => this.inp_fecha = ref} type={"date"} style={{ textAlign: "center" }} iconR={<SView width={8} />} label={"Fecha del primer pago"} defaultValue={this.state.fecha_inicio}
                        onChangeText={(val) => {
                            this.setState({ fecha_aux: val })
                        }} />
                </SView>
            </SView>
            <SView col={"xs-12"} row center>
                <SView width={130}>
                    <SInput ref={ref => this.inp_periodicidad_medida = ref}
                        type={"select"}
                        options={[
                            ...Object.keys(PERIODICIDAD_DATA).map(k => { return { key: k, content: PERIODICIDAD_DATA[k].label } })
                        ]}
                        icon={<SText color={STheme.color.lightGray}>{" "}</SText>}
                        style={{ textAlign: "center", paddingRight: 8, }}
                        label={"Periodicidad"}
                        defaultValue={this.state.periodicidad_medida}
                        onChangeText={(val) => {
                            this.setState({ periodicidad_medida: val })
                        }}
                    />
                </SView>
                <SView flex />
                <SView width={130}>
                    <SInput ref={ref => this.inp_periodicidad_valor = ref} type={"number"}
                        style={{ textAlign: "center", paddingRight: 8, }}
                        icon={<SText color={STheme.color.lightGray}> </SText>}
                        label={"Cada cuantos " + PERIODICIDAD_DATA[this.state.periodicidad_medida]?.label_plural + "?"}
                        defaultValue={this.state.periodicidad_valor}
                        onChangeText={(val) => {
                            this.setState({ periodicidad_valor: val })
                        }}
                    />
                </SView>
            </SView>
            <SView row col={"xs-12"} center>
                <SView width={130}>
                    <SInput ref={ref => this.porcentaje_interes = ref} type={"number"}
                        style={{ textAlign: "center", paddingRight: 8, }}
                        label={"Porcentaje de interes"}
                        defaultValue={this.state.porcentaje_interes}
                        icon={<SText color={STheme.color.lightGray}>%</SText>}
                        onChangeText={(val) => {
                            this.setState({ porcentaje_interes: val })
                        }}
                    />
                </SView>
                <SView flex />
                {/* {this.getPMT()} */}
            </SView>
            <SView row col={"xs-12"} center>
                <SView width={130}>
                    <SInput ref={ref => this.cuota_inicial = ref} type={"money"}
                        style={{ textAlign: "center", paddingRight: 8, }}
                        label={"Cuota inicial"}
                        defaultValue={parseFloat(this.state.cuota_inicial ?? 0).toFixed(2)}
                        icon={<SText color={STheme.color.lightGray}>$</SText>}
                        onChangeText={(val) => {
                            if (!val) {
                                this.setState({ cuota_inicial: 0 })
                                return;
                            }
                            this.setState({ cuota_inicial: parseFloat(val ?? 0) })
                        }}
                    />
                </SView>
                <SView flex />
            </SView>
            <SHr />
        </SView>
    }
    render() {
        this.cuotas = calcular_cuotas({
            data: this.props.data,
            totales: this.props.totales,
            ...this.state
        });
        return <SView col={"xs-12"} >
            {this.editor()}
            <SHr />
            <ListaCuotas data={this.state}cuotas={this.cuotas} totales={this.props.totales} />
        </SView>
    }
}
const PMT = (ir, np, pv, fv, type) => {
    /*
     * ir   - interest rate per month
     * np   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    var pmt, pvif;

    fv || (fv = 0);
    type || (type = 0);

    if (ir === 0)
        return -(pv + fv) / np;

    pvif = Math.pow(1 + ir, np);
    pmt = - ir * (pv * pvif + fv) / (pvif - 1);

    if (type === 1)
        pmt /= (1 + ir);

    return pmt;
}
const calcular_cuotas = ({ data, totales, numero_cuotas, fecha_inicio, periodicidad_medida, periodicidad_valor, porcentaje_interes, cuota_inicial }) => {
    var total_pagar = totales.subtotal;
    var cuotas = []
    cuotas.push({
        codigo: 0,
        descripcion: "Inicial",
        monto: cuota_inicial,
        fecha: new SDate().toString("yyyy-MM-dd")
    })

    var total_al_credito = total_pagar - cuota_inicial;
    var pmt = -PMT(porcentaje_interes / 100, numero_cuotas, total_al_credito, 0, 0)
    for (let i = 0; i < numero_cuotas; i++) {
        let initDate = new SDate(fecha_inicio, "yyyy-MM-dd");
        var pdata = PERIODICIDAD_DATA[periodicidad_medida];
        if (pdata.add) {
            var d = (i + 1) * periodicidad_valor
            initDate = pdata.add(initDate, d)
        }

        var cuota = {
            codigo: i + 1,
            descripcion: "Cuota",
            monto: pmt,
            fecha: initDate.toString("yyyy-MM-dd")
        }
        cuotas.push(cuota);

    }
    return cuotas;
}

export default {
    info,
    ComponentOpciones,
    calcular_cuotas
}