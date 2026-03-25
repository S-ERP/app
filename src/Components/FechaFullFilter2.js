import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SDate, SInput, SHr, SText, STheme, SThread, SView } from 'servisofts-component'
import InputSelector from './Selectores/InputSelector';

export default class FechaFullFilter2 extends Component {
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

    callOnChange = () => {
        this.props.onChange?.({
            key_opciones: this.state.key_opciones,
            entre_fecha: this.state.entre_fecha,
            fecha_inicio: this.state.fecha_inicio,
            fecha_fin: this.state.fecha_fin,
        });
    }

    applyDateRange = (key_opciones) => {
        const hoy = new Date();
        let inicio = hoy,
            fin = hoy;
        switch (key_opciones) {
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
                inicio = this.parseLocalDate(this.state.fecha_inicio || this.formatDateTime(hoy));
                fin = this.parseLocalDate(this.state.fecha_fin || this.formatDateTime(hoy), 23);
                break;
            default:
                inicio = fin = hoy;
        }
        this.setState({
            key_opciones,
            entre_fecha: key_opciones === "entre",
            fecha_inicio: this.formatDateTime(inicio),
            fecha_fin: this.formatDateTime(fin),
        }, this.callOnChange);
    }

    render() {
        const { label } = this.props;
        const filtroLabel = label ? label.toUpperCase() : "FILTRO TIEMPO";

        return (
            <SView col="xs-12" row center style={{ paddingHorizontal: 2 }}>
                <SView
                    col="xs-12"
                    style={{
                        backgroundColor: STheme.color.card,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: STheme.color.lightGray + "40",
                        padding: 8,
                    }}
                >
                    <SView row center style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'center' }}>
                        <SView flex={1} height={30} style={{ position: 'relative' }}>
                            <SText fontSize={9} color={STheme.color.lightGray} bold style={{ position: 'absolute', top: -6, left: 0 }}>
                                {filtroLabel}
                            </SText>
                            <SView
                                width={"100%"}
                                height={30}
                                style={{
                                    backgroundColor: STheme.color.card,
                                    borderRadius: 2,
                                    borderWidth: 1,
                                    borderColor: STheme.color.lightGray + "40",
                                    overflow: "hidden",
                                    elevation: 1,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 1.5,
                                }}>
                                <InputSelector
                                    type="custom"
                                    customStyle="erp"
                                    placeholder="Selecciona rango"
                                    value={this.state.key_opciones}
                                    defaultValue={this.state.key_opciones}
                                    style={{
                                        fontSize: 13, color: STheme.color.text, paddingHorizontal: 10, backgroundColor: STheme.color.card,
                                        opacity: 0.6,
                                        height: 40,
                                        width: '100%'
                                    }}
                                    options={this.state.opciones.map(f => ({ label: f.description, value: f.key, data: f }))}
                                    onSelect={val => {
                                        if (!val) return;
                                        this.applyDateRange(val.value);
                                    }}
                                />
                            </SView>
                        </SView>

                        {this.state.entre_fecha && (
                            <>
                                <SView col="xs-3.5" style={{ minWidth: 130, position: 'relative' }}>
                                    <SText fontSize={9} color={STheme.color.lightGray} bold style={{ position: 'absolute', top: -6, left: 0, width: "100%" }}>
                                        FECHA INICIO
                                    </SText>
                                    <SInput
                                        type="date"
                                        value={this.state.fecha_inicio}
                                        onChangeText={fecha_inicio => this.setState({ fecha_inicio }, this.callOnChange)}
                                        style={{ height: 28 }}
                                    />
                                </SView>

                                <SView col="xs-3.5" style={{ minWidth: 130, position: 'relative' }}>
                                    <SText fontSize={9} color={STheme.color.lightGray} bold style={{ position: 'absolute', top: -6, left: 0, width: "100%" }}>
                                        FECHA FIN
                                    </SText>
                                    <SInput
                                        type="date"
                                        value={this.state.fecha_fin}
                                        onChangeText={fecha_fin => this.setState({ fecha_fin }, this.callOnChange)}
                                        style={{ height: 28 }}
                                    />
                                </SView>
                            </>
                        )}

                        <SView
                            style={{
                                borderRadius: 2,
                                borderWidth: 1,
                                borderColor: STheme.color.lightGray + "40",
                                width: 80,
                                height: 28,
                                justifyContent: 'center',
                            }}
                            card
                            backgroundColor="#fff"
                            center
                            onPress={this.callOnChange}
                        >
                            <SText center>FILTRAR</SText>
                        </SView>
                    </SView>
                </SView>
            </SView>
        );
    }
}