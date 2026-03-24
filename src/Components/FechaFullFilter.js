import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SDate, SForm, SHr, SText, STheme, SThread, SView } from 'servisofts-component'
import InputSelector from './Selectores/InputSelector';

export default class FechaFullFilter extends Component {
    constructor(props) {
        super(props);

        const hoy = new Date();
        const key_opciones = props.key_opciones ?? "hoy";

        // Determinar fechas iniciales según key_opciones
        let inicio, fin;
        switch (key_opciones) {
            case "hoy":
                inicio = fin = hoy;
                break;
            case "esta_semana":
                inicio = this.startOfWeek(hoy);
                fin = this.endOfWeek(hoy);
                break;
            case "este_mes":
            default:
                inicio = this.startOfMonth(hoy);
                fin = this.endOfMonth(hoy);
                break;
            case "este_año":
                inicio = this.startOfYear(hoy);
                fin = this.endOfYear(hoy);
                break;
            case "entre":
                inicio = props.fecha_inicio ? this.parseLocalDate(props.fecha_inicio) : hoy;
                fin = props.fecha_fin ? this.parseLocalDate(props.fecha_fin, 23) : hoy;
                break;
        }

        this.state = {
            fecha_inicio: this.formatDateTime(inicio),
            fecha_fin: this.formatDateTime(fin),
            opciones: [
                { key: "hoy", description: "Hoy" },
                { key: "esta_semana", description: "Esta Semana" },
                { key: "este_mes", description: "Este Mes" },
                { key: "este_año", description: "Este Año" },
                { key: "entre", description: "Entre Fechas" }
            ],
            entre_fecha: key_opciones === "entre",
            key_opciones: key_opciones,
        }
    }

    componentDidMount() {
        new SThread(100).start(() => {
            this.props.onChange(this.state)
        })
    }

    /** ✅ FIX TIMEZONE */
    parseLocalDate = (dateString, hour = 0) => {
        const [y, m, d] = dateString.split("-").map(Number);
        return new Date(y, m - 1, d, hour, 0, 0, 0);
    };

    formatDateTime = (date) => {
        const pad = n => n.toString().padStart(2, "0");
        return (
            date.getFullYear() + "-" +
            pad(date.getMonth() + 1) + "-" +
            pad(date.getDate())
        );
    };

    startOfYear = (date = new Date()) => new Date(date.getFullYear(), 0, 1);
    endOfYear = (date = new Date()) => new Date(date.getFullYear(), 11, 31);
    startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
    endOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

    startOfWeek = (date = new Date()) => {
        const d = new Date(date);
        const day = d.getDay() || 7;
        d.setDate(d.getDate() - day + 1);
        return d;
    };

    endOfWeek = (date = new Date()) => {
        const d = this.startOfWeek(date);
        d.setDate(d.getDate() + 6);
        return d;
    };

    render() {
        return (
            <SView col="xs-12" row center height={70}>
                <SView flex backgroundColor="transparent" height={70}>
                    <SForm
                        key={this.state.entre_fecha ? "entre" : "normal"}
                        ref={ref => this.form = ref}
                        row
                        style={{ justifyContent: 'space-between', }}
                        inputs={{
                            key_opciones: {
                                placeholder: "Filtro tiempo",
                                placeholderTextColor:"red",
                                type: "custom",
                                col: this.state.entre_fecha ? "xs-4" : "xs-12",
                                customInputClass: InputSelector,
                                defaultValue: this.state.key_opciones,
                                options: this.state.opciones.map(f => ({
                                    label: f.description,
                                    value: f.key,
                                    data: f
                                })),
                                onSelect: (val) => {
                                    this.setState({
                                        entre_fecha: val.value === "entre",
                                        key_opciones: val.value
                                    })
                                }
                            },
                            fecha_inicio: {
                                label: "Fecha Inicio",
                                type: "date",
                                col: "xs-3.9",
                                defaultValue: this.state.fecha_inicio,
                                style: { display: this.state.entre_fecha ? "block" : "none" }
                            },
                            fecha_fin: {
                                label: "Fecha Fin",
                                type: "date",
                                col: "xs-3.9",
                                defaultValue: this.state.fecha_fin,
                                style: { display: this.state.entre_fecha ? "block" : "none" }
                            },
                        }}
                        onSubmit={(values) => {
                            const hoy = new Date();
                            let inicio, fin;

                            switch (values.key_opciones) {
                                case "hoy":
                                    inicio = fin = hoy;
                                    break;
                                case "esta_semana":
                                    inicio = this.startOfWeek(hoy);
                                    fin = this.endOfWeek(hoy);
                                    break;
                                case "este_mes":
                                    inicio = this.startOfMonth(hoy);
                                    fin = this.endOfMonth(hoy);
                                    break;
                                case "este_año":
                                    inicio = this.startOfYear(hoy);
                                    fin = this.endOfYear(hoy);
                                    break;
                                case "entre":
                                    inicio = this.parseLocalDate(values.fecha_inicio, 0);
                                    fin = this.parseLocalDate(values.fecha_fin, 23);
                                    break;
                                default:
                                    inicio = fin = hoy;
                            }

                            this.setState({
                                fecha_inicio: this.formatDateTime(inicio),
                                fecha_fin: this.formatDateTime(fin)
                            }, () => this.props.onChange(this.state));
                        }}
                    />
                </SView>

                <SView width={4} height={"100%"} backgroundColor="transparent" ></SView>

                <SView
                    style={{
                        top: 15, borderRadius: 2,
                        borderWidth: 1, borderColor: STheme.color.lightGray + "40",
                    }}
                    card
                    backgroundColor="#fff"
                    width={80}
                    height={40}
                    center
                    onPress={() => this.form?.submit()}>
                    <SText center>FILTRAR</SText>
                </SView>
            </SView>
        )
    }
}