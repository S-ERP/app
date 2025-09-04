import React, { Component } from 'react';
import { View, Text, UIManager, findNodeHandle } from 'react-native';
import { SButtom, SDate, SHr, SInput, SPopup, STheme, SView } from 'servisofts-component';
import DatePickerCalendar from 'servisofts-table/Components/DatePickerCalendar';

type TypeProps = {
    fecha_inicio: "yyyy-MM-dd",
    fecha_fin: "yyyy-MM-dd",
    onChange: Function,
}
export default class DateTimeBetween extends Component<TypeProps> {
    constructor(props) {
        super(props);
    }

    handleChange = () => {
        // cuando cambien las fechas, avisamos al padre
        if (this.props.onChange) {
            this.props.onChange({
                // fecha_inicio: this.state?.fecha_inicio_raw, // fecha en formato Date
                // fecha_fin: this.state?.fecha_fin_raw, // fecha en formato Date

                fecha_inicio: this.state?.fecha_inicio, // fecha en formato "yyyy-MM-dd"
                fecha_fin: this.state?.fecha_fin, // fecha en formato "yyyy-MM-dd"
            });
        }
    };

    render() {
        return (<SView row col={"xs-12"}  >
            <SView col={"xs-5.5"}>
                <SInput
                    label={"Desde"}
                    ref={ref => this.inputRef = ref}
                    value={this.state?.fecha_inicio}
                    onChange={(e) => {
                        console.log("fecha_inicio_cambio", e);
                    }}
                    style={{
                        width: 120,
                    }}
                    onPress={(e) => {
                        const handle = findNodeHandle(this.inputRef);
                        if (!handle) return;

                        UIManager.measureInWindow(handle, (x, y, width, height) => {
                            console.log("open", e);
                            console.log("measureInWindow", { x, y, width, height });
                            SPopup.open({
                                key: "popup-entre-fechas",
                                style: {
                                    width: 220, height: 340, Zindex: 9999,
                                    position: "absolute",
                                    left: x,                  // alineado al borde izquierdo del input
                                    top: y + height + 2,      // justo debajo del input (+ un margen)
                                },
                                content: <SView row center>
                                    <DatePickerCalendar color={"#fff"} accentColor={"#000"}
                                        defaultValue={this.state?.fecha_inicio_}
                                        onChange={e => {
                                            console.log("fecha_inicio", e);
                                            this.setState({ fecha_inicio_: e });
                                        }} />
                                    <SView row >
                                        <SButtom style={{ height: 35 }} type={"danger"} onPress={() => {
                                            SPopup.close("popup-entre-fechas");
                                        }}>Cancelar</SButtom>
                                        <SView width={5} />
                                        <SButtom style={{ height: 35 }} type={"outline"} onPress={() => {
                                            SPopup.close("popup-entre-fechas");
                                            // this.setState({ fecha_inicio: this.state.fecha_inicio_.toString("yyyy-MM-dd") });
                                            this.setState(
                                                { fecha_inicio: this.state.fecha_inicio_.toString("yyyy-MM-dd")},
                                                // { fecha_inicio_raw : this.state.fecha_inicio_}, // fecha en formato Date
                                                this.handleChange // ⬅️ avisamos al padre
                                            );
                                            console.log("entro", this.state.fecha_inicio)
                                        }}>Aceptar</SButtom>
                                    </SView>
                                </SView>
                            });
                        })
                    }}
                />
            </SView>
            <SView col={"xs-1"} />
            <SView col={"xs-5.5"}>
                <SInput
                    label={"Hasta"}
                    ref={ref => this.inputRef_ = ref}
                    value={this.state?.fecha_fin}
                    onChange={(e) => {
                        console.log("fecha_fin_cambio", e);
                    }}
                    style={{
                        width: 120,
                    }}
                    onPress={(e) => {
                        const handle = findNodeHandle(this.inputRef_);
                        if (!handle) return;

                        UIManager.measureInWindow(handle, (x, y, width, height) => {
                            console.log("open", e);
                            SPopup.open({
                                key: "popup-entre-fechas",
                                style: {
                                    width: 220, height: 340, Zindex: 9999,
                                    position: "absolute",
                                    left: x,                  // alineado al borde izquierdo del input
                                    top: y + height + 2,      // justo debajo del input (+ un margen)
                                },
                                content: <SView row center>
                                    <DatePickerCalendar color={"#fff"} accentColor={"#000"}
                                        defaultValue={this.state?.fecha_fin_}
                                        onChange={e => {
                                            console.log("fecha_fin", e);
                                            this.setState({ fecha_fin_: e });
                                        }} />
                                    <SView row >
                                        <SButtom style={{ height: 35 }} type={"danger"} onPress={() => {
                                            SPopup.close("popup-entre-fechas");
                                        }}>Cancelar</SButtom>
                                        <SView width={5} />
                                        <SButtom style={{ height: 35 }} type={"outline"} onPress={() => {
                                            SPopup.close("popup-entre-fechas");
                                            // this.setState({ fecha_fin: this.state.fecha_fin_.toString("yyyy-MM-dd") });
                                            this.setState(
                                                { fecha_fin: this.state.fecha_fin_.toString("yyyy-MM-dd") },
                                                // { fecha_fin_raw : this.state.fecha_fin_.toString("yyyy-MM-dd")+ "T23:59:59"}, // fecha en formato Date
                                                this.handleChange // ⬅️ avisamos al padre
                                            );
                                            console.log("entro", this.state.fecha_fin)
                                        }}>Aceptar</SButtom>
                                    </SView>
                                </SView>
                            });
                        })
                    }}
                />

            </SView>
        </SView>
        );
    }
}

