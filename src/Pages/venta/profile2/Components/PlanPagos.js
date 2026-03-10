import React, { Component } from 'react';
import { SDate, SHr, SImage, SInput, SList, SLoad, SMath, SNavigation, SNotification, SOrdenador, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Components from '../../../../Components';
import Model from '../../../../Model';
import MDL from '../../../../MDL';
import { err } from 'react-native-svg';
import SIconApp from '../../../../Assets/SIconApp';
import PopupCuota from '../../Components/PopupCuota';
const URL = "/venta/profile2";
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
            cuotas: props.data?.cuotas ?? [],
            totales: props.data?.totales ?? {},
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            cuota_inicial: 0,
            total_amortizado: 0,
            total_pagar: 0,
        };
    }
    componentDidMount() {
        this.getMonedas()

    }
    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {

            this.setState({
                cuotas: this.props.data?.cuotas ?? [],
                totales: this.props.data?.totales ?? {}
            })

        }
    }

    async getMonedas() {
        try {
            let monedas = await MDL.empresa.getMonedas();
            this.setState({ monedas: monedas });
        } catch (error) {
            console.log(error)
            // return []
        }
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
        pagos_acumulados,
        total_a_pagar,
        saldo,
        moneda,
        amortizado,
        cuota

    }) {
        // return <SView col={"xs-12"} row>
        //     <SView flex>
        //         <SText bold flex fontSize={14}># {codigo} - {descripcion}</SText>
        //         <SText flex fontSize={10} color={STheme.color.lightGray} >{new SDate(fecha, "yyyy-MM-dd").toString("dd de MONTH, yyyy")}</SText>
        //     </SView>
        //     <SView width={8} />
        //     <SText style={{ alignItems: 'end', textAlign: "end" }} fontSize={14}>{SMath.formatMoney(monto)}</SText>
        //     <SHr />
        //     <SView col={"xs-12"}>
        //         <SText flex fontSize={10} color={STheme.color.lightGray} >Capital: {isNaN(capital) ? 0 : capital}</SText>
        //         <SText flex fontSize={10} color={STheme.color.lightGray} >Interes: {isNaN(interes) ? 0 : interes}</SText>
        //         <SText flex fontSize={10} color={STheme.color.lightGray} >Saldo capital: {isNaN(saldo_capital) ? 0 : saldo_capital}</SText>
        //         <SText flex fontSize={10} color={STheme.color.lightGray} >Pagos acumulados: {pagos_acumulados ?? 0}</SText>
        //     </SView>
        //     <SHr />
        //     <SHr height={1} color={STheme.color.card} />
        // </SView>
        console.log("CUOTAS: ", cuota)
        return <SView col={"xs-12"} padding={5} row style={{
            backgroundColor: STheme.color.card,
            borderRadius: 8,
            marginBottom: 2,
            borderWidth: 1,
            borderColor: STheme.color.white + "10"
        }}>
            <SView flex col={"xs-11"}>
                <SView row justifyContent="space-between" >
                    <SView center width={20} height={20} style={{ borderRadius: 50 }} backgroundColor={monto === SMath.formatMoney(amortizado) ? STheme.color.success : STheme.color.error}>
                        <SIconApp name={monto === SMath.formatMoney(amortizado) ? "vineta1" : "alert2"} width={12} height={12} fill={STheme.color.white} />
                        {/* <SText>{monto} -- {SMath.formatMoney(amortizado)}</SText> */}
                    </SView>
                    <SView width={5} />
                    <SText bold># {codigo} - {descripcion}</SText>
                    <SText col={"xs-12"} flex style={{ alignItems: "flex-end" }}>Monto: {moneda} {(monto)}</SText>

                </SView>

                <SText color={STheme.color.lightGray} fontSize={12} style={{ paddingTop: 3 }}>
                    {new SDate(fecha, "yyyy-MM-dd").toString("dd de MONTH, yyyy")}
                </SText>

                <SView row justifyContent="space-between" style={{ paddingTop: 3 }}>
                    {/* <SText fontSize={10} color={STheme.color.lightGray}>Capital: {isNaN(capital) ? 0 : capital}</SText>
                <SView width={10} style={{ borderRightWidth: 1, borderRightColor: STheme.color.lightGray }} />
                <SView width={10} />
                <SText fontSize={10} color={STheme.color.lightGray}>Interés: {isNaN(interes) ? 0 : interes}</SText>
                <SView width={10} style={{ borderRightWidth: 1, borderRightColor: STheme.color.lightGray }} />
                <SView width={10} /> */}
                    <SText color={STheme.color.text}>Amortizado: {moneda} {isNaN(amortizado) ? 0 : SMath.formatMoney(amortizado)}</SText>
                    <SText col={"xs-12"} flex bold style={{ alignItems: "flex-end" }}>Saldo: {moneda} {(saldo)}</SText>
                </SView>
            </SView>
            <SView center row col={"xs-1"} style={{ right: -8 }} onPress={() => {
                if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'edit' })) {
                    PopupCuota.open({
                        // key_cuota: this.state.cuotas[i].key,
                        data: this.props.data,
                        editObject: cuota,
                        key_cuota: cuota.key,
                        onSuccess: (resp) => {
                            if (this.props.onReload) {
                                this.props.onReload();
                            }
                        }
                    })
                } else {
                    SNotification.send({
                        key: "editar_descripcion",
                        title: "Sin permisos de edición",
                        body: "Tu rol dentro del sistema no permite realizar modificaciones en este módulo. Si crees que esto es un error, comunícate con el administrador del sistema.",
                        color: STheme.color.danger,
                        time: 9000,
                    });
                }
            }} >
                <SIconApp name='Pencil' width={20} height={20} fill={STheme.color.text} />
            </SView>
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
            render={(cuota, key, i) => {
                var saldo_capital = this.state.totales.subtotal;
                var total_a_pagar = this.state.totales.total_a_pagar;
                var saldo = 0;
                var monto = 0;
                let moneda = this.state.monedas.find(m => m.key === cuota.key_moneda);
                return this.totales_item({
                    codigo: cuota.codigo,
                    descripcion: cuota.descripcion,
                    monto: SMath.formatMoney(cuota.monto),
                    fecha: cuota.fecha,
                    interes: SMath.formatMoney(cuota.monto_interes),
                    capital: SMath.formatMoney(cuota.monto_capital),
                    saldo_capital: SMath.formatMoney(cuota.saldo_capital),
                    pagos_acumulados: SMath.formatMoney(cuota.pagos_acumulados),
                    total_a_pagar: SMath.formatMoney(total_a_pagar),
                    saldo: SMath.formatMoney(cuota.monto - cuota.total_amortizado),
                    amortizado: (!cuota.total_amortizado) ? 0 : cuota.total_amortizado,
                    moneda: moneda.observacion,
                    cuota: cuota
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
    detalleCuotas() {
        if (!this.state.cuotas) return null;
        let pagado = false;
        let mensaje = "";
        console.log("Cuotas: ", this.state.cuotas)
        let cuotasAll = this.state.cuotas;
        let monto_total = 0;
        cuotasAll.map((obj) => {
            monto_total += parseFloat(obj.total_amortizado ?? 0);
        })
        this.state.total_amortizado = monto_total;
        if (monto_total == this.state.totales.total_a_pagar) {
            pagado = true;
            mensaje = "Cliente al día: Todas las cuotas están pagadas.";
        } else if (monto_total > 0) {
            pagado = false;
            mensaje = "Cliente moroso: Tiene cuotas pendientes de pago.";
        } else {
            pagado = false;
            mensaje = "Cliente moroso: No ha pagado ninguna cuota.";
        }
        console.log("Monto total amortizado: ", monto_total, " -- Total a pagar: ", this.state.totales.total_a_pagar)
        return <SView col={"xs-12"} padding={10} center style={{
            backgroundColor: STheme.color.card,
            borderTopRightRadius: 8,
            borderTopLeftRadius: 8,
        }}>
            <SView col={"xs-12"} row center>
                <SView center col={"xs-10"} style={{ backgroundColor: pagado ? STheme.color.success + "30" : STheme.color.error + "30", borderRadius: 6, borderWidth: 1, borderColor: pagado ? STheme.color.success : STheme.color.error, padding: 8 }}>
                    <SText center fontSize={15} >{mensaje}</SText>
                </SView>
                {/* 
                <SText bold col={"xs-3"}>Cuota inicial: Bs. {SMath.formatMoney(this.state.cuota_inicial)}</SText>
                <SView flex />
                <SText bold col={"xs-3"}>Total a pagar: Bs. {SMath.formatMoney(this.state.totales.total_a_pagar)}</SText> */}
            </SView>
        </SView>
    }

    detalleCuotasFooter() {
        if (!this.state.cuotas) return null;
        let pagadoFooter = false;
        if (this.state.total_amortizado == this.state.totales.total_a_pagar) {
            pagadoFooter = true;
        } else {
            pagadoFooter = false;
        }
        console.log("moneda; ", this.state.moneda)

        return <SView col={"xs-12"} padding={10} center style={{
            backgroundColor: STheme.color.card,
            borderBottomRightRadius: 8,
            borderBottomLeftRadius: 8,
            // borderBottomColor: STheme.color.card,
            // borderBottomWidth: 3
        }}>
            <SView col={"xs-12"} row center>
                {!pagadoFooter &&
                    <SView width={125} row height={40} padding={5} center style={{ backgroundColor: STheme.color.primary, borderRadius: 6 }} onPress={() => {
                        // SNavigation.navigate("venta_plan_pago_registro", { key_compra_venta: this.data.key })
                    }}>
                        <SIconApp name='add1' width={16} height={16} fill={STheme.color.text} />
                        <SText flex center> Agregar cuota </SText>
                    </SView>
                }
                <SView flex />
                <SView row style={{ alignItems: "flex-end" }} >
                    <SView row center>
                        <SText bold>Total amortizado:</SText>
                        <SView width={8} />
                        <SText bold padding={10} backgroundColor={pagadoFooter ? STheme.color.success + "70" : STheme.color.error + "60"}>
                            {this.state.moneda.observacion} {SMath.formatMoney(this.state.total_amortizado)}
                        </SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }



    render() {
        this.data = this.props.data;

        let t = MDL.compra_venta.getTotales(this.data)

        let cuotas = this.data.cuotas
        let monedas = this.state.monedas
        if (!monedas) return null;
        let moneda = monedas.find(m => m.key === this.data.key_moneda);
        this.state.moneda = moneda;
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
            <SText bold >PLAN DE PAGOS</SText>
            <SHr height={10} />
            {this.editor()}
            {this.detalleCuotas()}
            <SHr height={10} />
            {this.getCuotas()}
            <SHr height={5} />
            {this.detalleCuotasFooter()}
            <SHr height={10} />
        </SView>
    }
}
