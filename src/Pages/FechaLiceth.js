import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SDate, SForm, SInput, SNavigation, SText, STheme, SThread, SView } from 'servisofts-component'
import InputSelector from '../Components/Selectores/InputSelector'
// import InputSelector from '../Selectores/InputSelector'
// import PButtom from '../PButtom'

type DataType = {
    fecha_inicio: String,
    fecha_fin: String,
}
type SelectEntreFechasProps = {
    onChange: (data: DataType) => void
} & DataType
export default class Fechas extends Component<SelectEntreFechasProps> {
    constructor(props) {
        super(props);

        this.state = {
            fecha_inicio: this.props?.fecha_inicio ?? new SDate().toString("yyyy-MM-dd"),
            fecha_fin: this.props?.fecha_fin ?? new SDate().toString("yyyy-MM-dd"),
            opciones: [{ key: "hoy", description: "Hoy" }, { key: "esta_semana", description: "Esta Semana" }, { key: "este_mes", description: "Este Mes" }, { key: "este_año", description: "Este Año" }, { key: "entre", description: "Entre Fechas" }],
            entre_fecha: false,
            key_opciones: null,
        }


        // this.state.fecha_inicio = SNavigation.getParam("fecha_inicio", SelectEntreFechas.defaultProps.fecha_inicio)
        // this.state.fecha_fin = SNavigation.getParam("fecha_inicio", SelectEntreFechas.defaultProps.fecha_fin)
    }

    componentDidMount() {
        new SThread(100, "kekeke").start(() => {
            this.props.onChange(this.state)
        })
    }

    // handleChange(key, e) {
    //     // this.setState({ fecha_fin: e })
    //     // console.log(e, key)
    //     if (this.state[key] == e) return;
    //     this.state[key] = e;
    //     this.props.onChange(this.state)

    // }
    handleChange(key, e) {
        if (this.state[key] == e) return;
        this.state[key] = e;
        this.props.onChange(this.state)
    }

    formatDate = (date) => {
        return date.toISOString().split("T")[0]; // yyyy-MM-dd
    };

    formatDateTime = (date, hour = 7) => {
        const d = new Date(date);
        d.setHours(hour, 0, 0, 0);

        const pad = n => n.toString().padStart(2, "0");

        return (
            d.getFullYear() + "-" +
            pad(d.getMonth() + 1) + "-" +
            pad(d.getDate())
            // pad(d.getHours()) + ":" +
            // pad(d.getMinutes()) + ":" +
            // pad(d.getSeconds())
        );
    };

    startOfYear = (date = new Date()) => {
        return new Date(date.getFullYear(), 0, 1);
    };

    endOfYear = (date = new Date()) => {
        return new Date(date.getFullYear(), 11, 31);
    };

    startOfWeek = (date = new Date()) => {
        const d = new Date(date);
        const day = d.getDay() || 7; // domingo = 7
        d.setDate(d.getDate() - day + 1);
        return d;
    };

    endOfWeek = (date = new Date()) => {
        const d = this.startOfWeek(date);
        d.setDate(d.getDate() + 6);
        return d;
    };

    startOfMonth = (date = new Date()) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    endOfMonth = (date = new Date()) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    render() {
        return <SView col="xs-12" row center>
            <SView col="xs-10">
                <SForm
                    key={this.state.entre_fecha ? "entre" : "normal"}
                    ref={ref => this.form = ref}
                    row
                    style={{ justifyContent: 'space-between' }}
                    inputs={{
                        key_opciones: {
                            placeholder: "Filtro tiempo",
                            type: "custom",
                            col: this.state.entre_fecha ? "xs-5.5" : "xs-10.5",
                            customInputClass: InputSelector,
                            defaultValue: this.state.key_opciones,
                            options: this.state.opciones.map(f => ({
                                label: f.description,
                                value: f.key,
                                data: f
                            })),

                            onSelect: (val) => {
                                console.log("VAL", val);
                                if (val.value == "entre") {
                                    this.setState({ entre_fecha: true });
                                } else {
                                    this.setState({ entre_fecha: false });
                                }
                                this.setState({ key_opciones: val.value });
                            }

                        },

                        fecha_inicio: {
                            label: "Fecha Inicio",
                            placeholder: "Fecha Inicio",
                            type: "date",
                            col: "xs-3",
                            defaultValue: this.state.fecha_inicio,
                            style: { display: this.state.entre_fecha ? "block" : "none" }
                        },
                        fecha_fin: {
                            label: "Fecha Fin",
                            placeholder: "Fecha Fin",
                            type: "date",
                            col: "xs-3",
                            defaultValue: this.state.fecha_fin,
                            style: { display: this.state.entre_fecha ? "block" : "none" }
                        },

                    }}

                    onSubmit={(values) => {
                        const hoy = new Date();

                        let fecha_inicio = null;
                        let fecha_fin = null;
                        console.log("OPCION ", values.key_opciones)

                        switch (values.key_opciones) {

                            case "hoy":
                                fecha_inicio = hoy;
                                fecha_fin = hoy;
                                break;

                            case "esta_semana":
                                fecha_inicio = this.startOfWeek(hoy);
                                fecha_fin = this.endOfWeek(hoy);
                                break;

                            case "este_mes":
                                fecha_inicio = this.startOfMonth(hoy);
                                fecha_fin = this.endOfMonth(hoy);
                                break;

                            case "este_año":
                                fecha_inicio = this.startOfYear(hoy);
                                fecha_fin = this.endOfYear(hoy);
                                break;

                            case "entre":
                                // fechas vienen del formulario
                                fecha_inicio = new Date(values.fecha_inicio);
                                fecha_fin = new Date(values.fecha_fin);
                                console.log("ENTROOOO")
                                break;

                            default:
                                fecha_inicio = hoy;
                                fecha_fin = hoy;
                        }
                        console.log("FECHAS", fecha_inicio, fecha_fin);
                        this.handleChange("fecha_inicio", this.formatDateTime(fecha_inicio));
                        this.handleChange("fecha_fin", this.formatDateTime(fecha_fin, 23));

                        this.setState({
                            fecha_inicio: this.formatDateTime(fecha_inicio),
                            fecha_fin: this.formatDateTime(fecha_fin, 23),
                        });
                        console.log(this.state.fecha_inicio + " - " + this.state.fecha_fin)
                    }}
                />
            </SView>

            {/* <PButtom flex type='primary' onPress={() => {
                if (this.form) this.form.submit();
            }}>FILTRAR</PButtom> */}
            <SView col="xs-2" center>
                <SView width={70} height={38} card center
                    style={{ top: this.state.entre_fecha ? 8 : -26 }}
                    onPress={() => {
                        if (this.form) this.form.submit();
                    }}>
                    <SText center>FILTRAR</SText>
                </SView>
            </SView>


            {/* <SView row col={"xs-12 sm-6"}  center style={{paddingLeft:2, paddingRight:2}}>
                <SText>Desde: </SText>
                <SInput flex type='date' style={{
                    padding: 0
                }} height={this.props.height ?? 30} defaultValue={this.state.fecha_inicio} onChangeText={this.handleChange.bind(this, "fecha_inicio")} />
            </SView>
            <SView row col={"xs-12 sm-6"}  center style={{paddingLeft:2, paddingRight:2}}>
                <SText>Hasta: </SText>
                <SInput flex type='date' height={this.props.height ?? 30} style={{
                    padding: 0
                }} defaultValue={this.state.fecha_fin} onChangeText={this.handleChange.bind(this, "fecha_fin")} />
            </SView> */}
        </SView>
    }
}