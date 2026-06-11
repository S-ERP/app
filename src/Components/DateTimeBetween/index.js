import React, { Component } from 'react';
import { UIManager, findNodeHandle } from 'react-native';
import { SButtom, SDate, SInput, SPopup, SText, STheme, SView } from 'servisofts-component';
import DatePickerCalendar from 'servisofts-table/Components/DatePickerCalendar';
import InputSelector from '../Selectores/InputSelector';

const MODOS = [
    { key: 'dia', label: 'Día' },
    { key: 'semana', label: 'Semana' },
    { key: 'mes', label: 'Mes' },
    { key: 'ano', label: 'Año' },
    { key: 'entre_fechas', label: 'Entre fechas' },
];

type TypeProps = {
    fecha_inicio: "yyyy-MM-dd",
    fecha_fin: "yyyy-MM-dd",
    onChange: Function,
    modo?: string,
}

export default class DateTimeBetween extends Component<TypeProps> {
    state = {
        modo: this.props.modo ?? 'mes',
        fecha_inicio: this.props.fecha_inicio,
        fecha_fin: this.props.fecha_fin,
    }

    componentDidMount() {
        if (this.state.modo !== 'entre_fechas') {
            const range = this.getDateRange(this.state.modo);
            if (range) this.setState(range, this.handleChange);
        }
    }

    getDateRange(mode) {
        const today = new Date();
        const pad = n => String(n).padStart(2, '0');
        const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        switch (mode) {
            case 'dia':
                return { fecha_inicio: fmt(today), fecha_fin: fmt(today) };
            case 'semana': {
                const day = today.getDay();
                const diffToMonday = day === 0 ? -6 : 1 - day;
                const monday = new Date(today);
                monday.setDate(today.getDate() + diffToMonday);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                return { fecha_inicio: fmt(monday), fecha_fin: fmt(sunday) };
            }
            case 'mes': {
                const first = new Date(today.getFullYear(), today.getMonth(), 1);
                const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                return { fecha_inicio: fmt(first), fecha_fin: fmt(last) };
            }
            case 'ano': {
                const first = new Date(today.getFullYear(), 0, 1);
                const last = new Date(today.getFullYear(), 11, 31);
                return { fecha_inicio: fmt(first), fecha_fin: fmt(last) };
            }
            default:
                return null;
        }
    }

    handleChange = () => {
        if (this.props.onChange) {
            this.props.onChange({
                fecha_inicio: this.state?.fecha_inicio,
                fecha_fin: this.state?.fecha_fin,
            });
        }
    };

    selectModo(modo) {
        if (modo === 'entre_fechas') {
            this.setState({ modo });
            return;
        }
        const range = this.getDateRange(modo);
        this.setState({ modo, ...range }, this.handleChange);
    }

    renderSelector() {
        return (
            <SView style={{ width: 120, position: 'relative', }}>
                <SText style={{
                    position: 'absolute',
                    top: -2, left: 4, zIndex: 1,
                    fontSize: 10,
                    color: STheme.color.lightGray,
                    backgroundColor: STheme.color.background + "AA",
                    borderRadius: 4,
                    paddingHorizontal: 4,
                }}>Período</SText>
                <SView style={{
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: STheme.color.card,
                    justifyContent: 'center',
                }}>
                    <InputSelector
                        defaultValue={this.state.modo}
                        options={MODOS.map(m => ({ label: m.label, value: m.key }))}
                        onSelect={(option) => this.selectModo(option.value)}
                        customStyle={"erp"}
                    />
                </SView>
            </SView>
        );
    }

    render() {
        const { modo } = this.state;
        return (
            <SView row col={"xs-12"} style={{ paddingTop: 8, alignItems: 'center', gap: 8, }}>
                {this.renderSelector()}
                {modo === 'entre_fechas' && <>
                    <SView style={{ width: 100 }}>
                        <SInput
                            label={"Desde"}
                            ref={ref => this.inputRef = ref}
                            customStyle={"erp"}
                            value={this.state?.fecha_inicio}
                            onChange={(e) => { console.log("fecha_inicio_cambio", e); }}
                            onPress={() => {
                                const handle = findNodeHandle(this.inputRef);
                                if (!handle) return;
                                UIManager.measureInWindow(handle, (x, y, width, height) => {
                                    SPopup.open({
                                        key: "popup-fecha-inicio",
                                        style: {
                                            width: 220, height: 345, zIndex: 9999,
                                            position: "absolute",
                                            backgroundColor: STheme.color.background,
                                            borderRadius: 4,
                                            left: x, top: y + height + 2,
                                        },
                                        content: <SView row center>
                                            <DatePickerCalendar color={"#fff"} accentColor={"#000"}
                                                defaultValue={this.state?.fecha_inicio_}
                                                onChange={e => { this.setState({ fecha_inicio_: e }); }} />
                                            <SView row>
                                                <SButtom style={{ height: 35 }} type={"danger"} onPress={() => {
                                                    SPopup.close("popup-fecha-inicio");
                                                }}>Cancelar</SButtom>
                                                <SView width={5} />
                                                <SButtom style={{ height: 35 }} type={"outline"} onPress={() => {
                                                    SPopup.close("popup-fecha-inicio");
                                                    this.setState(
                                                        { fecha_inicio: this.state.fecha_inicio_.toString("yyyy-MM-dd") },
                                                        this.handleChange
                                                    );
                                                }}>Aceptar</SButtom>
                                            </SView>
                                        </SView>
                                    });
                                });
                            }}
                        />
                    </SView>
                    <SView style={{ width: 100 }}>
                        <SInput
                            label={"Hasta"}
                            ref={ref => this.inputRef_ = ref}
                            customStyle={"erp"}
                            value={this.state?.fecha_fin}
                            onChange={(e) => { console.log("fecha_fin_cambio", e); }}
                            onPress={() => {
                                const handle = findNodeHandle(this.inputRef_);
                                if (!handle) return;
                                UIManager.measureInWindow(handle, (x, y, width, height) => {
                                    SPopup.open({
                                        key: "popup-fecha-fin",
                                        style: {
                                            width: 220, height: 345, zIndex: 9999,
                                            position: "absolute",
                                            backgroundColor: STheme.color.background,
                                            borderRadius: 4,
                                            left: x, top: y + height + 2,
                                        },
                                        content: <SView row center>
                                            <DatePickerCalendar color={"#fff"} accentColor={"#000"}
                                                defaultValue={this.state?.fecha_fin_}
                                                onChange={e => { this.setState({ fecha_fin_: e }); }} />
                                            <SView row>
                                                <SButtom style={{ height: 35 }} type={"danger"} onPress={() => {
                                                    SPopup.close("popup-fecha-fin");
                                                }}>Cancelar</SButtom>
                                                <SView width={5} />
                                                <SButtom style={{ height: 35 }} type={"outline"} onPress={() => {
                                                    SPopup.close("popup-fecha-fin");
                                                    this.setState(
                                                        { fecha_fin: this.state.fecha_fin_.toString("yyyy-MM-dd") },
                                                        this.handleChange
                                                    );
                                                }}>Aceptar</SButtom>
                                            </SView>
                                        </SView>
                                    });
                                });
                            }}
                        />
                    </SView>
                </>}
            </SView>
        );
    }
}
