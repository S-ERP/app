import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SOrdenador, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Components from '../../../../Components';
import Model from '../../../../Model';
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
export default class PlanPagos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            cuota_inicial: 0,
        };
    }
    componentDidMount() {


    }
    getCuotasArray() {
        return this.state.cuotas
    }
    data = {}
    totales_item({
        codigo,
        descripcion,
        monto,
        fecha,
        interes,
        capital,
        saldo_capital,
        pagos_acumulados
    }) {
        return <SView col={"xs-12"} row>
            <SView flex>
                <SText bold flex fontSize={14}># {codigo} - {descripcion}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >{new SDate(fecha, "yyyy-MM-dd").toString("dd de MONTH, yyyy")}</SText>
            </SView>
            <SView width={8} />
            <SText style={{ alignItems: 'end', textAlign: "end" }} fontSize={14}>{SMath.formatMoney(monto)}</SText>
            <SHr />
            <SView col={"xs-12"}>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Capital: {capital ?? 0}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Interes: {interes ?? 0}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Saldo capital: {saldo_capital ?? 0}</SText>
                <SText flex fontSize={10} color={STheme.color.lightGray} >Pagos acumulados: {pagos_acumulados ?? 0}</SText>
            </SView>
            <SHr />
            <SHr height={1} color={STheme.color.card} />
        </SView>
    }

    getCuotas() {
        if (this.state.loading) return <SLoad />
        var interes = parseFloat(this.data.porcentaje_interes);
        var capital_amortizado = 0;

        var saldo_capital = this.state.totales.subtotal;
        // var cuotas_con_capital = []
        var pagos_acumulados = 0;
        this.state.cuotas.map((cuota, i) => {
            cuota.monto_interes = (saldo_capital * (interes / 100));
            cuota.monto_capital = parseFloat(cuota.monto) - cuota.monto_interes;
            saldo_capital = saldo_capital - cuota.monto_capital;
            cuota.saldo_capital = saldo_capital;
            pagos_acumulados += parseFloat(cuota.monto);
            cuota.pagos_acumulados = pagos_acumulados;
        })

        return <SList
            data={this.state.cuotas}
            render={(data, key, i) => {
                var saldo_capital = this.state.totales.subtotal;

                // capital_amortizado += capital;
                // saldo_capital -= capital;
                return this.totales_item({
                    codigo: data.codigo,
                    descripcion: data.descripcion,
                    monto: data.monto,
                    fecha: data.fecha,
                    interes: SMath.formatMoney(data.monto_interes),
                    capital: SMath.formatMoney(data.monto_capital),
                    saldo_capital: SMath.formatMoney(data.saldo_capital),
                    pagos_acumulados: SMath.formatMoney(data.pagos_acumulados)
                })
            }}
        />
    }

    calcularCuotas(numero_cuotas = 1, fecha_inicio = new SDate().toString("yyyy-MM-dd")) {
        this.state.fecha_inicio = "";
        this.state.numero_cuotas = ""
        this.state.cant_aux = ""
        this.state.fecha_aux = ""
        if (this.inp_cant_cuotas) {
            numero_cuotas = this.inp_cant_cuotas.getValue();
        }
        if (this.inp_fecha) {
            fecha_inicio = this.inp_fecha.getValue();
        }

        var pm = this.state.periodicidad_medida
        var pv = parseFloat(this.state.periodicidad_valor)
        var porcentaje_interes = this.state.porcentaje_interes

        var cuotas_arr = []
        var monto_cuota_inicial = this.state.cuota_inicial ?? this.state.totales.subtotal
        cuotas_arr.push({
            codigo: 0,
            descripcion: "Inicial",
            // monto: (this.state.totales.subtotal / (numero_cuotas ?? 1)),  //Se comento cuando se agrego el pmt
            monto: monto_cuota_inicial,
            fecha: new SDate(fecha_inicio, "yyyy-MM-dd").toString("yyyy-MM-dd")
        })
        var total_al_credito = this.state.totales.subtotal - this.state.cuota_inicial;
        var PMT = -this.PMT(porcentaje_interes / 100, numero_cuotas, total_al_credito, 0, 0)
        console.log("Numero de cuotas", numero_cuotas);
        numero_cuotas = parseInt(numero_cuotas ?? 0) - 1
        if (numero_cuotas >= 0) {

            new Array(numero_cuotas + 1).fill(0).map((obj, i) => {
                let initDate = new SDate(fecha_inicio, "yyyy-MM-dd");
                // if (i != 0) {
                var pdata = PERIODICIDAD_DATA[pm];
                if (pdata.add) {
                    var d = (i + 1) * pv
                    initDate = pdata.add(initDate, d)
                }
                // initDate.addMonth(i)
                // }
                var cuota = {
                    codigo: i + 1,
                    descripcion: "Cuota",
                    // monto: (this.state.totales.subtotal / (numero_cuotas ?? 1)),  //Se comento cuando se agrego el pmt
                    monto: PMT,
                    fecha: initDate.toString("yyyy-MM-dd")
                }
                cuotas_arr.push(cuota);
            })
        }

        this.state.cuotas = null
        this.state.fecha_inicio = "";
        this.state.numero_cuotas = 0;
        this.state.cuota_inicial = monto_cuota_inicial
        // this.state.porcentaje_interes = 0;
        this.state.loading = true;


        this.setState({ ...this.state })
        Model.cuota.Action.registroAll({
            key_compra_venta: this.data.key,
            periodicidad_medida: this.state.periodicidad_medida,
            periodicidad_valor: this.state.periodicidad_valor,
            key_usuario: Model.usuario.Action.getKey(),
            porcentaje_interes: porcentaje_interes,
            data: cuotas_arr
        }).then((e) => {
            this.setState({ loading: false })
        }).catch((e) => {
            this.setState({ loading: false })
        })
        // Model.compra_venta.Action.changeState({ data: this.data, state: "cotizacion" })
    }

    getRecalcular() {
        var isChange = false;
        if (this.state.cant_aux) {
            if (parseInt(this.state.cant_aux) != parseInt(this.state.numero_cuotas)) {
                isChange = true;
            }
        }
        if (this.state.fecha_aux) {
            if (this.state.fecha_aux != this.state.fecha_inicio) {
                isChange = true;
            }
        }
        if (this.data.periodicidad_medida != this.state.periodicidad_medida) {
            isChange = true;

        }
        if ((this.data.periodicidad_valor ?? 0) != (this.state.periodicidad_valor ?? 0)) {
            isChange = true;
        }
        if (this.data.porcentaje_interes != this.state.porcentaje_interes) {
            isChange = true;
        }

        if (this.state.cuotas) {
            if (this.state.cuotas[0]?.monto != this.state.cuota_inicial) {
                console.log(this.state.cuotas[0]?.monto)
                isChange = true;
            }
        }
        if (!isChange) return null;
        return <SView card style={{ padding: 16 }} onPress={() => {
            this.calcularCuotas();
        }}>
            <SText bold color={STheme.color.danger}>RECALCULAR</SText>
        </SView>

    }
    editor() {
        if (this.props.disabled) return null;


        // this._cuotas_data = cuotas;
        return <SView col={"xs-12"} center>
            <SView col={"xs-12"} row center>
                <SView width={130}>
                    <SInput ref={ref => this.inp_cant_cuotas = ref} type={"number"}
                        icon={<SText color={STheme.color.lightGray}>#</SText>}
                        style={{ textAlign: "center", paddingRight: 8, }} label={"Cuantas cuotas?"}
                        defaultValue={this.state.numero_cuotas}
                        onChangeText={(val) => {
                            this.setState({ cant_aux: val })
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
                {this.getPMT()}
            </SView>
            <SView row col={"xs-12"} center>
                <SView width={130}>
                    <SInput ref={ref => this.cuota_inicial = ref} type={"money"}
                        style={{ textAlign: "center", paddingRight: 8, }}
                        label={"Cuota inicial"}
                        defaultValue={parseFloat(this.state.cuota_inicial ?? 0).toFixed(2)}
                        icon={<SText color={STheme.color.lightGray}>$</SText>}
                        onChangeText={(val) => {
                            this.setState({ cuota_inicial: parseFloat(val ?? 0) })
                        }}
                    />
                </SView>
                <SView flex />
            </SView>
            <SHr />
            {this.getRecalcular()}
            <SHr />
            <SView col={"xs-12"}>
            </SView>
            <Components.compra_venta.Separador data={this.data} />
            {/* <SText>{this.state.numero_cuotas}</SText> */}
            {/* {this.getCuotas()} */}
            <SHr />
        </SView>
    }
    PMT(ir, np, pv, fv, type) {
        /*
         * ir   - interest rate per month
         * np   - number of periods (months)
         * pv   - present value
         * fv   - future value
         * type - when the payments are due:
         *        0: end of the period, e.g. end of month (default)
         *        1: beginning of period
         */
        // console.log(ir, np, pv, fv, type)
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
    getPMT() {
        var PMT = -this.PMT(this.state.porcentaje_interes / 100, this.state.numero_cuotas, this.state.totales.subtotal - (this.state.cuota_inicial ?? 0), 0, 0)
        if (!PMT) {
            PMT = this.state.cuota_inicial;
        }
        return <SView center height width={130}>
            <SHr height={30} />
            <SText fontSize={16} bold >Bs. {SMath.formatMoney(PMT)}</SText>
        </SView>
    }
    render() {
        this.data = this.props.data;

        var t = Model.compra_venta_detalle.Action.getTotales({
            key_compra_venta: this.data.key
        })


        var cuotas = Model.cuota.Action.getAllByKeyCompraVenta({
            key_compra_venta: this.data.key
        })
        if (!t) return null;
        if (!cuotas) {
            this.state.cuotas = null;
            return null;
        }

        this.state.totales = t;

        if (!this.state.periodicidad_valor) {
            this.state.periodicidad_valor = this.data.periodicidad_valor ?? 1;
        }
        if (!this.state.periodicidad_medida) {
            this.state.periodicidad_medida = this.data.periodicidad_medida ?? "month";
        }
        if (!this.state.porcentaje_interes) {
            this.state.porcentaje_interes = this.data.porcentaje_interes ?? 0;
        }
        if (!this.state.porcentaje_interes) {
            this.state.porcentaje_interes = this.data.porcentaje_interes ?? 0;
        }


        if (!this.state.cuotas) {
            var arr = new SOrdenador([{ key: "codigo", type: "number", order: "asc", peso: 1 }]).ordernarObjetoToLista(cuotas);
            this.state.cuotas = arr
            this.state.numero_cuotas = this.state.cuotas.length - 1
            if (this.state.numero_cuotas > 0) {
                this.state.fecha_inicio = new SDate(this.state.cuotas[0].fecha).toString("yyyy-MM-dd")
            }



            if (!this.state.numero_cuotas) {
                this.state.numero_cuotas = 0
            }
            if (this.state.loading) {
                return <SLoad />
            }
            if (this.state.cuotas) {
                if (this.state.cuotas.length == 0) {
                    this.state.cuota_inicial = this.state.totales.subtotal
                    this.calcularCuotas()
                } else {
                    var total = 0;
                    this.state.cuotas.map((obj) => {
                        total += parseFloat(obj.monto);
                    })
                    if (!this.state.cuota_inicial) {
                        this.state.cuota_inicial = this.state.cuotas[0].monto
                    }
                    // if (parseFloat(total) >= parseFloat(t.total_a_pagar)) {
                    // this.calcularCuotas(this.state.numero_cuotas, this.state.fecha_inicio)
                    // }
                }
            }

        }


        return <SView col={"xs-12"} center>

            {this.editor()}
            {this.getCuotas()}
        </SView>
    }
}
