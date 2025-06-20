import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SDate, SForm, SHr, SIcon, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import Background from 'servisofts-component/img/Background';



type PopupRellamadaType = {
    onRegister: (e: any) => void;
    onActualizar: (e: any) => void;
    onCancel?: () => void;
    defaultData?: any;
};

interface State {
    tiempo_cliente: string;
}

export default class PopupRellamada extends Component<PopupRellamadaType, State> {
    form: SForm | null = null;
    private _tiempo_manual: string = "";

    constructor(props: PopupRellamadaType) {
        super(props);
        const now = new SDate().addMinute(10).toString("hh:mm");
        this._tiempo_manual = props.defaultData?.tiempo_cliente || now;
        this.state = {
            tiempo_cliente: this._tiempo_manual,
        };
    }

    static open(props: PopupRellamadaType) {
        SPopup.open({
            key: "ppuprellamada",
            content: (
                <SView
                    backgroundColor={STheme.color.background}
                    style={{ borderRadius: 8, maxWidth: 320 }}
                    padding={16}
                    withoutFeedback
                    col={"xs-11"}
                >
                    <PopupRellamada
                        {...props}
                        onRegister={(e) => {
                            SPopup.close("ppuprellamada");
                            props.onRegister?.(e);
                        }}
                        onCancel={() => {
                            SPopup.close("ppuprellamada");
                            props.onCancel?.();
                        }}
                    />
                </SView>
            ),
        });
    }

    setTiempoCliente = (val: any) => {
        let tiempo = "";
        if (val?.nativeEvent?.text !== undefined) {
            tiempo = val.nativeEvent.text;
        } else {
            tiempo = (val ?? "").toString();
        }
        this._tiempo_manual = tiempo;
      
    };

    render() {
        const { defaultData } = this.props;

        return (
            <SView center>
                <SText bold>{defaultData ? "Editar Proyecto" : "Fecha de hora de rellamada"}</SText>
                <SHr height={20} />
                <SView row>
                    <SText justify fontSize={12} color={STheme.color.text} bold style={{ textAlign: "center" }}>
                        La rellamada solo se coloca a petición
                    </SText>
                    <SText fontSize={12} color={STheme.color.text} style={{ textAlign: "center" }}>
                        En otros casos utilice botón "Llamada fallida"
                    </SText>
                    <SText justify fontSize={12} color={STheme.color.text} bold style={{ textAlign: "center" }}>
                        Programar rellamadas no más de 1d 0h
                    </SText>
                </SView>
                <SHr height={15} />
                <BotonesOpciones
                    tiempo_cliente={this._tiempo_manual}
                    onChange={(e) => {
                        this._tiempo_manual = e.tiempo_cliente;
                        this.setState({ tiempo_cliente: e.tiempo_cliente });
                        this.form?.setValues?.({ tiempo_cliente: e.tiempo_cliente });
                    }}
                />
                <SForm
                    row
                    ref={(ref: any) => (this.form = ref)}
                    style={{ justifyContent: "space-between" }}
                    inputs={{
                        fecha: {
                            col: "xs-5.8",
                            label: "Fecha *",
                            type: "date",
                            autoFocus: true,
                            required: true,
                            defaultValue: new SDate().toString("yyyy-MM-dd"),
                            onSubmitEditing: () => this.form?.focus?.("tiempo_cliente"),
                        },
                        tiempo_cliente: {
                            col: "xs-5.8",
                            label: "Tiempo de cliente *",
                            type: "hour",
                            required: true,
                            defaultValue: this._tiempo_manual,
                            onChange: this.setTiempoCliente,
                            onSubmitEditing: () => this.form?.focus?.("comentario"),
                        },
                        comentario: {
                            col: "xs-12",
                            padding: 10,
                            label: "Comentario *",
                            type: "textArea",
                            defaultValue: defaultData?.descripcion || "",
                            onSubmitEditing: () => this.form?.submit?.(),
                        },
                        fijar: {
                            col: "xs-12",
                            label: "¿Fijar la llamada?",
                            type: "checkBox",
                            defaultValue: defaultData?.fijar || false,
                        },
                    }}
                    onSubmit={(e: any) => {
                        const comentario = e?.comentario?.trim?.();
                        const tiempo_cliente = this._tiempo_manual;

                        const data = {
                            ...defaultData,
                            ...e,
                            comentario,
                            tiempo_cliente,
                        };

                        const fecha = new SDate(data.fecha + 'T' + data.tiempo_cliente + ":00", "yyyy-MM-ddThh:mm:ss");
                        const dto = {
                            fecha_rellamada: fecha.toString("yyyy-MM-ddThh:mm:ssTZD"),
                            comentario: data.comentario,
                            fijar: data.fijar,
                        };

                        this.props?.onRegister?.(dto);
                        console.log("✅ Datos a registrar:", data);
                    }}
                />
                <SHr />
                <SView row col={"xs-12"}>
                    {this.props.onCancel && (
                        <>
                            <PButtom
                                flex
                                type="danger"
                                onPress={() => this.props.onCancel?.()}
                            >
                                CANCELAR
                            </PButtom>
                            <SView width={8} />
                        </>
                    )}
                    <PButtom flex type="secondary" onPress={() => this.form?.submit?.()}>
                        {defaultData ? "ACTUALIZAR" : "ACEPTAR"}
                    </PButtom>
                </SView>
            </SView>
        );
    }
}

class BotonesOpciones extends Component<{ tiempo_cliente: string, onChange?: (e: any) => void }> {
    time = (text: string) => {
        let date = new SDate();
        if (text.includes("min")) {
            const minutos = parseInt(text.split(" ")[0]);
            date.addMinute(minutos);
        } else if (text.includes("hrs")) {
            const horas = parseInt(text.split(" ")[0]);
            date.addHour(horas);
        }
        const horaBoton = date.toString("hh:mm");
        const esSeleccionado = this.props.tiempo_cliente === horaBoton;

        return (
            <SView col={"xs-2.4"} style={{ padding: 4 }}>
                <SView
                    padding={5}
                    style={{
                        backgroundColor: esSeleccionado ? STheme.color.danger : STheme.color.card,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={() => {
                        this.props.onChange?.({ tiempo_cliente: horaBoton });
                    }}
                >
                    <SText
                        fontSize={10}
                        color={esSeleccionado ? STheme.color.white : STheme.color.text}
                        bold
                    >
                        {text}
                    </SText>
                </SView>
            </SView>
        );
    };

    render() {
        return (
            <SView col={"xs-12"} row>
                {this.time("10 min")}
                {this.time("20 min")}
                {this.time("30 min")}
                {this.time("1 hrs")}
                {this.time("2 hrs")}
            </SView>
        );
    }
}
